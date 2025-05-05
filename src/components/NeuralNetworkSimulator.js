import React, { useState } from 'react';
import { Box, Paper, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import NetworkLayer from './NetworkLayer';
import ConnectionLines from './ConnectionLines';
import ControlPanel from './ControlPanel';
import TargetValueDisplay from './TargetValueDisplay';
import { useLanguage } from '../utils/languageContext';
import { 
  goodWeights, 
  badWeights, 
  forwardPropagation, 
  backwardPropagation,
  checkAndFixWeights 
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
  // Get translation function
  const { t } = useLanguage();
  
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
  const [oldWeights, setOldWeights] = useState(null);
  const [animationStep, setAnimationStep] = useState(0);
  const [visibleNodes, setVisibleNodes] = useState({
    hidden: [false, false, false],
    output: [false]
  });
  const [visibleConnections, setVisibleConnections] = useState({
    inputToHidden: [[false, false], [false, false], [false, false]],
    hiddenToOutput: [[false, false, false]]
  });
  const [learningRate, setLearningRate] = useState(0.1);
  const [targetValue, setTargetValue] = useState(3.0);
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
        // Don't calculate output values immediately, keep them at 0
        setLayerOutputs({ A1: [0, 0, 0], A2: [0] });
      }
    }
  };
  
  // Forward propagation
  const handleForwardPropagation = () => {
    // Safety check for NaN in weights before propagation
    const safeWeights = checkAndFixWeights(weights);
    if (safeWeights !== weights) {
      setWeights(safeWeights);
    }
    
    // Calculate forward propagation results
    const { A1, A2 } = forwardPropagation(inputs, weights);
    
    // Create step outputs for each animation phase
    const stepOutputs = [
      { A1: [0, 0, 0], A2: [0] },  // Initial state
      { A1: [A1[0], 0, 0], A2: [0] },  // Show first hidden node
      { A1: [A1[0], A1[1], 0], A2: [0] },  // Show second hidden node
      { A1: [A1[0], A1[1], A1[2]], A2: [0] },  // Show third hidden node
      { A1: [A1[0], A1[1], A1[2]], A2: [A2[0]] }  // Show output node
    ];
    
    // Reset animation state
    setAnimationStep(0);
    setVisibleNodes({
      hidden: [false, false, false],
      output: [false]
    });
    setVisibleConnections({
      inputToHidden: [[false, false], [false, false], [false, false]],
      hiddenToOutput: [[false, false, false]]
    });
    
    // Set initial layer outputs to first step
    setLayerOutputs(stepOutputs[0]);
    
    // Make sure input layer is visible and others are hidden initially
    setVisibleLayers({ input: true, hidden: true, output: true });
    
    // Delay between animation steps
    const stepDelay = 800;
    
    // Start animation sequence
    const startAnimation = () => {
      // Step 1: Show connections from input to first hidden node
      setAnimationPhase('forward-input-to-hidden-1');
      setVisibleConnections({
        inputToHidden: [[true, true], [false, false], [false, false]],
        hiddenToOutput: [[false, false, false]]
      });
      
      // Step 2: Show first hidden node
      setTimeout(() => {
        setAnimationStep(1);
        const newVisibleNodes = { ...visibleNodes };
        newVisibleNodes.hidden[0] = true;
        setVisibleNodes(newVisibleNodes);
        setLayerOutputs(stepOutputs[1]);
        
        // Step 3: Show connections from input to second hidden node
        setTimeout(() => {
          setAnimationPhase('forward-input-to-hidden-2');
          setVisibleConnections({
            inputToHidden: [[true, true], [true, true], [false, false]],
            hiddenToOutput: [[false, false, false]]
          });
          
          // Step 4: Show second hidden node
          setTimeout(() => {
            setAnimationStep(2);
            const newVisibleNodes = { ...visibleNodes };
            newVisibleNodes.hidden[0] = true;
            newVisibleNodes.hidden[1] = true;
            setVisibleNodes(newVisibleNodes);
            setLayerOutputs(stepOutputs[2]);
            
            // Step 5: Show connections from input to third hidden node
            setTimeout(() => {
              setAnimationPhase('forward-input-to-hidden-3');
              setVisibleConnections({
                inputToHidden: [[true, true], [true, true], [true, true]],
                hiddenToOutput: [[false, false, false]]
              });
              
              // Step 6: Show third hidden node
              setTimeout(() => {
                setAnimationStep(3);
                const newVisibleNodes = { ...visibleNodes };
                newVisibleNodes.hidden[0] = true;
                newVisibleNodes.hidden[1] = true;
                newVisibleNodes.hidden[2] = true;
                setVisibleNodes(newVisibleNodes);
                setLayerOutputs(stepOutputs[3]);
                
                // Step 7: Show connections from hidden to output
                setTimeout(() => {
                  setAnimationPhase('forward-hidden-to-output');
                  setVisibleConnections({
                    inputToHidden: [[true, true], [true, true], [true, true]],
                    hiddenToOutput: [[true, true, true]]
                  });
                  
                  // Step 8: Show output node
                  setTimeout(() => {
                    setAnimationStep(4);
                    const newVisibleNodes = { ...visibleNodes };
                    newVisibleNodes.hidden = [true, true, true];
                    newVisibleNodes.output = [true];
                    setVisibleNodes(newVisibleNodes);
                    setLayerOutputs(stepOutputs[4]);
                    
                    // Final step: Complete animation
                    setTimeout(() => {
                      setAnimationPhase(null);
                      setForwardDisabled(true);
                      setBackwardDisabled(false);
                    }, stepDelay);
                  }, stepDelay);
                }, stepDelay);
              }, stepDelay);
            }, stepDelay);
          }, stepDelay);
        }, stepDelay);
      }, stepDelay);
    };
    
    // Start the animation
    startAnimation();
  };
  
  // Backward propagation
  const handleBackwardPropagation = () => {
    // Safety check for NaN in weights before propagation
    const safeWeights = checkAndFixWeights(weights);
    if (safeWeights !== weights) {
      setWeights(safeWeights);
    }
    
    // Save original weights for animation
    setOldWeights({
      W1: weights.W1.map(row => [...row]),
      W2: weights.W2.map(row => [...row])
    });
    
    // 计算反向传播
    const { newW1, newW2 } = backwardPropagation(
      inputs,
      layerOutputs.A1,
      layerOutputs.A2,
      weights.W1,
      weights.W2,
      [targetValue],
      learningRate
    );
    
    // 实现分阶段反向传播动画
    
    // 第一阶段：输出层到隐藏层（W2权重更新）
    setAnimationPhase('backward-phase1');
    
    // 创建视觉提示
    const statusMessage = document.createElement('div');
    statusMessage.style.position = 'fixed';
    statusMessage.style.top = '10px';
    statusMessage.style.left = '50%';
    statusMessage.style.transform = 'translateX(-50%)';
    statusMessage.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
    statusMessage.style.color = 'white';
    statusMessage.style.padding = '10px 20px';
    statusMessage.style.borderRadius = '5px';
    statusMessage.style.fontWeight = 'bold';
    statusMessage.style.fontSize = '18px';
    statusMessage.style.zIndex = '1000';
    statusMessage.style.transition = 'opacity 0.5s';
    statusMessage.id = 'phase-status';
    statusMessage.textContent = t('backpropagationPhase1'); // "第一阶段：输出层到隐藏层的反向传播"
    document.body.appendChild(statusMessage);
    
    // 2秒后开始第一阶段动画
    setTimeout(() => {
      // 只更新W2权重
      setWeights({
        W1: weights.W1, // 保持W1不变
        W2: newW2       // 只更新W2
      });
      
      // 5秒后进入第二阶段
      setTimeout(() => {
        // 更新视觉提示
        const phaseStatus = document.getElementById('phase-status');
        if (phaseStatus) {
          phaseStatus.textContent = t('backpropagationPhase2'); // "第二阶段：隐藏层到输入层的反向传播"
        }
        
        // 设置第二阶段动画状态
        setAnimationPhase('backward-phase2');
        
        // 保存W2的新值和W1的原始值
        setOldWeights({
          W1: weights.W1.map(row => [...row]),
          W2: newW2.map(row => [...row])
        });
        
        // 2秒后开始第二阶段动画
        setTimeout(() => {
          // 完成所有权重更新
          setWeights({
            W1: newW1,
            W2: newW2
          });
          
          // 5秒后结束动画
          setTimeout(() => {
            // 移除视觉提示
            const phaseStatus = document.getElementById('phase-status');
            if (phaseStatus) {
              phaseStatus.style.opacity = '0';
              setTimeout(() => phaseStatus.remove(), 500);
            }
            
            // 结束动画阶段
            setAnimationPhase(null);
            setOldWeights(null);
            
            // 重新启用前向传播按钮，禁用反向传播按钮
            setForwardDisabled(false);
            setBackwardDisabled(true);
          }, 5000);
        }, 2000);
      }, 5000);
    }, 2000);
  };
  
  // Apply network function for apply mode
  const handleApplyNetwork = () => {
    // Safety check for NaN in weights before propagation
    const safeWeights = checkAndFixWeights(weights);
    if (safeWeights !== weights) {
      setWeights(safeWeights);
    }
    
    // Calculate output but don't display immediately
    const { A1, A2 } = forwardPropagation(inputs, weights);
    
    // Create step outputs for each animation phase
    const stepOutputs = [
      { A1: [0, 0, 0], A2: [0] },  // Initial state
      { A1: [A1[0], 0, 0], A2: [0] },  // Show first hidden node
      { A1: [A1[0], A1[1], 0], A2: [0] },  // Show second hidden node
      { A1: [A1[0], A1[1], A1[2]], A2: [0] },  // Show third hidden node
      { A1: [A1[0], A1[1], A1[2]], A2: [A2[0]] }  // Show output node
    ];
    
    // Reset animation state
    setAnimationStep(0);
    setVisibleNodes({
      hidden: [false, false, false],
      output: [false]
    });
    setVisibleConnections({
      inputToHidden: [[false, false], [false, false], [false, false]],
      hiddenToOutput: [[false, false, false]]
    });
    
    // Set initial layer outputs to first step
    setLayerOutputs(stepOutputs[0]);
    
    // Make sure input layer is visible and others are hidden initially
    setVisibleLayers({ input: true, hidden: true, output: true });
    
    // Delay between animation steps
    const stepDelay = 800;
    
    // Start animation sequence - same as forward propagation
    const startAnimation = () => {
      // Step 1: Show connections from input to first hidden node
      setAnimationPhase('forward-input-to-hidden-1');
      setVisibleConnections({
        inputToHidden: [[true, true], [false, false], [false, false]],
        hiddenToOutput: [[false, false, false]]
      });
      
      // Step 2: Show first hidden node
      setTimeout(() => {
        setAnimationStep(1);
        const newVisibleNodes = { ...visibleNodes };
        newVisibleNodes.hidden[0] = true;
        setVisibleNodes(newVisibleNodes);
        setLayerOutputs(stepOutputs[1]);
        
        // Step 3: Show connections from input to second hidden node
        setTimeout(() => {
          setAnimationPhase('forward-input-to-hidden-2');
          setVisibleConnections({
            inputToHidden: [[true, true], [true, true], [false, false]],
            hiddenToOutput: [[false, false, false]]
          });
          
          // Step 4: Show second hidden node
          setTimeout(() => {
            setAnimationStep(2);
            const newVisibleNodes = { ...visibleNodes };
            newVisibleNodes.hidden[0] = true;
            newVisibleNodes.hidden[1] = true;
            setVisibleNodes(newVisibleNodes);
            setLayerOutputs(stepOutputs[2]);
            
            // Step 5: Show connections from input to third hidden node
            setTimeout(() => {
              setAnimationPhase('forward-input-to-hidden-3');
              setVisibleConnections({
                inputToHidden: [[true, true], [true, true], [true, true]],
                hiddenToOutput: [[false, false, false]]
              });
              
              // Step 6: Show third hidden node
              setTimeout(() => {
                setAnimationStep(3);
                const newVisibleNodes = { ...visibleNodes };
                newVisibleNodes.hidden[0] = true;
                newVisibleNodes.hidden[1] = true;
                newVisibleNodes.hidden[2] = true;
                setVisibleNodes(newVisibleNodes);
                setLayerOutputs(stepOutputs[3]);
                
                // Step 7: Show connections from hidden to output
                setTimeout(() => {
                  setAnimationPhase('forward-hidden-to-output');
                  setVisibleConnections({
                    inputToHidden: [[true, true], [true, true], [true, true]],
                    hiddenToOutput: [[true, true, true]]
                  });
                  
                  // Step 8: Show output node
                  setTimeout(() => {
                    setAnimationStep(4);
                    const newVisibleNodes = { ...visibleNodes };
                    newVisibleNodes.hidden = [true, true, true];
                    newVisibleNodes.output = [true];
                    setVisibleNodes(newVisibleNodes);
                    setLayerOutputs(stepOutputs[4]);
                    
                    // Final step: Complete animation
                    setTimeout(() => {
                      setAnimationPhase(null);
                    }, stepDelay);
                  }, stepDelay);
                }, stepDelay);
              }, stepDelay);
            }, stepDelay);
          }, stepDelay);
        }, stepDelay);
      }, stepDelay);
    };
    
    // Start the animation
    startAnimation();
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
    // Reset state based on current mode
    if (mode === "train") {
      // In training mode, hide hidden and output layers
      setVisibleLayers({ input: true, hidden: false, output: false });
      // Clear layer outputs
      setLayerOutputs({ A1: [0, 0, 0], A2: [0] });
    } else if (mode === "apply") {
      // In apply mode, show all layers
      setVisibleLayers({ input: true, hidden: true, output: true });
      // Don't calculate output values, keep them at 0
      setLayerOutputs({ A1: [0, 0, 0], A2: [0] });
    }
    
    // Reset animation phase
    setAnimationPhase(null);
    // Enable forward propagation, disable backpropagation
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
            {t('trainingMode')}
          </ToggleButton>
          <ToggleButton value="apply" aria-label="Apply Mode">
            {t('applyMode')}
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
            oldW1={oldWeights?.W1}
            oldW2={oldWeights?.W2}
            inputSize={inputSize} 
            hiddenSize={hiddenSize} 
            outputSize={outputSize}
            animationPhase={animationPhase}
            visibleConnections={visibleConnections}
          />
          
          <NetworkLayer 
            layerIndex={0} 
            layerName={t('inputLayer')} 
            size={inputSize} 
            values={inputs} 
            visible={visibleLayers.input} 
          />
          
          <NetworkLayer 
            layerIndex={1} 
            layerName={t('hiddenLayer')} 
            size={hiddenSize} 
            values={layerOutputs.A1} 
            visible={visibleLayers.hidden}
            visibleNodes={visibleNodes.hidden}
            animationStep={animationStep}
          />
          
          <NetworkLayer 
            layerIndex={2} 
            layerName={t('outputLayer')} 
            size={outputSize} 
            values={layerOutputs.A2} 
            visible={visibleLayers.output}
            visibleNodes={visibleNodes.output}
            animationStep={animationStep}
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