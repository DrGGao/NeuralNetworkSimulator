import React, { createContext, useState, useContext, useEffect } from 'react';

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
  },
  zh: {
    // App
    appTitle: '神经网络可视化',
    
    // Modes
    trainingMode: '训练模式',
    applyMode: '应用模式',
    
    // Controls
    inputs: '输入',
    input1: '输入值 1',
    input2: '输入值 2',
    learningRate: '学习率',
    targetValue: '目标值',
    outputValue: '输出值',
    calculatedFromNetwork: '网络计算得出',
    
    // Buttons
    forwardPropagation: '前向传播',
    backwardPropagation: '反向传播',
    applyNetwork: '应用网络',
    
    // Weights initialization
    weightsInitialization: '权重初始化',
    goodInitialization: '良好初始化',
    badInitialization: '不良初始化',
    reset: '重置',
    
    // Layers
    inputLayer: '输入层',
    hiddenLayer: '隐藏层',
    outputLayer: '输出层',
    targetOutputValue: '目标输出值',
  }
};

// Language provider component
export const LanguageProvider = ({ children }) => {
  // Get initial language from local storage, default to English if not found
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'en';
  });
  
  // Toggle language function
  const toggleLanguage = () => {
    setLanguage(prevLang => {
      const newLang = prevLang === 'en' ? 'zh' : 'en';
      localStorage.setItem('language', newLang);
      return newLang;
    });
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