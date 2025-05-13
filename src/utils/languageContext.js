import React, { createContext, useState, useContext } from 'react';

// Create language context
export const LanguageContext = createContext();

// Translation data
export const translations = {
  en: {
    // App
    appTitle: 'Neural Network Visualization',
    
    // Modes
    trainingMode: 'Training Mode',
    applyMode: 'Apply Mode',
    
    // Controls
    inputs: 'Inputs',
    input1: 'Input Value 1',
    input2: 'Input Value 2',
    learningRate: 'Learning Rate',
    targetValue: 'Target Value',
    outputValue: 'Output Value',
    calculatedFromNetwork: 'Calculated from network',
    
    // Buttons
    forwardPropagation: 'Forward Propagation',
    backwardPropagation: 'Backward Propagation',
    applyNetwork: 'Apply Network',
    
    // Weights initialization
    weightsInitialization: 'Weights Initialization',
    goodInitialization: 'Good Initialization',
    badInitialization: 'Bad Initialization',
    reset: 'Reset',
    
    // Layers
    inputLayer: 'Input Layer',
    hiddenLayer: 'Hidden Layer',
    outputLayer: 'Output Layer',
    targetOutputValue: 'Target Output Value',
    
    // Backpropagation phases
    backpropagationPhase1: 'Step 1: Output Layer to Hidden Layer Backpropagation',
    backpropagationPhase2: 'Step 2: Hidden Layer to Input Layer Backpropagation',
  },
  zh: {
    // App
    appTitle: '',
    
    // Modes
    trainingMode: '',
    applyMode: '',
    
    // Controls
    inputs: '',
    input1: '',
    input2: '',
    learningRate: '',
    targetValue: '',
    outputValue: '',
    calculatedFromNetwork: '',
    
    // Buttons
    forwardPropagation: '',
    backwardPropagation: '',
    applyNetwork: '',
    
    // Weights initialization
    weightsInitialization: '',
    goodInitialization: '',
    badInitialization: '',
    reset: '',
    
    // Layers
    inputLayer: '',
    hiddenLayer: '',
    outputLayer: '',
    targetOutputValue: '',
    
    // Backpropagation phases
    backpropagationPhase1: '',
    backpropagationPhase2: '',
  }
};

// Language provider component - English only
export const LanguageProvider = ({ children }) => {
  // Fixed to English
  const [language] = useState('en');
  
  // Disabled toggle function (no-op)
  const toggleLanguage = () => {
    // Disabled - does nothing
  };
  
  // Translation lookup function
  const t = (key) => {
    return translations[language][key] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for easier access in components
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 