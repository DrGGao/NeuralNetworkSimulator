import React, { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { getVisitCount, incrementVisitCount } from '../utils/visitorCounter';
import { useLanguage } from '../utils/languageContext';

const VisitorCounter = () => {
  const [visitCount, setVisitCount] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    // Increment the visit count when the component mounts
    const count = incrementVisitCount();
    setVisitCount(count);
  }, []);

  return (
    <Box sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        {t('visitorCount')}: {visitCount}
      </Typography>
    </Box>
  );
};

export default VisitorCounter; 