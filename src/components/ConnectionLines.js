import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { findMinMaxWeights, getWeightColor } from '../utils/neuralNetworkUtils';

const ConnectionLines = ({ W1, W2, inputSize, hiddenSize, outputSize, showValues = true, animationPhase = null }) => {
  const svgRef = useRef(null);

  const drawConnections = () => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    svg.innerHTML = '';
    
    // Add smooth transition style
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = `
      line {
        transition: stroke-width 0.8s ease-in-out, stroke 0.8s ease-in-out;
      }
      text {
        transition: font-size 0.5s ease-in-out, fill 0.5s ease-in-out;
      }
      rect {
        transition: width 0.5s ease, x 0.5s ease, opacity 0.5s ease;
      }
    `;
    svg.appendChild(style);
    
    // Get node position
    const getNodePosition = (layerIndex, nodeIndex) => {
      const node = document.getElementById(`node-${layerIndex}-${nodeIndex}`);
      if (!node) return null;
      
      const rect = node.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      
      return {
        x: rect.left + rect.width / 2 - svgRect.left,
        y: rect.top + rect.height / 2 - svgRect.top
      };
    };

    // Draw connections between two layers
    const drawLayerConnections = (layerIndex, fromSize, toSize, weights) => {
      if (!weights) return;
      
      const weightMinMax = findMinMaxWeights(W1, W2);
      
      for (let i = 0; i < fromSize; i++) {
        const fromPos = getNodePosition(layerIndex, i);
        if (!fromPos) continue;
        
        for (let j = 0; j < toSize; j++) {
          const toPos = getNodePosition(layerIndex + 1, j);
          if (!toPos) continue;
          
          const weight = weights[j][i];
          const color = getWeightColor(weight, weightMinMax);
          
          // Create connection line
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', fromPos.x);
          line.setAttribute('y1', fromPos.y);
          line.setAttribute('x2', toPos.x);
          line.setAttribute('y2', toPos.y);
          line.setAttribute('stroke', color);
          line.setAttribute('stroke-width', Math.abs(weight) * 1.5 + 1); // Line width affected by weight magnitude
          svg.appendChild(line);
          
          if (showValues) {
            // Add weight text
            const midX = fromPos.x + (toPos.x - fromPos.x) * 0.6;
            const midY = fromPos.y + (toPos.y - fromPos.y) * 0.6 - 10;
            
            // First create white background to make text more clear
            const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bg.setAttribute('x', midX - 20); // Use fixed width instead of depending on getBBox
            bg.setAttribute('y', midY - 12); // Adjust Y position
            bg.setAttribute('width', 40);    // Use fixed width
            bg.setAttribute('height', 18);   // Use fixed height
            bg.setAttribute('fill', 'rgba(255, 255, 255, 0.7)');
            bg.setAttribute('rx', '3');
            svg.appendChild(bg);  // Add background to SVG first
            
            // Then add text
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', midX);
            text.setAttribute('y', midY);
            text.setAttribute('fill', color);
            text.setAttribute('font-size', '14px');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('class', `weight-text-${layerIndex}-${i}-${j}`);
            text.textContent = weight.toFixed(2);
            
            // If in animation phase, add effects
            if (animationPhase === 'forward-input' && layerIndex === 0) {
              // Input layer to hidden layer phase: Show input value * weight
              const sourceValue = document.getElementById(`node-${layerIndex}-${i}`)?.innerText || '';
              
              if (sourceValue) {
                text.textContent = `${sourceValue} * ${weight.toFixed(2)}`;
                text.setAttribute('font-size', '16px');
                text.setAttribute('font-weight', 'bold');
                
                // Update background to fit longer text
                bg.setAttribute('width', 80);
                bg.setAttribute('x', midX - 40);
              }
            } else if (animationPhase === 'forward-hidden' && layerIndex === 1) {
              // Hidden layer to output layer phase: Show hidden layer value * weight
              const sourceValue = document.getElementById(`node-${layerIndex}-${i}`)?.innerText || '';
              
              if (sourceValue) {
                text.textContent = `${sourceValue} * ${weight.toFixed(2)}`;
                text.setAttribute('font-size', '16px');
                text.setAttribute('font-weight', 'bold');
                
                // Update background to fit longer text
                bg.setAttribute('width', 80);
                bg.setAttribute('x', midX - 40);
              }
            } else if (animationPhase === 'apply-input' && layerIndex === 0) {
              // Apply mode phase 1: Show only input layer to hidden layer calculations
              const sourceValue = document.getElementById(`node-${layerIndex}-${i}`)?.innerText || '';
              
              if (sourceValue) {
                text.textContent = `${sourceValue} * ${weight.toFixed(2)}`;
                text.setAttribute('font-size', '16px');
                text.setAttribute('font-weight', 'bold');
                
                // Update background to fit longer text
                bg.setAttribute('width', 80);
                bg.setAttribute('x', midX - 40);
              }
            } else if (animationPhase === 'apply-hidden' && layerIndex === 1) {
              // Apply mode phase 2: Show hidden layer to output layer calculations
              const sourceValue = document.getElementById(`node-${layerIndex}-${i}`)?.innerText || '';
              
              if (sourceValue) {
                text.textContent = `${sourceValue} * ${weight.toFixed(2)}`;
                text.setAttribute('font-size', '16px');
                text.setAttribute('font-weight', 'bold');
                
                // Update background to fit longer text
                bg.setAttribute('width', 80);
                bg.setAttribute('x', midX - 40);
              }
            } else if (animationPhase === 'apply') {
              // Apply mode animation: Show all values * weights (keep old logic for compatibility)
              const sourceValue = document.getElementById(`node-${layerIndex}-${i}`)?.innerText || '';
              
              if (sourceValue) {
                text.textContent = `${sourceValue} * ${weight.toFixed(2)}`;
                text.setAttribute('font-size', '16px');
                text.setAttribute('font-weight', 'bold');
                
                // Update background to fit longer text
                bg.setAttribute('width', 80);
                bg.setAttribute('x', midX - 40);
              }
            } else if (animationPhase === 'backward') {
              const oldWeight = layerIndex === 0 ? W1[j][i] : W2[j][i];
              if (oldWeight !== weight) {
                text.textContent = `${oldWeight.toFixed(2)} → ${weight.toFixed(2)}`;
                text.setAttribute('font-size', '16px');
                text.setAttribute('font-weight', 'bold');
                
                // Update background to fit longer text
                bg.setAttribute('width', 80);
                bg.setAttribute('x', midX - 40);
              }
            }
            
            svg.appendChild(text);  // Finally add text to SVG
          }
        }
      }
    };

    // Draw connections from input layer to hidden layer
    drawLayerConnections(0, inputSize, hiddenSize, W1);
    
    // Draw connections from hidden layer to output layer
    drawLayerConnections(1, hiddenSize, outputSize, W2);
  };

  useEffect(() => {
    drawConnections();
    window.addEventListener('resize', drawConnections);
    return () => window.removeEventListener('resize', drawConnections);
  }, [W1, W2, animationPhase]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box
      component="svg"
      ref={svgRef}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        overflow: 'visible',
        pointerEvents: 'none'
      }}
    />
  );
};

export default ConnectionLines; 