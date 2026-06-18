import React, { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, Typography } from '@mui/material';
import NeuralNetworkSimulator from './components/NeuralNetworkSimulator';
import LanguageToggle from './components/LanguageToggle';
import { LanguageProvider, useLanguage } from './utils/languageContext';
import './App.css';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f8fa',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});

// Application content component with access to language context
const AppContent = () => {
  const { t } = useLanguage();
  
  // 发送页面浏览事件到 Google Analytics
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4, textAlign: 'center', position: 'relative' }}>
          <LanguageToggle />
          <Typography variant="h4" component="h1" gutterBottom>
            {t('appTitle')}
          </Typography>
          <Typography variant="body2" color="text.primary" sx={{ mb: 3, fontWeight: 'bold' }}>
            Let's train a very simple neural network to learn addition using the single training example 1 + 2 = 3.
          </Typography>
          <NeuralNetworkSimulator />
        </Box>
      </Container>
    </ThemeProvider>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App; 
