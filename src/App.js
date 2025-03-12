import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import './App.css';
import routes from './routes';
import '@scottish-government/design-system/dist/css/design-system.min.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 'bold',
    },
    h5: {
      fontWeight: 'bold',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ScrollToTop />
        <div className="ds_page">
          {/* Target element for back to top */}
          <div id="page-top"></div>
          <Header />
          <main className="flex-1 p-6 overflow-auto" style={{ paddingTop: '0' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/home" />} />
              {routes.map(({ path, element }) => (
                <Route key={path} path={path} element={element}  />
                
              ))}        

            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}
export default App;