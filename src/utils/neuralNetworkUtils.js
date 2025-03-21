// 初始化权重
export const goodWeights = {
  W1: [[0.39, 0.49], [0.96, 0.53], [0.04, 0.24]],
  W2: [[0.56, 0.47, 0.51]]
};

export const badWeights = {
  W1: [[0.56, 0.12], [0.64, 0.83], [0.48, 0.80]],
  W2: [[0.41, -0.36, -0.22]]
};

// 激活函数
export const ReLU = (x) => Math.max(0, x);

// 激活函数导数
export const ReLUDerivative = (x) => x > 0 ? 1 : 0;

// 前向传播
export const forwardPropagation = (inputs, weights) => {
  const { W1, W2 } = weights;
  
  // 计算隐藏层输出
  const A1 = W1.map((weights) => {
    return ReLU(weights.reduce((sum, weight, i) => sum + weight * inputs[i], 0));
  });

  // 计算输出层输出
  const A2 = W2.map((weights) => {
    return ReLU(weights.reduce((sum, weight, i) => sum + weight * A1[i], 0));
  });

  return { inputs, A1, A2 };
};

// 反向传播
export const backwardPropagation = (inputs, A1, A2, W1, W2, targetOutputs, learningRate) => {
  // 计算输出层误差和梯度
  const outputErrors = targetOutputs.map((target, i) => target - A2[i]);
  const outputDeltas = outputErrors.map((error, i) => error * ReLUDerivative(A2[i]));
  
  // 计算隐藏层误差和梯度
  const hiddenErrors = W2[0].map((w, j) => w * outputDeltas[0]);
  const hiddenDeltas = hiddenErrors.map((error, i) => error * ReLUDerivative(A1[i]));
  
  // 更新输出层权重
  const newW2 = W2.map((weights, i) => weights.map((w, j) => w + learningRate * outputDeltas[i] * A1[j]));
  
  // 更新隐藏层权重
  const newW1 = W1.map((weights, i) => weights.map((w, j) => w + learningRate * hiddenDeltas[i] * inputs[j]));
  
  return { newW1, newW2 };
};

// 找出权重的最大值和最小值
export const findMinMaxWeights = (W1, W2) => {
  const allWeights = [...W1.flat(), ...W2.flat()];
  const maxWeight = Math.max(...allWeights);
  const minWeight = Math.min(...allWeights);
  return { maxWeight, minWeight };
};

// 根据权重值计算颜色
export const getWeightColor = (weight, { maxWeight, minWeight }) => {
  const intensity = (weight - minWeight) / (maxWeight - minWeight);
  const colorValue = Math.floor(255 - intensity * 255);
  
  if (weight > 0) {
    // 正权重使用绿色
    return `rgb(0, ${colorValue}, 0)`;
  } else {
    // 负权重使用红色
    return `rgb(${colorValue}, 0, 0)`;
  }
}; 