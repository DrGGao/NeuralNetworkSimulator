import React from 'react';
import { useLanguage } from '../utils/languageContext';

// Empty component - no language toggle in English-only version
const LanguageToggle = () => {
  // We still use the context to prevent any potential errors in parent components
  useLanguage();
  
  // Return null (no UI rendered)
  return null;
};

export default LanguageToggle; 