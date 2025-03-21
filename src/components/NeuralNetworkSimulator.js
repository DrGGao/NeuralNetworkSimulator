import React, { useState } from 'react';
import { Box, Paper, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import NetworkLayer from './NetworkLayer';
import ConnectionLines from './ConnectionLines';
import ControlPanel from './ControlPanel';
import TargetValueDisplay from './TargetValueDisplay';
import { 
  goodWeights, 
  badWeights, 
  forwardPropagation, 
  backwardPropagation 
} from '../utils/neuralNetworkUtils';

const NetworkContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  position: 'relative',
  minHeight: '400px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
  overflow: 'hidden',
  width: '100%',
}));

const NeuralNetworkSimulator = () => {
  // Neural network structure
  const inputSize = 2;
  const hiddenSize = 3;
  const outputSize = 1;

  // Mode state - "train" for training mode, "apply" for application mode
  const [mode, setMode] = useState("train");

  // State
  const [weights, setWeights] = useState({
    W1: [
      [0.5, 0.4],
      [0.1, 0.2],
      [0.3, 0.6]
    ],
    W2: [
      [0.1, 0.4, 0.7]
    ]
  });
  
  const [inputs, setInputs] = useState([1, 2]);
  const [layerOutputs, setLayerOutputs] = useState({
    A1: [0, 0, 0],
    A2: [0]
  });
  const [visibleLayers, setVisibleLayers] = useState({
    input: true,
    hidden: false,
    output: false
  });
  const [animationPhase, setAnimationPhase] = useState(null);
  const [learningRate, setLearningRate] = useState(0.1);
  const [targetValue, setTargetValue] = useState(1.0);
  const [forwardDisabled, setForwardDisabled] = useState(false);
  const [backwardDisabled, setBackwardDisabled] = useState(true);
  
  // Handle input changes
  const handleInput1Change = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setInputs(prevInputs => [value, prevInputs[1]]);
  };
  
  const handleInput2Change = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setInputs(prevInputs => [prevInputs[0], value]);
  };
  
  const handleLearningRateChange = (_, value) => {
    setLearningRate(value);
  };
  
  const handleTargetValueChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setTargetValue(value);
  };
  
  // Handle mode change
  const handleModeChange = (_, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
      
      // Reset network state when changing modes
      resetState();
      
      // In apply mode, show all layers by default
      if (newMode === "apply") {
        setVisibleLayers({ input: true, hidden: true, output: true });
        // 不再立即计算输出值，而是保持为0
        setLayerOutputs({ A1: [0, 0, 0], A2: [0] });
      }
    }
  };
  
  // Forward propagation
  const handleForwardPropagation = () => {
    // 将动画分为多个阶段
    // 阶段1: 输入层到隐藏层的计算
    // 阶段2: 隐藏层值的显示
    // 阶段3: 隐藏层到输出层的计算
    // 阶段4: 输出层值的显示
    
    // 计算前向传播结果，但先不显示
    const { A1, A2 } = forwardPropagation(inputs, weights);
    
    // 设置基本时间参数
    const transitionTime = 1500; // 基本过渡时间
    const updateInterval = 50; // 更新间隔
    const steps = 20; // 动画步数
    
    // 阶段1: 输入层到隐藏层的计算 - 只显示输入层和连接
    setAnimationPhase('forward-input');
    setVisibleLayers({ input: true, hidden: false, output: false });
    
    // 阶段2: 显示隐藏层值
    setTimeout(() => {
      // 动画显示隐藏层的值
      setVisibleLayers({ input: true, hidden: true, output: false });
      
      let step = 0;
      const initialA1 = [0, 0, 0];
      const animateA1 = setInterval(() => {
        step++;
        // 逐步增加隐藏层值
        const animatedA1 = initialA1.map((_, i) => {
          return (A1[i] * step) / steps;
        });
        
        setLayerOutputs(prev => ({ ...prev, A1: animatedA1 }));
        
        if (step >= steps) {
          clearInterval(animateA1);
          setLayerOutputs(prev => ({ ...prev, A1 }));
          
          // 阶段3: 隐藏层到输出层的计算
          setTimeout(() => {
            // 切换动画阶段，显示隐藏层到输出层的乘法步骤
            setAnimationPhase('forward-hidden');
            
            // 阶段4: 显示输出层结果
            setTimeout(() => {
              setVisibleLayers({ input: true, hidden: true, output: true });
              
              let outputStep = 0;
              const initialA2 = [0];
              const animateA2 = setInterval(() => {
                outputStep++;
                const animatedA2 = initialA2.map((_, i) => {
                  return (A2[i] * outputStep) / steps;
                });
                
                setLayerOutputs(prev => ({ ...prev, A1, A2: animatedA2 }));
                
                if (outputStep >= steps) {
                  clearInterval(animateA2);
                  setLayerOutputs({ A1, A2 });
                  
                  // 完成所有阶段
                  setTimeout(() => {
                    setAnimationPhase(null);
                    setForwardDisabled(true);
                    setBackwardDisabled(false);
                  }, transitionTime / 2);
                }
              }, updateInterval);
            }, transitionTime);
          }, transitionTime / 2);
        }
      }, updateInterval);
    }, transitionTime);
  };
  
  // Backward propagation
  const handleBackwardPropagation = () => {
    setAnimationPhase('backward');
    
    // Calculate backpropagation
    const { newW1, newW2 } = backwardPropagation(
      inputs,
      layerOutputs.A1,
      layerOutputs.A2,
      weights.W1,
      weights.W2,
      [targetValue],
      learningRate
    );
    
    // Longer transition for smoother animation
    const transitionTime = 2000; // 2 seconds
    const updateInterval = 50; // Update every 50ms
    const steps = 20; // Total animation steps
    
    // Store original weights for animation
    const originalW1 = weights.W1.map(row => [...row]);
    const originalW2 = weights.W2.map(row => [...row]);
    
    // Animate weight updates
    let step = 0;
    const animateWeights = setInterval(() => {
      step++;
      
      // Gradually update weights from original to new values
      const animatedW1 = originalW1.map((row, i) => 
        row.map((w, j) => w + ((newW1[i][j] - w) * step) / steps)
      );
      
      const animatedW2 = originalW2.map((row, i) => 
        row.map((w, j) => w + ((newW2[i][j] - w) * step) / steps)
      );
      
      setWeights({
        W1: animatedW1,
        W2: animatedW2
      });
      
      if (step >= steps) {
        clearInterval(animateWeights);
        
        // Set final weights
        setWeights({
          W1: newW1,
          W2: newW2
        });
        
        // End animation phase without hiding layers
        setTimeout(() => {
          setAnimationPhase(null);
          
          // Keep all layers visible, but enable forward button for next round
          // and disable backward button
          setForwardDisabled(false);
          setBackwardDisabled(true);
          
          // Recalculate outputs with new weights to show updated network state
          const { A1, A2 } = forwardPropagation(inputs, weights);
          setLayerOutputs({ A1, A2 });
        }, transitionTime);
      }
    }, updateInterval);
  };
  
  // Apply network function for apply mode
  const handleApplyNetwork = () => {
    // 计算输出但不立即显示
    const { A1, A2 } = forwardPropagation(inputs, weights);
    
    // 设置基本时间参数
    const transitionTime = 1500; // 基本过渡时间
    
    // 阶段1: 先只显示输入层到隐藏层的连接计算
    setAnimationPhase('apply-input');
    
    // 先清空输出值（设置为0使得ControlPanel中不显示任何结果）
    setLayerOutputs(prev => ({ ...prev, A2: [0] }));
    
    // 阶段2: 延迟显示隐藏层值
    setTimeout(() => {
      // 显示隐藏层的计算结果
      setLayerOutputs(prev => ({ ...prev, A1 }));
      
      // 阶段3: 显示隐藏层到输出层的连接计算
      setTimeout(() => {
        setAnimationPhase('apply-hidden');
        
        // 阶段4: 最后才显示输出结果
        setTimeout(() => {
          // 显示最终输出值
          setLayerOutputs(prev => ({ ...prev, A2 }));
          
          // 结束动画阶段
          setTimeout(() => {
            setAnimationPhase(null);
          }, transitionTime / 2);
        }, transitionTime);
      }, transitionTime);
    }, transitionTime);
  };
  
  // Set good initialization weights
  const handleGoodInitialization = () => {
    setWeights(goodWeights);
    resetState();
  };
  
  // Set bad initialization weights
  const handleBadInitialization = () => {
    setWeights(badWeights);
    resetState();
  };
  
  // Reset state
  const resetState = () => {
    // 根据当前模式决定如何重置状态
    if (mode === "train") {
      // 训练模式下隐藏隐藏层和输出层
      setVisibleLayers({ input: true, hidden: false, output: false });
      // 清除层输出
      setLayerOutputs({ A1: [0, 0, 0], A2: [0] });
    } else if (mode === "apply") {
      // 应用模式下显示所有层
      setVisibleLayers({ input: true, hidden: true, output: true });
      // 不再计算输出值，保持为0
      setLayerOutputs({ A1: [0, 0, 0], A2: [0] });
    }
    
    // 重置动画阶段
    setAnimationPhase(null);
    // 启用前向传播，禁用反向传播
    setForwardDisabled(false);
    setBackwardDisabled(true);
  };
  
  return (
    <Box sx={{ mb: 8 }}>
      {/* Mode toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ToggleButtonGroup
          color="primary"
          value={mode}
          exclusive
          onChange={handleModeChange}
          aria-label="Mode Selection"
        >
          <ToggleButton value="train" aria-label="Training Mode">
            Training Mode
          </ToggleButton>
          <ToggleButton value="apply" aria-label="Apply Mode">
            Apply Mode
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <NetworkContainer>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-evenly',
            width: '100%', 
            position: 'relative',
            height: '400px',
            padding: '0 40px'
          }}
        >
          <ConnectionLines 
            W1={weights.W1} 
            W2={weights.W2} 
            inputSize={inputSize} 
            hiddenSize={hiddenSize} 
            outputSize={outputSize}
            animationPhase={animationPhase}
          />
          
          <NetworkLayer 
            layerIndex={0} 
            layerName="Input Layer" 
            size={inputSize} 
            values={inputs} 
            visible={visibleLayers.input} 
          />
          
          <NetworkLayer 
            layerIndex={1} 
            layerName="Hidden Layer" 
            size={hiddenSize} 
            values={layerOutputs.A1} 
            visible={visibleLayers.hidden} 
          />
          
          <NetworkLayer 
            layerIndex={2} 
            layerName="Output Layer" 
            size={outputSize} 
            values={layerOutputs.A2} 
            visible={visibleLayers.output} 
          />
          
          <TargetValueDisplay targetValue={targetValue} mode={mode} />
        </Box>
      </NetworkContainer>
      
      <ControlPanel 
        input1={inputs[0]}
        input2={inputs[1]}
        learningRate={learningRate}
        targetValue={targetValue}
        onInput1Change={handleInput1Change}
        onInput2Change={handleInput2Change}
        onLearningRateChange={handleLearningRateChange}
        onTargetValueChange={handleTargetValueChange}
        onForwardPropagation={handleForwardPropagation}
        onBackwardPropagation={handleBackwardPropagation}
        onApplyNetwork={handleApplyNetwork}
        onGoodInitialization={handleGoodInitialization}
        onBadInitialization={handleBadInitialization}
        forwardDisabled={forwardDisabled}
        backwardDisabled={backwardDisabled}
        mode={mode}
        outputValue={layerOutputs.A2[0] || 0}
      />
    </Box>
  );
};

export default NeuralNetworkSimulator; 