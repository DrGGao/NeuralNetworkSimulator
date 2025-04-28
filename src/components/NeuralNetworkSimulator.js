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
    
    // Divide animation into multiple phases
    // Phase 1: Input layer to hidden layer calculation
    // Phase 2: Display hidden layer values
    // Phase 3: Hidden layer to output layer calculation
    // Phase 4: Display output layer values
    
    // Calculate forward propagation results but don't display yet
    const { A1, A2 } = forwardPropagation(inputs, weights);
    
    // Set basic time parameters
    const transitionTime = 1500; // Basic transition time
    const updateInterval = 50; // Update interval
    const steps = 20; // Animation steps
    
    // Phase 1: Input layer to hidden layer calculation - only show input layer and connections
    setAnimationPhase('forward-input');
    setVisibleLayers({ input: true, hidden: false, output: false });
    
    // Phase 2: Display hidden layer values
    setTimeout(() => {
      // Animate showing hidden layer values
      setVisibleLayers({ input: true, hidden: true, output: false });
      
      let step = 0;
      const initialA1 = [0, 0, 0];
      const animateA1 = setInterval(() => {
        step++;
        // Gradually increase hidden layer values
        const animatedA1 = initialA1.map((_, i) => {
          return (A1[i] * step) / steps;
        });
        
        setLayerOutputs(prev => ({ ...prev, A1: animatedA1 }));
        
        if (step >= steps) {
          clearInterval(animateA1);
          setLayerOutputs(prev => ({ ...prev, A1 }));
          
          // Phase 3: Hidden layer to output layer calculation
          setTimeout(() => {
            // Switch animation phase, show multiplication steps from hidden to output layer
            setAnimationPhase('forward-hidden');
            
            // Phase 4: Display output layer results
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
                  
                  // Complete all phases
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
    
    // First show the transition text for 0.5 seconds
    setTimeout(() => {
      // After 0.5 seconds, directly update weights to new values
      setWeights({
        W1: newW1,
        W2: newW2
      });
      
      // End animation phase after transition is complete
      setTimeout(() => {
        setAnimationPhase(null);
        setOldWeights(null);
        
        // Keep all layers visible, but enable forward button for next round
        // and disable backward button
        setForwardDisabled(false);
        setBackwardDisabled(true);
        
        // Recalculate outputs with new weights to show updated network state
        const { A1, A2 } = forwardPropagation(inputs, { W1: newW1, W2: newW2 });
        setLayerOutputs({ A1, A2 });
      }, 1500);
    }, 500); // Display transition text for 0.5 seconds
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
    
    // Set basic time parameters
    const transitionTime = 1500; // Basic transition time
    
    // Phase 1: First only show input layer to hidden layer connection calculations
    setAnimationPhase('apply-input');
    
    // Clear output values (set to 0 so nothing is displayed in ControlPanel)
    setLayerOutputs(prev => ({ ...prev, A2: [0] }));
    
    // Phase 2: Delay showing hidden layer values
    setTimeout(() => {
      // Show hidden layer calculation results
      setLayerOutputs(prev => ({ ...prev, A1 }));
      
      // Phase 3: Show hidden layer to output layer connection calculations
      setTimeout(() => {
        setAnimationPhase('apply-hidden');
        
        // Phase 4: Finally show output results
        setTimeout(() => {
          // Show final output value
          setLayerOutputs(prev => ({ ...prev, A2 }));
          
          // End animation phase
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
            oldW1={oldWeights?.W1}
            oldW2={oldWeights?.W2}
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