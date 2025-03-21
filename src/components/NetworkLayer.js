import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import NeuronNode from './NeuronNode';

const LayerContainer = styled(Box)(({ theme, visible }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  margin: '0 30px',
  minWidth: '120px',
  opacity: visible ? 1 : 0.3,
  transform: visible ? 'translateY(0)' : 'translateY(10px)',
  transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
}));

const LayerTitle = styled(Typography)(({ theme, visible }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  color: '#3f51b5',
  opacity: visible ? 1 : 0.5,
  transform: visible ? 'translateY(0)' : 'translateY(-10px)',
  transition: 'all 0.6s ease-in-out',
}));

const NodesContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '250px',
  justifyContent: 'center',
  gap: '25px',
}));

const NetworkLayer = ({ layerIndex, layerName, size, values = [], visible = true }) => {
  return (
    <LayerContainer visible={visible}>
      <LayerTitle 
        variant="subtitle1"
        visible={visible}
      >
        {layerName}
      </LayerTitle>
      <NodesContainer>
        {Array.from({ length: size }).map((_, i) => (
          <NeuronNode
            key={i}
            id={`node-${layerIndex}-${i}`}
            value={values[i] || ''}
            visible={visible}
          />
        ))}
      </NodesContainer>
    </LayerContainer>
  );
};

export default NetworkLayer; 