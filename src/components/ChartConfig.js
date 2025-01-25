import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ScatterController,
    BarController,
    LineController
  } from 'chart.js';
  import zoomPlugin from 'chartjs-plugin-zoom';
  
  // Register Chart.js components with zoom plugin
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ScatterController,
    BarController,
    LineController,
    zoomPlugin
  );
  
  export default ChartJS;
  