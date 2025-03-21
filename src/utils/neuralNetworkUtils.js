// Initialize weights
export const goodWeights = {
  W1: [[0.39, 0.49], [0.96, 0.53], [0.04, 0.24]],
  W2: [[0.56, 0.47, 0.51]]
};

export const badWeights = {
  W1: [[0.56, 0.12], [0.64, 0.83], [0.48, 0.80]],
  W2: [[0.41, -0.36, -0.22]]
};

// Activation function with safety check
export const ReLU = (x) => {
  if (isNaN(x)) {
    console.error('NaN input to ReLU activation function!');
    return 0;
  }
  return Math.max(0, x);
};

// Activation function derivative with safety check
export const ReLUDerivative = (x) => {
  if (isNaN(x)) {
    console.error('NaN input to ReLUDerivative function!');
    return 0;
  }
  return x > 0 ? 1 : 0;
};

// Forward propagation
export const forwardPropagation = (inputs, weights) => {
  const { W1, W2 } = weights;
  
  console.log('Forward propagation inputs:', inputs);
  console.log('W1:', W1);
  console.log('W2:', W2);
  
  // Calculate hidden layer outputs
  const A1 = W1.map((weights, idx) => {
    const sum = weights.reduce((sum, weight, i) => {
      const product = weight * inputs[i];
      console.log(`W1[${idx}][${i}] * inputs[${i}] = ${weight} * ${inputs[i]} = ${product}`);
      return sum + product;
    }, 0);
    console.log(`Hidden node ${idx} sum before ReLU:`, sum);
    const activated = ReLU(sum);
    console.log(`Hidden node ${idx} after ReLU:`, activated);
    return activated;
  });
  
  console.log('Hidden layer outputs (A1):', A1);

  // Calculate output layer outputs
  const A2 = W2.map((weights, idx) => {
    const sum = weights.reduce((sum, weight, i) => {
      const product = weight * A1[i];
      console.log(`W2[${idx}][${i}] * A1[${i}] = ${weight} * ${A1[i]} = ${product}`);
      if (isNaN(product)) {
        console.error('NaN detected in product calculation!');
      }
      return sum + product;
    }, 0);
    console.log(`Output node ${idx} sum before ReLU:`, sum);
    if (isNaN(sum)) {
      console.error('NaN detected in sum calculation!');
    }
    const activated = ReLU(sum);
    console.log(`Output node ${idx} after ReLU:`, activated);
    return activated;
  });
  
  console.log('Output layer results (A2):', A2);

  return { inputs, A1, A2 };
};

// Backward propagation
export const backwardPropagation = (inputs, A1, A2, W1, W2, targetOutputs, learningRate) => {
  console.log('Backpropagation inputs:', {inputs, A1, A2, W1, W2, targetOutputs, learningRate});
  
  // Safety check for NaN values in inputs
  if (inputs.some(isNaN) || A1.some(isNaN) || A2.some(isNaN) || 
      W1.some(row => row.some(isNaN)) || W2.some(row => row.some(isNaN)) ||
      targetOutputs.some(isNaN) || isNaN(learningRate)) {
    console.error('NaN detected in backpropagation inputs!');
    // Return original weights to prevent propagation of NaN
    return { newW1: W1, newW2: W2 };
  }
  
  // Calculate output layer errors and gradients
  const outputErrors = targetOutputs.map((target, i) => {
    const error = target - A2[i];
    console.log(`Output error for node ${i}: ${target} - ${A2[i]} = ${error}`);
    return error;
  });
  
  const outputDeltas = outputErrors.map((error, i) => {
    const derivative = ReLUDerivative(A2[i]);
    console.log(`ReLU derivative for A2[${i}] (${A2[i]}):`, derivative);
    const delta = error * derivative;
    console.log(`Output delta for node ${i}: ${error} * ${derivative} = ${delta}`);
    if (isNaN(delta)) console.error(`NaN detected in output delta calculation!`);
    return delta;
  });
  
  // Calculate hidden layer errors and gradients
  const hiddenErrors = W2[0].map((w, j) => {
    const error = w * outputDeltas[0];
    console.log(`Hidden error for node ${j}: ${w} * ${outputDeltas[0]} = ${error}`);
    if (isNaN(error)) console.error(`NaN detected in hidden error calculation!`);
    return error;
  });
  
  const hiddenDeltas = hiddenErrors.map((error, i) => {
    const derivative = ReLUDerivative(A1[i]);
    console.log(`ReLU derivative for A1[${i}] (${A1[i]}):`, derivative);
    const delta = error * derivative;
    console.log(`Hidden delta for node ${i}: ${error} * ${derivative} = ${delta}`);
    if (isNaN(delta)) console.error(`NaN detected in hidden delta calculation!`);
    return delta;
  });
  
  // Update output layer weights
  const newW2 = W2.map((weights, i) => weights.map((w, j) => {
    const update = learningRate * outputDeltas[i] * A1[j];
    const newWeight = w + update;
    console.log(`New W2[${i}][${j}]: ${w} + ${learningRate} * ${outputDeltas[i]} * ${A1[j]} = ${newWeight}`);
    if (isNaN(newWeight)) console.error(`NaN detected in W2 update!`);
    return newWeight;
  }));
  
  // Update hidden layer weights
  const newW1 = W1.map((weights, i) => weights.map((w, j) => {
    const update = learningRate * hiddenDeltas[i] * inputs[j];
    const newWeight = w + update;
    console.log(`New W1[${i}][${j}]: ${w} + ${learningRate} * ${hiddenDeltas[i]} * ${inputs[j]} = ${newWeight}`);
    if (isNaN(newWeight)) console.error(`NaN detected in W1 update!`);
    return newWeight;
  }));
  
  console.log('Updated weights:', {newW1, newW2});
  
  // Final check for NaN values
  if (newW1.some(row => row.some(isNaN)) || newW2.some(row => row.some(isNaN))) {
    console.error('NaN detected in updated weights!');
    // Return original weights to prevent propagation of NaN
    return { newW1: W1, newW2: W2 };
  }
  
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

// Function to check and fix NaN in weights
export const checkAndFixWeights = (weights) => {
  const { W1, W2 } = weights;
  
  let hasNaN = false;
  
  // Check W1 for NaN
  for (let i = 0; i < W1.length; i++) {
    for (let j = 0; j < W1[i].length; j++) {
      if (isNaN(W1[i][j])) {
        console.error(`NaN detected in W1[${i}][${j}], resetting to default`);
        W1[i][j] = 0.1; // Set to small positive value
        hasNaN = true;
      }
    }
  }
  
  // Check W2 for NaN
  for (let i = 0; i < W2.length; i++) {
    for (let j = 0; j < W2[i].length; j++) {
      if (isNaN(W2[i][j])) {
        console.error(`NaN detected in W2[${i}][${j}], resetting to default`);
        W2[i][j] = 0.1; // Set to small positive value
        hasNaN = true;
      }
    }
  }
  
  if (hasNaN) {
    console.warn('NaN values detected and fixed in weights. Consider reinitializing the network.');
  }
  
  return { W1, W2 };
}; 