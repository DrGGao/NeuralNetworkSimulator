import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { useLanguage } from '../utils/languageContext';

// Language icons
const EnglishIcon = () => (
  <Box sx={{ 
    width: 24, 
    height: 24, 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px'
  }}>
    EN
  </Box>
);

const ChineseIcon = () => (
  <Box sx={{ 
    width: 24, 
    height: 24, 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px'
  }}>
    中
  </Box>
);

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <Tooltip title={language === 'en' ? '切换到中文' : 'Switch to English'}>
      <IconButton 
        onClick={toggleLanguage}
        color="primary"
        size="small"
        sx={{ 
          position: 'absolute',
          top: '10px',
          right: '10px',
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.9)',
          }
        }}
      >
        {language === 'en' ? <ChineseIcon /> : <EnglishIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default LanguageToggle; 