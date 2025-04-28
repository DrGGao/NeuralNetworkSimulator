import React from 'react';
import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

// Style the neuron node
const NeuronPaper = styled(Paper)(({ theme, nodeVisible }) => ({
  width: '70px',
  height: '70px',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '10px',
  border: '2px solid #333',
  fontWeight: 'bold',
  opacity: nodeVisible ? 1 : 0.3,
  transition: 'all 0.5s ease-in-out, transform 0.3s ease, opacity 0.5s ease-in-out',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
  },
}));

const ValueText = styled(Box)(({ theme, visible }) => ({
  transition: 'all 0.8s ease-in-out',
  opacity: visible ? 1 : 0,
  transform: visible ? 'scale(1)' : 'scale(0.5)',
  color: 'inherit',
  fontSize: '18px',
}));

// Neuron node component
const NeuronNode = ({ id, value, color = 'black', visible = true }) => {
  // 检查值是否为NaN或undefined，如果是则显示为0
  const safeValue = (value !== undefined && !isNaN(parseFloat(value))) ? parseFloat(value) : 0;
  
  // Calculate highlight effect based on value changes
  const normalizedValue = Math.min(Math.abs(safeValue) / 5, 1);
  const activeColor = normalizedValue > 0 ? `rgba(33, 150, 243, ${normalizedValue * 0.6})` : 'transparent';
  
  return (
    <NeuronPaper 
      id={id} 
      elevation={3}
      nodeVisible={visible}
      sx={{
        backgroundColor: activeColor,
        transition: 'background-color 0.8s ease-in-out, box-shadow 0.5s ease-in-out, opacity 0.5s ease-in-out',
        boxShadow: normalizedValue > 0 
          ? `0 0 ${normalizedValue * 15}px ${normalizedValue * 5}px rgba(33, 150, 243, ${normalizedValue * 0.3})`
          : '0 4px 8px rgba(0,0,0,0.1)',
      }}
    >
      <ValueText 
        component="span" 
        visible={visible}
      >
        {visible ? (safeValue === 0 && value === '' ? '' : safeValue.toFixed(2)) : ''}
      </ValueText>
    </NeuronPaper>
  );
};

export default NeuronNode; 