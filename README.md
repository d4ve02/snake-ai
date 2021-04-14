# Snake AI

Hello and welcome to the Snake AI project! The goal of this project is developing an AI that learns how to play snake while providing an explanation of how the development process is being carried out and hopefully a resource someone can learn something from!

The project is hosted live on [link], feel free to suggest any improvements!

## :scroll: Small guide

To run the front-end with the game simulation:

```
	$ git clone https://github.com/d4ve02/snake-ai.git
	$ cd snake-ai
	$ npm i
	$ npm start
```

I've also included the script I used to train the AI with Python:

```
	$ cd python
	$ mkdir saved
	$ cd saved
	$ mkdir db
	$ mkdir dna
	$ mkdir plots
	$ cd ..
	$ python ./main.py
```

## :notebook: How is the AI structured

The AI is a neural network with 3 layers:

1. One hidden layer with 8 nodes and 26 inputs
2. Another hidden layer with 8 nodes
3. One output layer with 3 nodes
   All nodes have a sigmoid activation function. The input size is 26.

### How the inputs are calculated

The 26 input values are divided into "proximity sensors" (24 nodes) and information about the apple's location (2 nodes).

The proximity sensors are highlighted on the "information mode" in the game. Basically, they're 6 cells close to the snake's head, and for each of these cells we have 4 nodes in a one-hot configuration (one and only one of these nodes is active at a time). Each one of these 4 nodes encodes what that sensor sees: a wall, a part of the snake, an apple, or nothing. These are the first 24 nodes.

The last 2 nodes encode information about the apple's location, sepcifically the distance between apple and snake and the angle between them.
The distance value is normalized into a (0, 1) domain while the angle is normalized into a (-1, +1) domain.

### How the outputs are interpreted

The three output nodes decide where the snake will be heading. The node with the highest value decides what the snake's direction will be.
The first node encodes the FORWARD direction, the second encodes RIGHT and the third encodes LEFT.

## :bulb: You can train your own AI!

You can train your own AI and try it here! All you have to do is get your weights and biases and flatten them in a single dimension array, and copy paste the array into the dna.js file!

## :pencil2: Development Logs

Hello and welcome to the Snake AI project!
My name is Davide Halili and this is the first development log of this project! I'm attempting to develop the best Snake AI I can, using genetic algorithms to tune a neural network's parameters until I get a <i>really</i> good AI.
The current AI structure is a neural network with:

1. an input layer with 26 input neurons, click the "i" button above to know what the inputs are!
2. two hidden layers with 8 neurons each
3. one output layer with 3 neurons that encode LEFT, STRAIGHT or RIGHT

I've trained a decent AI at this point, but it has
four big issues:

1. it can't get any apples if they're touching the wall
2. it can't get any apples on the left side of the map
3. it doesn't know how to avoid hitting itself
4. it sometimes gets stuck in loops
   The best way to solve these issues is: changing the map size randomly during training to give the AI more opportunities to learn how to avoid hitting itself; simply training more.
   The next step is implementing the same training algorithm using C++ instead of Python, so I can get better performance and train with bigger population size.

Until then, have a fun time coding! Dave :)
