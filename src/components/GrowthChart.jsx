import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const SERIES = [
  { key: 'active', label: 'Active', borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.12)' },
  { key: 'saved', label: 'Saved', borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.12)' },
  { key: 'iul', label: 'IUL', borderColor: '#eab308', backgroundColor: 'rgba(234,179,8,0.12)' },
];

const baseConfig = () => ({
  type: 'line',
  data: {
    labels: ['Start'],
    datasets: SERIES.map((series) => ({
      label: series.label,
      data: [0.1],
      borderColor: series.borderColor,
      backgroundColor: series.backgroundColor,
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
    })),
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: {
        type: 'logarithmic',
        grid: { color: '#222' },
        ticks: {
          color: '#555',
          callback: (value) => `$${Number(value).toLocaleString()}`,
        },
      },
    },
  },
});

export default function GrowthChart({ points }) {
  const canvasRef = useRef(null);
  // Holding the instance in state (rather than a ref) guarantees the data effect
  // runs against the chart that actually exists, including after a remount.
  const [chart, setChart] = useState(null);

  useEffect(() => {
    const instance = new Chart(canvasRef.current, baseConfig());
    setChart(instance);
    return () => {
      instance.destroy();
      setChart(null);
    };
  }, []);

  useEffect(() => {
    if (!chart || !points?.length) return;

    const negative = points.some((point) => point.active < 0 || point.saved < 0 || point.iul < 0);
    chart.options.scales.y.type = negative ? 'linear' : 'logarithmic';
    chart.data.labels = points.map((point) => point.label);

    chart.data.datasets.forEach((dataset, index) => {
      dataset.data = points.map((point) => point[SERIES[index].key]);
      // A one- or two-point run has no line to draw yet, so show the dots.
      dataset.pointRadius = points.length <= 2 ? 3 : 0;
    });

    chart.update('none');
  }, [chart, points]);

  return (
    <div className="relative h-full min-h-0 w-full">
      <canvas ref={canvasRef} aria-label="Portfolio growth chart" />
    </div>
  );
}
