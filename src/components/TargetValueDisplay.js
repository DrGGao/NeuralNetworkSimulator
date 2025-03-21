import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const TargetPaper = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '10px',
  right: '10px',
  padding: theme.spacing(1.5),
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  backgroundColor: '#F8FFF8',
  border: '1px solid #e0f0e0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  zIndex: 5,
}));

const TargetValueDisplay = ({ targetValue, mode = "train" }) => {
  // 在应用模式下不显示目标值
  if (mode === "apply") {
    return null;
  }
  
  return (
    <TargetPaper elevation={2}>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        目标输出值
      </Typography>
      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
        {targetValue.toFixed(3)}
      </Typography>
    </TargetPaper>
  );
};

export default TargetValueDisplay; 