# Neural Network Visualization Tool

This is a neural network visualization tool developed using React, providing an intuitive demonstration of forward and backward propagation processes.

## Features

- Visualization of a simple neural network (2 input nodes, 3 hidden nodes, and 1 output node)
- Animated demonstrations of forward and backward propagation
- Customizable input values, target values, and learning rate
- Options for good and poor weight initialization for comparative learning
- Modern and attractive UI interface

## Technology Stack

- React 18
- Material UI
- Responsive design
- CSS-in-JS (Styled Components)

## Getting Started

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm start
```

The project will launch at http://localhost:3000.

## How to Use

1. Set input values in the input fields (default: 1 and 2)
2. Set the target output value (default: 1.0)
3. Adjust the learning rate slider (default: 0.1)
4. Click the "Forward Propagation" button to observe the network process
5. Click the "Backpropagation" button to see how weights update
6. Use the "Good Initialization" and "Bad Initialization" buttons to try different weight configurations

## Project Structure

```
/src
  /components        # React components
    - NeuralNetworkSimulator.js  # Main component
    - NetworkLayer.js            # Network layer component
    - NeuronNode.js              # Neuron node component
    - ConnectionLines.js         # Connection lines SVG component
    - ControlPanel.js            # Control panel component
    - TargetValueDisplay.js      # Target value display component
  /utils
    - neuralNetworkUtils.js      # Neural network calculation utility functions
  - App.js                       # Application entry
  - index.js                     # React entry point
``` 