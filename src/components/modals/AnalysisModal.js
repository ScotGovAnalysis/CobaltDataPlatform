import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from '../../styles/Embedded_Modal.module.css';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  StackedLineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ScatterPlot as ScatterPlotIcon,
  Download as DownloadIcon,
  Compare as CompareIcon,
  Analytics as AnalyticsIcon,
  RestartAlt as ResetIcon
} from '@mui/icons-material';
import * as htmlToImage from 'html-to-image';
import * as XLSX from 'xlsx';
import { jStat } from 'jstat';
import { calculateMode } from '../../components/Utils';
import ChartRenderer from '../../components/ChartRenderer';
import ColumnStatisticsModal from '../../components/ColumnStatisticsModal';
import ComparisonModal from '../../components/ComparisonModal';
import AxisSelector from '../../components/AxisSelector';
import ChartTypeSelector from '../../components/ChartTypeSelector';

const AnalysisModal = ({ isOpen, onClose, data, columns, fileType = 'csv' }) => {
  const [xAxis, setXAxis] = useState(null);
  const [yAxis, setYAxis] = useState('count');
  const [chartType, setChartType] = useState('bar');
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [statisticsModalOpen, setStatisticsModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [comparisonColumns, setComparisonColumns] = useState([]);
  const [colorSeed, setColorSeed] = useState(Date.now());
  const [processedData, setProcessedData] = useState([]);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef(null);

  const chartTypes = [
    { type: 'bar', icon: <BarChartIcon /> },
    { type: 'line', icon: <LineChartIcon /> },
    { type: 'scatter', icon: <ScatterPlotIcon /> },
    { type: 'pie', icon: <PieChartIcon /> },
    { type: 'doughnut', icon: <PieChartIcon /> }
  ];

  const processJSONData = useCallback((rawData) => {
    try {
      if (!rawData) return { data: [], columns: [] };

      let normalizedData = [];
      let extractedColumns = new Set();

      if (Array.isArray(rawData)) {
        normalizedData = rawData;
      } else if (rawData.features) {
        normalizedData = rawData.features.map(f => ({
          ...f.properties,
          geometry: f.geometry
        }));
      } else if (typeof rawData === 'object') {
        normalizedData = Object.values(rawData);
      }

      normalizedData.forEach(item => {
        Object.keys(item).forEach(key => extractedColumns.add(key));
      });

      return {
        data: normalizedData,
        columns: Array.from(extractedColumns)
      };
    } catch (error) {
      console.error('JSON processing error:', error);
      setSnackbar({ open: true, message: 'Error processing JSON data', severity: 'error' });
      return { data: [], columns: [] };
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    let processed;
    
    if (fileType.toLowerCase().includes('json')) {
      processed = processJSONData(data);
    } else {
      processed = {
        data: data || [],
        columns: columns || []
      };
    }

    setProcessedData(processed.data);
    setAvailableColumns(processed.columns);
    if (processed.columns.length > 0) {
      setXAxis(processed.columns[0]);
    }
    setIsLoading(false);
  }, [data, columns, fileType, processJSONData]);

  const handleReset = useCallback(() => {
    setXAxis(availableColumns[0]);
    setYAxis('count');
    setChartType('bar');
    setColorSeed(Date.now());
    chartRef.current?.resetZoom();
    setSnackbar({ open: true, message: 'Chart reset successfully', severity: 'success' });
  }, [availableColumns]);

  const computeStatistics = useCallback((column) => {
    if (!processedData.length) return null;

    const values = processedData
      .map(row => {
        const val = row[column];
        return typeof val === 'string' ? parseFloat(val) : val;
      })
      .filter(val => !isNaN(val) && val !== null);

    if (values.length === 0) return null;

    return {
      count: values.length,
      mean: jStat.mean(values),
      median: jStat.median(values),
      mode: calculateMode(values),
      variance: jStat.variance(values),
      standardDeviation: jStat.stdev(values),
      min: jStat.min(values),
      max: jStat.max(values),
      skewness: jStat.skewness(values),
      kurtosis: jStat.kurtosis(values)
    };
  }, [processedData]);

  const exportChartAsPNG = useCallback(() => {
    if (!chartRef.current) return;
    
    htmlToImage.toPng(chartRef.current)
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `chart_${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        setSnackbar({ open: true, message: 'Chart exported successfully', severity: 'success' });
      })
      .catch((error) => {
        console.error('Export failed:', error);
        setSnackbar({ open: true, message: 'Failed to export chart', severity: 'error' });
      });
  }, []);

  const exportDataToExcel = useCallback(() => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(processedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      XLSX.writeFile(workbook, `data_${Date.now()}.xlsx`);
      setSnackbar({ open: true, message: 'Data exported successfully', severity: 'success' });
    } catch (error) {
      console.error('Excel export failed:', error);
      setSnackbar({ open: true, message: 'Failed to export data', severity: 'error' });
    }
  }, [processedData]);

  const compareColumns = useCallback(() => {
    if (comparisonColumns.length < 2) {
      setSnackbar({ open: true, message: 'Select at least two columns to compare', severity: 'warning' });
      return null;
    }

    return comparisonColumns.map(column => ({
      column,
      ...computeStatistics(column)
    }));
  }, [comparisonColumns, computeStatistics]);

  const numericColumns = availableColumns.filter(col => 
    processedData.some(row => !isNaN(parseFloat(row[col])) && row[col] !== null)
  );

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ width: '90vw', maxWidth: '1400px' }}>
        <div className={styles.modalHeader}>
          <span className={styles.viewerTitle}>Dataset Analysis</span>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className={styles.modalBody}>
          <Container maxWidth="xl" sx={{ py: 2 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Data Analysis Tool</Typography>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                  <AxisSelector
                    axis={xAxis}
                    setAxis={setXAxis}
                    columns={availableColumns}
                    label="X-Axis"
                    disabledAxis={yAxis}
                  />
                  <AxisSelector
                    axis={yAxis}
                    setAxis={setYAxis}
                    columns={numericColumns}
                    label="Y-Axis"
                    disabledAxis={xAxis}
                    includeCount
                  />
                  <ChartTypeSelector
                    chartType={chartType}
                    setChartType={setChartType}
                    chartTypes={chartTypes}
                  />
                  <Box sx={{ flexGrow: 1, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button startIcon={<DownloadIcon />} onClick={exportChartAsPNG} variant="outlined">
                      Export Chart
                    </Button>
                    <Button startIcon={<DownloadIcon />} onClick={exportDataToExcel} variant="outlined">
                      Export Data
                    </Button>
                    <Button startIcon={<ResetIcon />} onClick={handleReset} variant="outlined" color="secondary">
                      Reset
                    </Button>
                    <Button startIcon={<CompareIcon />} onClick={() => setComparisonModalOpen(true)} variant="outlined">
                      Compare
                    </Button>
                    <Button startIcon={<AnalyticsIcon />} onClick={() => setStatisticsModalOpen(true)} variant="outlined">
                      Statistics
                    </Button>
                  </Box>
                </Box>

                <Paper sx={{
                  p: 2,
                  height: '70vh',
                  minHeight: '400px',
                  display: 'flex',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <ChartRenderer
                    chartType={chartType}
                    data={processedData}
                    xAxis={xAxis}
                    yAxis={yAxis}
                    chartRef={chartRef}
                    colorSeed={colorSeed}
                    style={{
                      width: '100%',
                      height: '100%',
                      transition: 'all 0.3s ease-in-out'
                    }}
                    responsiveOptions={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top' },
                        zoom: {
                          zoom: {
                            wheel: { enabled: true },
                            pinch: { enabled: true },
                            mode: 'xy'
                          },
                          pan: { enabled: true, mode: 'xy' }
                        }
                      }
                    }}
                  />
                </Paper>

                <ComparisonModal
                  open={comparisonModalOpen}
                  onClose={() => setComparisonModalOpen(false)}
                  columns={numericColumns}
                  comparisonColumns={comparisonColumns}
                  setComparisonColumns={setComparisonColumns}
                  compareColumns={compareColumns}
                />

                <ColumnStatisticsModal
                  open={statisticsModalOpen}
                  onClose={() => setStatisticsModalOpen(false)}
                  columns={numericColumns}
                  computeStatistics={computeStatistics}
                />

                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', lineHeight: 1.1, marginTop: '20px' }}>
                  <strong>How to Use This Chart</strong>
                  <Box component="ul" sx={{ pl: 2, mt: 1, mb: 1 }}>
                    <Box component="li" sx={{ mb: 1 }}>
                      <strong>Choose your data:</strong> Select columns for the X and Y axes from the dropdowns.
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <strong>Pick a chart type:</strong> Use the icons to switch between bar, line, pie, and more.
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <strong>Interact:</strong> Zoom, pan, or hover for details. Click "Export" to save your chart or data.
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <strong>Reset:</strong> Click the "Reset" button to restore the default view and settings.
                    </Box>
                  </Box>
                </Typography>
              </>
            )}

            <Snackbar
              open={snackbar.open}
              autoHideDuration={3000}
              onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                severity={snackbar.severity}
                sx={{ width: '100%' }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;