import React, { useEffect, useRef } from 'react';
import { Bar, Line, Scatter, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ChartRenderer = ({ chartType, data, xAxis, yAxis, chartRef }) => {
  const chartInstance = useRef(null);

  const generateChartData = () => {
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

    return {
      labels: aggregatedData.map(item => item.x),
      datasets: [{
        label: yAxis === 'count' ? `Count by ${xAxis}` : `${yAxis} by ${xAxis}`,
        data: aggregatedData.map(item => item.y),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
      }]
    };
  };

  const chartProps = {
    ref: chartRef,
    data: generateChartData(),
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: yAxis === 'count' ? `Count by ${xAxis}` : `${yAxis} by ${xAxis}`
        },
        zoom: {
          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            mode: 'xy',
          },
          pan: {
            enabled: true,
            mode: 'xy',
          }
        }
      }
    }
  };

  // Destroy the chart instance when the component unmounts or when the chart type changes
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [chartType]);

  switch (chartType) {
    case 'bar': return <Bar {...chartProps} />;
    case 'line': return <Line {...chartProps} />;
    case 'scatter': return <Scatter {...chartProps} />;
    case 'pie': return <Pie {...chartProps} />;
    case 'doughnut': return <Doughnut {...chartProps} />;
    default: return <Bar {...chartProps} />;
  }
};

export default ChartRenderer;