import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { findMinMaxWeights, getWeightColor } from '../utils/neuralNetworkUtils';

// 计算限制后的线条粗细 - 权重超过5时不再加粗
const getStrokeWidth = (weight, multiplier = 1.5, baseWidth = 1, maxWeight = 5) => {
  const absWeight = Math.abs(weight);
  const limitedWeight = Math.min(absWeight, maxWeight);
  return limitedWeight * multiplier + baseWidth;
};

const ConnectionLines = ({ 
  W1, 
  W2, 
  oldW1, 
  oldW2, 
  inputSize, 
  hiddenSize, 
  outputSize, 
  showValues = true, 
  animationPhase = null,
  visibleConnections = null
}) => {
  const svgRef = useRef(null);

  const drawConnections = () => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    svg.innerHTML = '';
    
    // Add smooth transition style - 加快过渡效果50%（相对于原始时间）
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = `
      line {
        transition: stroke-width 0.4s ease-in-out, stroke 0.4s ease-in-out;
      }
      text {
        transition: font-size 0.25s ease-in-out, fill 0.25s ease-in-out;
      }
      rect {
        transition: width 0.25s ease, x 0.25s ease, opacity 0.25s ease;
      }
      @keyframes blink {
        0% { opacity: 1; }
        25% { opacity: 0.3; }
        50% { opacity: 1; }
        75% { opacity: 0.3; }
        100% { opacity: 1; }
      }
      .blink-animation {
        animation: blink 1s ease-in-out;
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
          
          // 连接始终可见，但可能有不同的样式
          let isHighlighted = false;
          if (visibleConnections) {
            if (layerIndex === 0 && visibleConnections.inputToHidden && visibleConnections.inputToHidden[j][i]) {
              isHighlighted = true;
            } else if (layerIndex === 1 && visibleConnections.hiddenToOutput && visibleConnections.hiddenToOutput[j][i]) {
              isHighlighted = true;
            }
          }
          
          const weight = weights[j][i];
          const color = getWeightColor(weight, weightMinMax);
          
          // Create connection line
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', fromPos.x);
          line.setAttribute('y1', fromPos.y);
          line.setAttribute('x2', toPos.x);
          line.setAttribute('y2', toPos.y);
          line.setAttribute('stroke', color);
          
          // 为反向传播阶段设置不同的线条样式 - 使用限制后的粗细
          if (animationPhase === 'backward-phase1') {
            // 在第一阶段，突出W2连接，弱化W1连接
            if (layerIndex === 1) { // W2连接：隐藏层到输出层
              line.setAttribute('stroke-width', getStrokeWidth(weight, 3, 2)); // 更粗的线，但有限制
              line.setAttribute('opacity', '1');
            } else if (layerIndex === 0) { // W1连接：输入层到隐藏层
              line.setAttribute('stroke-width', getStrokeWidth(weight, 1, 1)); 
              line.setAttribute('opacity', '0.3'); // 半透明
            }
          } else if (animationPhase === 'backward-phase2') {
            // 在第二阶段，突出W1连接，W2连接保持正常
            if (layerIndex === 0) { // W1连接：输入层到隐藏层
              line.setAttribute('stroke-width', getStrokeWidth(weight, 3, 2)); // 更粗的线，但有限制
              line.setAttribute('opacity', '1');
            } else if (layerIndex === 1) { // W2连接：隐藏层到输出层
              line.setAttribute('stroke-width', getStrokeWidth(weight, 1.5, 1));
              line.setAttribute('opacity', '1');
            }
          } else if (animationPhase && animationPhase.startsWith('forward-')) {
            // 前向传播阶段
            if (isHighlighted) {
              // 高亮显示当前活跃的连接
              line.setAttribute('stroke-width', getStrokeWidth(weight, 3, 2));
              line.setAttribute('opacity', '1');
            } else {
              // 其他连接显示为细线
              line.setAttribute('stroke-width', getStrokeWidth(weight, 1, 1));
              line.setAttribute('opacity', '0.3');
            }
          } else {
            // 其他情况使用默认线宽 - 使用限制后的粗细
            line.setAttribute('stroke-width', getStrokeWidth(weight, 1.5, 1));
            line.setAttribute('opacity', '1');
          }
          
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
            
            // 设置权重文本背景的透明度，与线条保持一致
            if (animationPhase && animationPhase.startsWith('forward-') && !isHighlighted) {
              bg.setAttribute('opacity', '0.3');
            } else if (animationPhase === 'backward-phase1' && layerIndex === 0) {
              bg.setAttribute('opacity', '0.3');
            } else {
              bg.setAttribute('opacity', '1');
            }
            
            svg.appendChild(bg);  // Add background to SVG first
            
            // Then add text - 数字显示仍然显示真实的权重值，不受限制
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', midX);
            text.setAttribute('y', midY);
            text.setAttribute('fill', color);
            text.setAttribute('font-size', '14px');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('class', `weight-text-${layerIndex}-${i}-${j}`);
            
            // 设置权重文本的透明度，与线条保持一致
            if (animationPhase && animationPhase.startsWith('forward-') && !isHighlighted) {
              text.setAttribute('opacity', '0.3');
            } else if (animationPhase === 'backward-phase1' && layerIndex === 0) {
              text.setAttribute('opacity', '0.3');
            } else {
              text.setAttribute('opacity', '1');
            }
            
            text.textContent = weight.toFixed(2); // 数字显示真实权重值，不受限制
            
            // If in animation phase, add effects
            if (animationPhase === 'forward-input-to-hidden-1' && layerIndex === 0 && j === 0) {
              // Input to first hidden node
              const sourceValue = document.getElementById(`node-${layerIndex}-${i}`)?.innerText || '';
              
              if (sourceValue) {
                text.textContent = `${sourceValue} * ${weight.toFixed(2)}`;
                text.setAttribute('font-size', '16px');
                text.setAttribute('font-weight', 'bold');
                
                // Update background to fit longer text
                bg.setAttribute('width', 80);
                bg.setAttribute('x', midX - 40);
              }
            } else if (animationPhase === 'forward-input-to-hidden-2' && layerIndex === 0 && j === 1) {
              // Input to second hidden node
              const sourceValue = document.getElementById(`node-${layerIndex}-${i}`)?.innerText || '';
              
              if (sourceValue) {
                text.textContent = `${sourceValue} * ${weight.toFixed(2)}`;
                text.setAttribute('font-size', '16px');
                text.setAttribute('font-weight', 'bold');
                
                // Update background to fit longer text
                bg.setAttribute('width', 80);
                bg.setAttribute('x', midX - 40);
              }
            } else if (animationPhase === 'forward-input-to-hidden-3' && layerIndex === 0 && j === 2) {
              // Input to third hidden node
              const sourceValue = document.getElementById(`node-${layerIndex}-${i}`)?.innerText || '';
              
              if (sourceValue) {
                text.textContent = `${sourceValue} * ${weight.toFixed(2)}`;
                text.setAttribute('font-size', '16px');
                text.setAttribute('font-weight', 'bold');
                
                // Update background to fit longer text
                bg.setAttribute('width', 80);
                bg.setAttribute('x', midX - 40);
              }
            } else if (animationPhase === 'forward-hidden-to-output' && layerIndex === 1) {
              // Hidden layer to output layer
              const sourceValue = document.getElementById(`node-${layerIndex}-${i}`)?.innerText || '';
              
              if (sourceValue) {
                text.textContent = `${sourceValue} * ${weight.toFixed(2)}`;
                text.setAttribute('font-size', '16px');
                text.setAttribute('font-weight', 'bold');
                
                // Update background to fit longer text
                bg.setAttribute('width', 80);
                bg.setAttribute('x', midX - 40);
              }
            } else if (animationPhase === 'backward-phase1' && layerIndex === 1) {
              // 在第一阶段只显示W2权重变化
              let oldWeight;
              if (oldW2) {
                oldWeight = oldW2[j][i];
              }
              
              if (oldWeight !== undefined && Math.abs(oldWeight - weight) > 0.001) {
                text.textContent = `${oldWeight.toFixed(2)}→${weight.toFixed(2)}`;
                text.setAttribute('font-size', '16px');
                text.setAttribute('font-weight', 'bold');
                text.setAttribute('opacity', '1');
                
                // 更新背景以适应更长的文本
                bg.setAttribute('width', 90);
                bg.setAttribute('x', midX - 45);
              } else if (oldWeight !== undefined) {
                // 权重没有变化，添加闪烁效果
                text.textContent = weight.toFixed(2);
                text.classList.add('blink-animation');
                bg.classList.add('blink-animation');
              }
              
              // 使W1权重文本半透明
              if (layerIndex === 0) {
                text.setAttribute('opacity', '0.3');
                bg.setAttribute('opacity', '0.3');
              }
            } else if (animationPhase === 'backward-phase2' && layerIndex === 0) {
              // 在第二阶段只显示W1权重变化
              let oldWeight;
              if (oldW1) {
                oldWeight = oldW1[j][i];
              }
              
              if (oldWeight !== undefined && Math.abs(oldWeight - weight) > 0.001) {
                text.textContent = `${oldWeight.toFixed(2)}→${weight.toFixed(2)}`;
                text.setAttribute('font-size', '16px');
                text.setAttribute('font-weight', 'bold');
                
                // 更新背景以适应更长的文本
                bg.setAttribute('width', 90);
                bg.setAttribute('x', midX - 45);
              } else if (oldWeight !== undefined) {
                // 权重没有变化，添加闪烁效果
                text.textContent = weight.toFixed(2);
                text.classList.add('blink-animation');
                bg.classList.add('blink-animation');
              }
            } else if (animationPhase === 'backward') {
              // 兼容老的backward动画阶段
              let oldWeight;
              if (layerIndex === 0 && oldW1) {
                oldWeight = oldW1[j][i];
              } else if (layerIndex === 1 && oldW2) {
                oldWeight = oldW2[j][i];
              }
              
              if (oldWeight !== undefined && Math.abs(oldWeight - weight) > 0.001) {
                text.textContent = `${oldWeight.toFixed(2)}→${weight.toFixed(2)}`;
                text.setAttribute('font-size', '16px');
                text.setAttribute('font-weight', 'bold');
                
                // Update background to fit longer text
                bg.setAttribute('width', 90);
                bg.setAttribute('x', midX - 45);
              } else if (oldWeight !== undefined) {
                // 权重没有变化，添加闪烁效果
                text.textContent = weight.toFixed(2);
                text.classList.add('blink-animation');
                bg.classList.add('blink-animation');
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
  }, [W1, W2, animationPhase, visibleConnections]); // eslint-disable-line react-hooks/exhaustive-deps

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