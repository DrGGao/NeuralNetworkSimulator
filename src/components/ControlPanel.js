import React from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Slider, 
  Paper,
  Grid,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLanguage } from '../utils/languageContext';

const ControlPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(4),
  borderRadius: '12px',
  boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
  backgroundColor: '#fff',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  borderRadius: '8px',
  padding: '8px 16px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
}));

const OutputValueContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.primary.light}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  textAlign: 'center',
}));

const ControlPanel = ({
  input1,
  input2,
  learningRate,
  targetValue,
  outputValue,
  onInput1Change,
  onInput2Change,
  onLearningRateChange,
  onTargetValueChange,
  onGoodInitialization,
  onBadInitialization,
  mode
}) => {
  const { t } = useLanguage();
  
  // Render different control panels based on the mode
  return (
    <ControlPaper elevation={3}>
      <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
        {mode === "train" ? t('trainingMode') : t('applyMode')}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Input section is common for both modes */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>{t('inputs')}</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label={t('input1')}
                type="number"
                size="small"
                value={input1}
                onChange={onInput1Change}
                variant="outlined"
                InputProps={{ inputProps: { step: 0.1 } }}
              />
              <TextField
                label={t('input2')}
                type="number"
                size="small"
                value={input2}
                onChange={onInput2Change}
                variant="outlined"
                InputProps={{ inputProps: { step: 0.1 } }}
              />
            </Box>
          </Box>
          
          {/* Learning rate section - only visible in training mode */}
          {mode === "train" && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>{t('learningRate')}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                <Typography variant="body2" sx={{ width: '60px' }}>0.01</Typography>
                <Slider
                  value={parseFloat(learningRate)}
                  min={0.01}
                  max={0.5}
                  step={0.01}
                  onChange={onLearningRateChange}
                  valueLabelDisplay="auto"
                />
                <Typography variant="body2" sx={{ width: '60px', textAlign: 'right' }}>0.5</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  {t('learningRate')}: {learningRate}
                </Typography>
              </Box>
            </Box>
          )}
        </Grid>
          
        <Grid item xs={12} md={6}>
          {/* Target/Output value section - different for each mode */}
          <Box sx={{ mb: 3 }}>
            {mode === "train" ? (
              <>
                <Typography variant="subtitle2" gutterBottom>{t('targetValue')}</Typography>
                <TextField
                  label={t('targetOutputValue')}
                  type="number"
                  size="small"
                  value={targetValue}
                  onChange={onTargetValueChange}
                  variant="outlined"
                  fullWidth
                  InputProps={{ inputProps: { step: 0.1 } }}
                />
              </>
            ) : (
              <>
                <Typography variant="subtitle2" gutterBottom>{t('outputValue')}</Typography>
                <OutputValueContainer>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {outputValue.toFixed(3)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {t('calculatedFromNetwork')}
                  </Typography>
                </OutputValueContainer>
              </>
            )}
          </Box>
          
          {/* Weight initialization section - only visible in training mode */}
          {mode === "train" && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>{t('weightsInitialization')}</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <StyledButton 
                  variant="outlined" 
                  color="primary" 
                  onClick={onGoodInitialization}
                  fullWidth
                >
                  {t('goodInitialization')}
                </StyledButton>
                <StyledButton 
                  variant="outlined" 
                  color="secondary" 
                  onClick={onBadInitialization}
                  fullWidth
                >
                  {t('badInitialization')}
                </StyledButton>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 2 }} />
    </ControlPaper>
  );
};

export default ControlPanel; 