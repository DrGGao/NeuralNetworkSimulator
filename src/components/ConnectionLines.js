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
    
    // 获取节点位置
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

    // 绘制两层之间的连接
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
          
          // 创建连接线
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', fromPos.x);
          line.setAttribute('y1', fromPos.y);
          line.setAttribute('x2', toPos.x);
          line.setAttribute('y2', toPos.y);
          line.setAttribute('stroke', color);
          line.setAttribute('stroke-width', Math.abs(weight) * 1.5 + 1); // 权重大小影响线宽
          svg.appendChild(line);
          
          if (showValues) {
            // 添加权重文本
            const midX = fromPos.x + (toPos.x - fromPos.x) * 0.6;
            const midY = fromPos.y + (toPos.y - fromPos.y) * 0.6 - 10;
            
            // 先创建白色背景使文本更加清晰
            const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bg.setAttribute('x', midX - 20); // 使用固定宽度而不是依赖于getBBox
            bg.setAttribute('y', midY - 12); // 调整Y位置
            bg.setAttribute('width', 40);    // 使用固定宽度
            bg.setAttribute('height', 18);   // 使用固定高度
            bg.setAttribute('fill', 'rgba(255, 255, 255, 0.7)');
            bg.setAttribute('rx', '3');
            svg.appendChild(bg);  // 先添加背景到SVG
            
            // 然后添加文本
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', midX);
            text.setAttribute('y', midY);
            text.setAttribute('fill', color);
            text.setAttribute('font-size', '14px');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('class', `weight-text-${layerIndex}-${i}-${j}`);
            text.textContent = weight.toFixed(2);
            
            // 如果在动画阶段，添加特效
            if (animationPhase === 'forward-input' && layerIndex === 0) {
              // 输入层到隐藏层的阶段：显示输入值乘权重
              const sourceValue = document.getElementById(`node-${layerIndex}-${i}`)?.innerText || '';
              
              if (sourceValue) {
                text.textContent = `${sourceValue} * ${weight.toFixed(2)}`;
                text.setAttribute('font-size', '16px');
                text.setAttribute('font-weight', 'bold');
                
                // 更新背景以适应更长的文本
                bg.setAttribute('width', 80);
                bg.setAttribute('x', midX - 40);
              }
            } else if (animationPhase === 'forward-hidden' && layerIndex === 1) {
              // 隐藏层到输出层的阶段：显示隐藏层值乘权重
              const sourceValue = document.getElementById(`node-${layerIndex}-${i}`)?.innerText || '';
              
              if (sourceValue) {
                text.textContent = `${sourceValue} * ${weight.toFixed(2)}`;
                text.setAttribute('font-size', '16px');
                text.setAttribute('font-weight', 'bold');
                
                // 更新背景以适应更长的文本
                bg.setAttribute('width', 80);
                bg.setAttribute('x', midX - 40);
              }
            } else if (animationPhase === 'apply-input' && layerIndex === 0) {
              // Apply模式下阶段1：仅显示输入层到隐藏层的计算
              const sourceValue = document.getElementById(`node-${layerIndex}-${i}`)?.innerText || '';
              
              if (sourceValue) {
                text.textContent = `${sourceValue} * ${weight.toFixed(2)}`;
                text.setAttribute('font-size', '16px');
                text.setAttribute('font-weight', 'bold');
                
                // 更新背景以适应更长的文本
                bg.setAttribute('width', 80);
                bg.setAttribute('x', midX - 40);
              }
            } else if (animationPhase === 'apply-hidden' && layerIndex === 1) {
              // Apply模式下阶段2：显示隐藏层到输出层的计算
              const sourceValue = document.getElementById(`node-${layerIndex}-${i}`)?.innerText || '';
              
              if (sourceValue) {
                text.textContent = `${sourceValue} * ${weight.toFixed(2)}`;
                text.setAttribute('font-size', '16px');
                text.setAttribute('font-weight', 'bold');
                
                // 更新背景以适应更长的文本
                bg.setAttribute('width', 80);
                bg.setAttribute('x', midX - 40);
              }
            } else if (animationPhase === 'apply') {
              // Apply模式下的动画：显示所有值乘权重（保留旧逻辑以兼容）
              const sourceValue = document.getElementById(`node-${layerIndex}-${i}`)?.innerText || '';
              
              if (sourceValue) {
                text.textContent = `${sourceValue} * ${weight.toFixed(2)}`;
                text.setAttribute('font-size', '16px');
                text.setAttribute('font-weight', 'bold');
                
                // 更新背景以适应更长的文本
                bg.setAttribute('width', 80);
                bg.setAttribute('x', midX - 40);
              }
            } else if (animationPhase === 'backward') {
              const oldWeight = layerIndex === 0 ? W1[j][i] : W2[j][i];
              if (oldWeight !== weight) {
                text.textContent = `${oldWeight.toFixed(2)} → ${weight.toFixed(2)}`;
                text.setAttribute('font-size', '16px');
                text.setAttribute('font-weight', 'bold');
                
                // 更新背景以适应更长的文本
                bg.setAttribute('width', 80);
                bg.setAttribute('x', midX - 40);
              }
            }
            
            svg.appendChild(text);  // 最后添加文本到SVG
          }
        }
      }
    };

    // 绘制输入层到隐藏层的连接
    drawLayerConnections(0, inputSize, hiddenSize, W1);
    
    // 绘制隐藏层到输出层的连接
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