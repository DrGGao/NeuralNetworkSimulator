// Initialize weights
export const goodWeights = {
  W1: [[0.39, 0.49], [0.96, 0.53], [0.04, 0.24]],
  W2: [[0.56, 0.47, 0.51]]
};

export const badWeights = {
  W1: [[0.56, 0.12], [0.64, 0.83], [0.48, 0.80]],
  W2: [[0.41, -0.36, -0.22]]
};

// Activation function
export const ReLU = (x) => Math.max(0, x);

// Activation function derivative
export const ReLUDerivative = (x) => x > 0 ? 1 : 0;

// Forward propagation
export const forwardPropagation = (inputs, weights) => {
  const { W1, W2 } = weights;
  
  // Calculate hidden layer outputs
  const A1 = W1.map((weights) => {
    return ReLU(weights.reduce((sum, weight, i) => sum + weight * inputs[i], 0));
  });

  // Calculate output layer outputs
  const A2 = W2.map((weights) => {
    return ReLU(weights.reduce((sum, weight, i) => sum + weight * A1[i], 0));
  });

  return { inputs, A1, A2 };
};

// Backward propagation
export const backwardPropagation = (inputs, A1, A2, W1, W2, targetOutputs, learningRate) => {
  // Calculate output layer errors and gradients
  const outputErrors = targetOutputs.map((target, i) => target - A2[i]);
  const outputDeltas = outputErrors.map((error, i) => error * ReLUDerivative(A2[i]));
  
  // Calculate hidden layer errors and gradients
  const hiddenErrors = W2[0].map((w, j) => w * outputDeltas[0]);
  const hiddenDeltas = hiddenErrors.map((error, i) => error * ReLUDerivative(A1[i]));
  
  // Update output layer weights
  const newW2 = W2.map((weights, i) => weights.map((w, j) => w + learningRate * outputDeltas[i] * A1[j]));
  
  // Update hidden layer weights
  const newW1 = W1.map((weights, i) => weights.map((w, j) => w + learningRate * hiddenDeltas[i] * inputs[j]));
  
  return { newW1, newW2 };
};

// Find minimum and maximum weight values
export const findMinMaxWeights = (W1, W2) => {
  const allWeights = [...W1.flat(), ...W2.flat()];
  const maxWeight = Math.max(...allWeights);
  const minWeight = Math.min(...allWeights);
  return { maxWeight, minWeight };
};

// Calculate color based on weight value
export const getWeightColor = (weight, { maxWeight, minWeight }) => {
  const intensity = (weight - minWeight) / (maxWeight - minWeight);
  const colorValue = Math.floor(255 - intensity * 255);
  
  if (weight > 0) {
    // Use green for positive weights
    return `rgb(0, ${colorValue}, 0)`;
  } else {
    // Use red for negative weights
    return `rgb(${colorValue}, 0, 0)`;
  }
}; 