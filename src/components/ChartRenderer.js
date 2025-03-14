import React, { useEffect, useRef, useMemo } from 'react';
import { Bar, Line, Scatter, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

const generateColors = (count, seed) => {
  const colors = [];
  const goldenRatio = 0.618033988749895;
  const hRange = [160, 220];
  
  for (let i = 0; i < count; i++) {
    const h = (hRange[0] + (i * goldenRatio * (hRange[1] - hRange[0])) % (hRange[1] - hRange[0]));
    const s = 70 + (Math.sin(seed + i) * 15);
    const l = 45 + (Math.cos(seed + i) * 10);
    colors.push(`hsl(${h},${s}%,${l}%)`);
  }
  return colors;
};


const ChartRenderer = ({ chartType, data, xAxis, yAxis, chartRef, colorSeed }) => {
  const chartInstance = useRef(null);

  const chartData = useMemo(() => {
    const dataMap = data.reduce((acc, row) => {
      const xValue = row[xAxis];
      const yValue = yAxis === 'count' ? 1 : Number(row[yAxis]);

      if (yAxis === 'count' || !isNaN(yValue)) {
        if (!acc[xValue]) acc[xValue] = [];
        acc[xValue].push(yValue);
      }
      return acc;
    }, {});

    const aggregatedData = Object.entries(dataMap).map(([x, values]) => ({
      x,
      y: yAxis === 'count' ? values.length : values.reduce((a, b) => a + b, 0) / values.length
    }));

    const colors = generateColors(aggregatedData.length, colorSeed);

    return {
      labels: aggregatedData.map(item => item.x),
      datasets: [{
        label: yAxis === 'count' ? `Count by ${xAxis}` : `${yAxis} by ${xAxis}`,
        data: aggregatedData.map(item => item.y),
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace(/(\d+)%\)/, '$1%)').replace('hsl', 'hsla').replace('%)', ', 1)')),
        borderWidth: 0,
      }]
    };
  }, [data, xAxis, yAxis, colorSeed]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: { boxWidth: 12 }
      },
      title: {
        display: true,
        text: yAxis === 'count' ? `Count by ${xAxis}` : `${yAxis} by ${xAxis}`,
        padding: { bottom: 15 }
      },
      zoom: {
        limits: { x: { min: 0, max: 100 }, y: { min: 0 } },
        zoom: {
          wheel: { enabled: true, speed: 0.1 },
          pinch: { enabled: true },
          mode: 'xy',
        },
        pan: {
          enabled: true,
          mode: 'xy',
          threshold: 5
        }
      }
    },
    animation: {
      duration: 300,
      easing: 'easeOutQuart'
    },
    elements: {
      point: { radius: 3, hoverRadius: 5 },
      line: { tension: 0.4 }
    }
  }), [xAxis, yAxis]);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [chartType]);

  useEffect(() => {
    if (chartRef.current?.resetZoom) {
      chartRef.current.resetZoom();
    }
  }, [colorSeed, chartRef]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {chartType === 'bar' && <Bar ref={chartRef} data={chartData} options={chartOptions} />}
      {chartType === 'line' && <Line ref={chartRef} data={chartData} options={chartOptions} />}
      {chartType === 'scatter' && <Scatter ref={chartRef} data={chartData} options={chartOptions} />}
      {chartType === 'pie' && <Pie ref={chartRef} data={chartData} options={chartOptions} />}
      {chartType === 'doughnut' && <Doughnut ref={chartRef} data={chartData} options={chartOptions} />}
    </div>
  );
};

export default ChartRenderer;