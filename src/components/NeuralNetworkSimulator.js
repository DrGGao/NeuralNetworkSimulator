import React, { useState } from 'react';
import { Box, Paper, ToggleButtonGroup, ToggleButton, Typography, Button, Divider } from '@mui/material';
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

// Create a styled button component
const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  padding: theme.spacing(1, 3),
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 14px rgba(0,0,0,0.15)',
  },
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
    A1: [null, null, null],
    A2: [null]
  });
  const [visibleLayers, setVisibleLayers] = useState({
    input: true,
    hidden: true,
    output: true
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
  const [learningRate, setLearningRate] = useState(0.05);
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
      resetStateForMode(newMode);
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
    
    // 创建每个动画阶段的输出步骤 - 按照连线和节点值分开更新
    const stepOutputs = [
      { A1: [null, null, null], A2: [null] },  // 初始状态
      { A1: [A1[0], null, null], A2: [null] },  // 第一个隐藏节点值
      { A1: [A1[0], A1[1], null], A2: [null] },  // 第二个隐藏节点值
      { A1: [A1[0], A1[1], A1[2]], A2: [null] },  // 所有隐藏节点值
      { A1: [A1[0], A1[1], A1[2]], A2: [A2[0]] }  // 输出节点值
    ];
    
    // Reset animation state
    setAnimationStep(0);
    
    // 设置所有神经元为可见
    setVisibleNodes({
      hidden: [true, true, true], 
      output: [true]
    });
    
    setVisibleConnections({
      inputToHidden: [[false, false], [false, false], [false, false]],
      hiddenToOutput: [[false, false, false]]
    });
    
    // Set initial layer outputs to first step
    setLayerOutputs(stepOutputs[0]);
    
    // Make sure all layers are visible
    setVisibleLayers({ input: true, hidden: true, output: true });
    
    // Delay between animation steps
    const stepDelay = 800;
    
    // Start animation sequence - 修改动画顺序，先显示连线动画，再更新节点值
    const startAnimation = () => {
      // Step 1: 显示输入层到第一个隐藏节点的连线
      setAnimationPhase('forward-input-to-hidden-1');
      setVisibleConnections({
        inputToHidden: [[true, true], [false, false], [false, false]],
        hiddenToOutput: [[false, false, false]]
      });
      
      // 延迟后显示第一个隐藏节点的值
      setTimeout(() => {
        setAnimationStep(1);
        setLayerOutputs(stepOutputs[1]);
        
        // 显示输入层到第二个隐藏节点的连线
        setTimeout(() => {
          setAnimationPhase('forward-input-to-hidden-2');
          setVisibleConnections({
            inputToHidden: [[true, true], [true, true], [false, false]],
            hiddenToOutput: [[false, false, false]]
          });
          
          // 延迟后显示第二个隐藏节点的值
          setTimeout(() => {
            setAnimationStep(2);
            setLayerOutputs(stepOutputs[2]);
            
            // 显示输入层到第三个隐藏节点的连线
            setTimeout(() => {
              setAnimationPhase('forward-input-to-hidden-3');
              setVisibleConnections({
                inputToHidden: [[true, true], [true, true], [true, true]],
                hiddenToOutput: [[false, false, false]]
              });
              
              // 延迟后显示第三个隐藏节点的值
              setTimeout(() => {
                setAnimationStep(3);
                setLayerOutputs(stepOutputs[3]);
                
                // 显示所有隐藏层到输出层的连线
                setTimeout(() => {
                  setAnimationPhase('forward-hidden-to-output');
                  setVisibleConnections({
                    inputToHidden: [[true, true], [true, true], [true, true]],
                    hiddenToOutput: [[true, true, true]]
                  });
                  
                  // 延迟后显示输出节点的值
                  setTimeout(() => {
                    setAnimationStep(4);
                    setLayerOutputs(stepOutputs[4]);
                    
                    // 动画完成
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
    
    // Implement phased backpropagation animation
    
    // Phase 1: Output layer to hidden layer (W2 weights update)
    setAnimationPhase('backward-phase1');
    
    // Create visual cue
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
    statusMessage.textContent = t('backpropagationPhase1'); // "Step 1: Output Layer to Hidden Layer Backpropagation"
    document.body.appendChild(statusMessage);
    
    // Speed up animation by 50%: change 2 second delay to 1 second
    setTimeout(() => {
      // Only update W2 weights
      setWeights({
        W1: weights.W1, // Keep W1 unchanged
        W2: newW2       // Only update W2
      });
      
      // Speed up animation by 50%: change 5 second delay to 2.5 seconds
      setTimeout(() => {
        // Update visual cue
        const phaseStatus = document.getElementById('phase-status');
        if (phaseStatus) {
          phaseStatus.textContent = t('backpropagationPhase2'); // "Step 2: Hidden Layer to Input Layer Backpropagation"
        }
        
        // Set second phase animation state
        setAnimationPhase('backward-phase2');
        
        // Save new W2 value and original W1 value
        setOldWeights({
          W1: weights.W1.map(row => [...row]),
          W2: newW2.map(row => [...row])
        });
        
        // Speed up animation by 50%: change 2 second delay to 1 second
        setTimeout(() => {
          // Complete all weight updates
          setWeights({
            W1: newW1,
            W2: newW2
          });
          
          // Speed up animation by 50%: change 5 second delay to 2.5 seconds
          setTimeout(() => {
            // Remove visual cue
            const phaseStatus = document.getElementById('phase-status');
            if (phaseStatus) {
              phaseStatus.style.opacity = '0';
              setTimeout(() => phaseStatus.remove(), 500);
            }
            
            // End animation phase
            setAnimationPhase(null);
            setOldWeights(null);
            
            // Re-enable forward propagation button, disable backward propagation button
            setForwardDisabled(false);
            setBackwardDisabled(true);
          }, 2500);
        }, 1000);
      }, 2500);
    }, 1000);
  };
  
  // Apply network function for apply mode
  const handleApplyNetwork = () => {
    // Safety check for NaN in weights before propagation
    const safeWeights = checkAndFixWeights(weights);
    if (safeWeights !== weights) {
      setWeights(safeWeights);
    }
    
    // Calculate output immediately using the current (potentially corrected) weights
    const { A1, A2 } = forwardPropagation(inputs, safeWeights);
    
    // Reset animation state
    setAnimationStep(0);
    
    // 确保所有神经元始终可见
    setVisibleNodes({
      hidden: [true, true, true],
      output: [true]
    });
    
    // Show all connections immediately to avoid blank appearance
    setVisibleConnections({
      inputToHidden: [[true, true], [true, true], [true, true]],
      hiddenToOutput: [[true, true, true]]
    });
    
    // Show immediate result instead of starting blank
    setLayerOutputs({ A1, A2 });
    
    // 确保所有层始终可见
    setVisibleLayers({ input: true, hidden: true, output: true });
    
    // Provide user feedback by briefly highlighting the result
    setAnimationPhase('apply-complete');
    
    // Clear animation phase after a short delay to remove any highlighting
    setTimeout(() => {
      setAnimationPhase(null);
    }, 1500); // Brief highlight to show the calculation is complete
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
  
  // Reset state for a specific mode
  const resetStateForMode = (targetMode) => {
    // Ensure all layers are always visible regardless of mode
    setVisibleLayers({ input: true, hidden: true, output: true });
    
    // Handle layer outputs based on mode
    if (targetMode === "apply") {
      // For apply mode, calculate initial output automatically to avoid blank screen
      const safeWeights = checkAndFixWeights(weights);
      const { A1, A2 } = forwardPropagation(inputs, safeWeights);
      setLayerOutputs({ A1, A2 });
    } else {
      // For training mode, preserve existing values or set to null if no prior training
      setLayerOutputs(prevOutputs => {
        // 检查是否有现有值
        const hasValues = prevOutputs.A1.some(v => v !== null) || prevOutputs.A2.some(v => v !== null);
        // 如果有现有值，保留；否则保持为空数组但不是零
        return hasValues ? prevOutputs : { A1: [null, null, null], A2: [null] };
      });
    }
    
    // Ensure all nodes are visible
    setVisibleNodes({
      hidden: [true, true, true],
      output: [true]
    });
    
    // Set connection visibility based on target mode
    // In apply mode, show all connections immediately; in training mode, reset them
    if (targetMode === "apply") {
      setVisibleConnections({
        inputToHidden: [[true, true], [true, true], [true, true]],
        hiddenToOutput: [[true, true, true]]
      });
    } else {
      setVisibleConnections({
        inputToHidden: [[false, false], [false, false], [false, false]],
        hiddenToOutput: [[false, false, false]]
      });
    }
    
    // Reset animation phase
    setAnimationPhase(null);
    // Enable forward propagation, disable backpropagation
    setForwardDisabled(false);
    setBackwardDisabled(true);
  };

  // Reset state (for backward compatibility with other function calls)
  const resetState = () => {
    resetStateForMode(mode);
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
            flexDirection: 'column',
            width: '100%', 
            position: 'relative',
            height: '450px', // 增加高度以容纳按钮
            padding: '0 40px'
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-evenly',
              width: '100%', 
              position: 'relative',
              flex: 1,
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
          
          {/* Add divider */}
          <Divider sx={{ my: 1.5, width: '100%' }} />
          
          {/* Add buttons to neural network container */}
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1.5 }}>
            {mode === "train" ? (
              <>
                <StyledButton 
                  variant="contained" 
                  color="primary" 
                  onClick={handleForwardPropagation}
                  disabled={forwardDisabled}
                  sx={{ fontSize: '16px' }}
                >
                  {t('forwardPropagation')}
                </StyledButton>
                <StyledButton 
                  variant="contained" 
                  color="secondary" 
                  onClick={handleBackwardPropagation}
                  disabled={backwardDisabled}
                  sx={{ fontSize: '16px' }}
                >
                  {t('backwardPropagation')}
                </StyledButton>
              </>
            ) : (
              <StyledButton 
                variant="contained" 
                color="primary" 
                onClick={handleApplyNetwork}
                disabled={animationPhase !== null}
                sx={{ fontSize: '16px', px: 5 }}
              >
                {animationPhase === 'apply-complete' ? 'Applied!' : t('applyNetwork')}
              </StyledButton>
            )}
          </Box>
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
        onGoodInitialization={handleGoodInitialization}
        onBadInitialization={handleBadInitialization}
        mode={mode}
        outputValue={layerOutputs.A2[0] !== undefined ? layerOutputs.A2[0] : 0}
      />
    </Box>
  );
};

export default NeuralNetworkSimulator; 