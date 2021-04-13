import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' 
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import activations
import matplotlib.pyplot as plt
import seaborn as sns
sns.set()
sns.set_theme(style="whitegrid")
import random
import math
import numpy as np
import pandas as pd
pd.set_option("max_columns", None)
pd.set_option("max_rows", None)
import time
from threading import Thread
from numba import jit
import sys
import keras.backend as K


#--------------------------------SNAKE GAME--------------------------------#

# These values also represent the position of each in the one-hot input array
NOTHING_VALUE = 0
SNAKE_VALUE = 1
APPLE_VALUE = 2
WALL_VALUE = 3

ROWS = 25
COLS = 25

FORWARD = 0
RIGHT = 1
LEFT = -1

ATE_APPLE_CALLBACK = 0
GAME_OVER_CALLBACK = 1

ATE_APPLE_FITNESS = 1
WASTING_MOVES_PENALTY = 0
FITNESS_LOSS_PER_ITERATION = 0
MAX_MOVES = 150

MUTATIONS_PER_DNA = 200
MUTATION_STRENGTH_MAX = 2
MUTATION_RATE = 1
MUTATION_RATE_CHANGE_RATE = 1
SELECTED_DNA_SIZE = 30
BATCH_SIZE = 300
RANDOM_CROSSOVERS = 10

GENERATIONS = 250


MODEL = tf.keras.Sequential(
			[
				keras.layers.Dense(8, input_shape=(26,), activation=activations.sigmoid),
				keras.layers.Dense(8,  activation=activations.sigmoid),
		        keras.layers.Dense(3, activation=activations.sigmoid)
			]
		)

MODELS = [tf.keras.Sequential([keras.layers.Dense(8, input_shape=(26,), activation=activations.sigmoid), keras.layers.Dense(8,  activation=activations.sigmoid), keras.layers.Dense(3, activation=activations.sigmoid)]) for i in range(BATCH_SIZE)]

WEIGHTS_STRUCTURE = [np.array(weights).shape for weights in MODEL.get_weights()]

#
#
#
#
# --------> CELL FUNCTIONS <--------
#
#
#
#
def isCellValid(gameMap, cell):
	return cell[0] >= 0 and cell[0] < len(gameMap[0]) and cell[1] >= 0 and cell[1] < len(gameMap)

def cellsMatch(cell1, cell2):
	return cell1[0] == cell2[0] and cell1[1] == cell2[1]

def isCellInsideSnake(cell, snake):
	for i in range(len(snake)):
		if cellsMatch(cell, snake[i]):
			return True
	return False

def areCellsConsecutiveSnake(cell1, cell2, snake):
	i1 = -2
	i2 = -2

	for i in range(len(snake)):
		if (cellsMatch(cell1, snake[i])):
			i1 = i
		elif (cellsMatch(cell2, snake[i])):
			i2 = i

	return abs(i1 - i2) == 1

def getCellBasedOnDirection(firstCell, secondCell, direction):
	if direction == FORWARD:
		return [
			firstCell[0] + (firstCell[0] - secondCell[0]),
			firstCell[1] + (firstCell[1] - secondCell[1]),
		]
	elif (direction == LEFT):
		return [
			firstCell[0] + (firstCell[1] - secondCell[1]),
			firstCell[1] - (firstCell[0] - secondCell[0]),
		]
	elif (direction == RIGHT):
		return [
			firstCell[0] - (firstCell[1] - secondCell[1]),
			firstCell[1] + (firstCell[0] - secondCell[0]),
		]

def getSnakeView(snake, gameMap):
	result = [];

	def addCellToResult(cell):
		cellValue = WALL_VALUE
		toAdd = [0, 0, 0, 0]

		if isCellValid(gameMap, cell):
			cellValue = gameMap[cell[1]][cell[0]]
		
		toAdd[cellValue] = 1

		for value in toAdd:
			result.append(value)

	head = snake[-1]
	second = snake[-2]
	forwardCell = getCellBasedOnDirection(head, second, FORWARD)
	rightCell = getCellBasedOnDirection(head, second, RIGHT)
	leftCell = getCellBasedOnDirection(head, second, LEFT)

	cells = []

	cells.append(forwardCell)
	cells.append(leftCell)
	cells.append(rightCell)
	cells.append(getCellBasedOnDirection(forwardCell, head, FORWARD))
	cells.append(getCellBasedOnDirection(leftCell, head, FORWARD))
	cells.append(getCellBasedOnDirection(rightCell, head, FORWARD))

	for cell in cells:
		addCellToResult(cell)
	
	return result

def getDistanceBetweenPoints(point1, point2):
	return math.sqrt(math.pow(point1[0] - point2[0], 2) + math.pow(point1[1] - point2[1], 2))

def getDistanceBetweenPointsSquared(point1, point2):
	return math.pow(math.sqrt(math.pow(point1[0] - point2[0], 2) + math.pow(point1[1] - point2[1], 2)), 2)

def getAngleBetweenSnakeAndApple(head, second, apple):
	vertical = head[0] == second[0]
	x = apple[0] - head[0] if vertical else apple[1] - head[1]
	y = apple[1] - head[1] if vertical else apple[0] - head[0]

	return math.atan2(x, y)


def getAppleInfo(snake, apple):
	head = snake[-1]
	second = snake[-2]

	distance = getDistanceBetweenPoints(head, apple)
	angle = getAngleBetweenSnakeAndApple(head, second, apple)
	
	#normalize
	distance /= math.sqrt(ROWS * ROWS + COLS * COLS)
	angle = angle / math.pi;

	return [distance, angle]

#
#
#
#
# --------> UPDATE FUNCTIONS <--------
#
#
#
#

def updateMapWithSnake(gameMap, snake):
	for i in range(len(snake)):
		x = snake[i][0]
		y = snake[i][1]
		gameMap[y][x] = SNAKE_VALUE

def generateEmptyMap(rows, cols):
	gameMap = [[NOTHING_VALUE for col in range(cols)] for row in range(rows)]
	return gameMap

def generateApple(gameMap):
	emptyCells = []
	for y in range(len(gameMap)):
		for x in range(len(gameMap[y])):
			if gameMap[y][x] == 0:
				emptyCells.append([x, y])

	return emptyCells[int(random.random() * (len(emptyCells) - 1))]

def updateMapWithApple(gameMap, apple):
	gameMap[apple[1]][apple[0]] = APPLE_VALUE

#
#
#
#
# --------> GAME FUNCTIONS <--------
#
#
#
#

def startGame(rows, cols):
	gameMap = generateEmptyMap(rows, cols)

	#Generate snake
	headX = int(random.random() * (cols - 1))
	headY = int(random.random() * (rows - 1))

	tailX = headX - 1 if isCellValid(gameMap, [headX - 1, headY]) else headX + 1
	tailY = headY

	snake = [
		[tailX, tailY],
		[headX, headY],
	]

	updateMapWithSnake(gameMap, snake)
	apple = generateApple(gameMap)
	updateMapWithApple(gameMap, apple)

	return  [gameMap, snake, apple]

def updateGame(snakeDirection, gameMap, snake, apple, callbacks):
	snakeAteApple = False
	updatedMap = generateEmptyMap(len(gameMap), len(gameMap[0]))
	updatedSnake = []

	nextSnakeCell = getCellBasedOnDirection(
		snake[len(snake) - 1],
		snake[len(snake) - 2],
		snakeDirection
	)

	if isCellInsideSnake(nextSnakeCell, snake) or not isCellValid(gameMap, nextSnakeCell):
		callbacks[GAME_OVER_CALLBACK]()
		return [ gameMap, snake, apple ]

	if cellsMatch(nextSnakeCell, apple):
		callbacks[ATE_APPLE_CALLBACK]()
		snakeAteApple = True

	for i in range(len(snake)):
		if not snakeAteApple and i == 0:
			continue
		updatedSnake.append([x for x in snake[i]])

	updatedSnake.append(nextSnakeCell)
	updateMapWithSnake(updatedMap, updatedSnake)

	updatedApple = generateApple(updatedMap) if snakeAteApple else apple
	updateMapWithApple(updatedMap, updatedApple)

	return [updatedMap, updatedSnake, updatedApple]


class SnakeGame:
	def __init__(self, rows, cols, model, weights):
		startingValues = startGame(rows, cols)

		self.gameMap = startingValues[0]
		self.snake = startingValues[1]
		self.apple = startingValues[2]

		self.running = False

		self.rows = rows
		self.cols = cols

		self.fitness = 0
		self.score = 0

		self.moves = MAX_MOVES
		self.total_moves_done = 0
		self.moves_wasted = 0

		self.model = model
		self.model.set_weights(weights)

		self.end = "wall"

	def ateApple(self):
		self.score += 1
		self.moves = MAX_MOVES
		self.moves_wasted = 0
	
	def gameOver(self):
		self.running = False
	
	def update(self, snakeDirection):
		updatedValues = updateGame(snakeDirection, self.gameMap, self.snake, self.apple, [self.ateApple, self.gameOver])

		self.gameMap = updatedValues[0]
		self.snake = updatedValues[1]
		self.apple = updatedValues[2]
	
	def run(self, subject):
		self.running = True
		while self.running:
			self.fitness -= FITNESS_LOSS_PER_ITERATION
			self.moves -= 1
			self.moves_wasted += 1
			if self.moves <= 0:
				self.running = False
				self.end = "moves"
			
			appleInfo = getAppleInfo(self.snake, self.apple)
			view = getSnakeView(self.snake, self.gameMap)
			view.append(appleInfo[0])
			view.append(appleInfo[1])
			view = np.array(view).reshape(-1, 26)

			move = np.argmax(self.model(view)[0])

			K.clear_session()

			if move == 0:
				snakeDirection = FORWARD
			elif move == 1:
				snakeDirection = RIGHT
			elif move == 2:
				snakeDirection = LEFT

			self.update(snakeDirection)
			self.total_moves_done += 1
		
		
		self.fitness += self.score * ATE_APPLE_FITNESS
		self.fitness -= self.moves_wasted * WASTING_MOVES_PENALTY
		subject["fitness"] = self.fitness
		subject["score"] = self.score
		subject["end"] = "No moves left" if self.end == "moves" else "Hit wall"

		return self.total_moves_done



#--------------------------------AI FUNCTIONS--------------------------------#

def mutateDna(dna, strength):
	newDna = [gene for gene in dna]


	for mutation in range(int(MUTATIONS_PER_DNA * MUTATION_RATE)):
		index = int(random.random() * len(newDna))
		newDna[index] = newDna[index] + strength * (random.random() * 2 - 1)
	
	return newDna

def fromWeightsToDna(weights):
	dna = [];
	
	for matrix in weights:
		for row in matrix:
			try:
				for value in row:
					dna.append(value);
			except:
				dna.append(row)
	
	return dna

def fromDnaToWeights(dna):
	weights = [];
	values_read = 0

	for shape in WEIGHTS_STRUCTURE:
		matrix = []

		rows = shape[0];
		cols = 0
		try:
			cols = shape[1];
		except Exception :
			cols = 0

		

		if cols != 0:
			for row in range(rows):
				matrix.append([]);
				for col in range(cols):
					matrix[-1].append(dna[values_read])
					values_read += 1
		else:
			for value in range(rows):
				matrix.append(dna[values_read])
				values_read += 1
		
		weights.append(np.array(matrix))
	
	return np.array(weights, dtype=object)

def crossover(pop):
	new_subjects = []

	for i in range(len(pop)):
		r_index = int(random.random() * len(pop))
		dna1 = pop[i]["dna"]
		dna2 = pop[r_index]["dna"]
		slice_index = 1 + int(random.random() * (len(dna1) - 1))

		new_dna = dna1[:slice_index]
		new_dna.extend(dna2[slice_index:])		
		new_subjects.append({"dna": new_dna})

		new_dna = dna2[:slice_index]
		new_dna.extend(dna1[slice_index:])
		new_subjects.append({"dna": new_dna})
	
	return new_subjects

def randomDna(length):
	return [random.random() * 2 - 1 for x in range(length)]

class Generation:
	def __init__(self, selected, data, gen_num):
		self.completed = 0

		self.population = [];
		self.data = data;
		self.gen_num = gen_num;
		self.total_steps = 0
		self.selected_len = len(selected)

		if len(selected) == 0:
			dna = fromWeightsToDna(MODEL.get_weights())
			for i in range(BATCH_SIZE):
				if len(self.population) < BATCH_SIZE:
					self.population.append({"dna": mutateDna(dna, MUTATION_STRENGTH_MAX)})
				else:
					break
		else:
			self.population.extend(selected)

			
			for i in range(RANDOM_CROSSOVERS):
				selected.append({"dna": randomDna(len(selected[0]["dna"]))})
			
			crossed_over = crossover(selected)
			self.population.extend(crossed_over)
			
			for i in range(BATCH_SIZE):
				if len(self.population) < BATCH_SIZE:
					index = int(random.random() * len(crossed_over))
					subject = crossed_over[index]
					strength = MUTATION_STRENGTH_MAX * i / (BATCH_SIZE - len(selected))
					self.population.append({"dna": mutateDna(subject["dna"], strength)})
				else:
					break

	def run(self):
		threads = []

		def printProgress():
			percentage = int(self.completed * 1.0 / len(self.population) * 100)
			ticks = math.floor(percentage / 2.0)
			progress = "\r[{}] Progress: [{}{}] {}/{}".format(self.gen_num, "#"*ticks, "."*(50 - ticks), self.completed, len(self.population))

			sys.stdout.write(progress)
			sys.stdout.flush()


		def runSim(subject, gameInstance):
			steps = gameInstance.run(subject)
			self.total_steps += steps
			
			self.completed += 1
			printProgress()

		for i in range(len(self.population)):
			subject = self.population[i]

			game = SnakeGame(ROWS, COLS, MODELS[i], fromDnaToWeights(subject["dna"]))
			threads.append(Thread(target=runSim, args=(subject, game)))
		

		[t.start() for t in threads]
		[t.join() for t in threads]
		
		fitness_total = 0
		score_total = 0

		

		for i in range(len(self.population)):
			subject = self.population[i]
			self.data.append([self.gen_num, self.gen_num * BATCH_SIZE + i, subject["fitness"], subject["score"], subject["end"], "parent" if (i < self.selected_len and self.gen_num != 0) else "child"])
			fitness_total += subject["fitness"]
			score_total += subject["score"]
		
		def sortOnFitness(subject):
			return subject["fitness"]
		
		self.population.sort(key=sortOnFitness, reverse=True)

		return [self.population[0:SELECTED_DNA_SIZE], fitness_total / len(self.population), score_total / len(self.population), self.total_steps]

#--------------------------------AI TRAINING--------------------------------#

def saveChart(data, current_gen):
	fig, ax = plt.subplots(2, 2, gridspec_kw={'width_ratios': [3, 1]}, figsize=(19.2, 10.8))
	ax = ax.flatten()

	sns.lineplot(data=data.iloc[1:], ax=ax[1], x="generation", y="fitness", color='mediumseagreen')
	sns.lineplot(data=data.iloc[1:], ax=ax[3], x="generation", y="score", color='mediumseagreen')
	
	data["generation"] = (data["generation"] + 1) * BATCH_SIZE
	sns.lineplot(data=data, ax=ax[0], x="generation", y="fitness", color='mediumseagreen', err_style="bars")
	sns.scatterplot(data=data[data["fitness"] > 0], ax=ax[0], x="iteration", y="fitness", sizes=(10, 30), size="fitness", style="parent", hue="end_type", palette="viridis")
	
	sns.lineplot(data=data, ax=ax[2], x="generation", y="score", color='mediumseagreen', err_style="bars")
	sns.scatterplot(data=data[data["fitness"] > 0], ax=ax[2], x="iteration", y="score", sizes=(10, 80), size="score", style="parent", hue="end_type", palette="viridis")
	data["generation"] = data["generation"] / BATCH_SIZE - 1
	plt.savefig(fname=os.path.join(os.getcwd(), "saved", "plots", "gen{}.png".format(current_gen)))

	plt.cla()

def saveDNAs(current_gen, selected):
	path = os.path.join(os.getcwd(), "saved", "dna", "dnas_gen{}".format(current_gen))
	content = ""
	for subject in selected:
		for value in subject["dna"]:
			content += "{}, ".format(value)
		content += "\n"
	content.replace(", \n", "\n")
	text_file = open(path, "w")
	text_file.write(content)
	text_file.close()

def saveDB(current_gen, data):
	path = os.path.join(os.getcwd(), "saved", "db", "db_gen{}".format(current_gen))
	content = data.to_csv(index=False)
	text_file = open(path, "w")
	text_file.write(content)
	text_file.close()


def runGenerations(starting_data, selected):
	data = ""
	starting_point = 1
	global GENERATIONS
	global MUTATION_RATE
	global MUTATION_RATE_CHANGE_RATE

	if len(starting_data) == 0:
		data = pd.DataFrame(np.array([[0, 0, 0, 0, "wall", "parent"]]), columns=["generation", "iteration", "fitness", "score", "end_type", "parent"])
	else:
		data = starting_data
		starting_point = int(starting_data["generation"].max())

	data = data.astype({"generation": float, "iteration": float, "fitness": float, "score": float, "end_type": str, "parent": str})

	for current_gen in range(starting_point, GENERATIONS + 1):
		print("[{}] Generating...".format(current_gen))
		gen_matrix = []

		# if current_gen >= 3:
		# 	starting_fitness = data[data["generation"] == current_gen - 3]["fitness"].mean()
		# 	fitness_change = starting_fitness
		# 	fitness_change += data[data["generation"] == current_gen - 2]["fitness"].mean()
		# 	fitness_change += data[data["generation"] == current_gen - 1]["fitness"].mean()
		# 	fitness_change /= 3
		# 	fitness_change -= starting_fitness
		# 	fitness_change /= starting_fitness

		# 	if fitness_change < 0.05:
		# 		MUTATION_RATE *= MUTATION_RATE_CHANGE_RATE
		# 	else:
		# 		MUTATION_RATE = 1

		generation = Generation(selected, gen_matrix, current_gen)
		start = time.time()

		print("[{}] Mutation rate set to {}.".format(current_gen, round(MUTATION_RATE, 2)))
		print("[{}] Running...".format(current_gen))
		selected, fitness, score, total_steps = generation.run()

		print("\n[{}] Creating database...".format(current_gen))
		data = data.append(pd.DataFrame(np.array(gen_matrix), columns=["generation", "iteration", "fitness", "score", "end_type", "parent"]))
		data = data.astype({"generation": float, "iteration": float, "fitness": float, "score": float, "end_type": str, "parent": str})
		
		print("[{}] Plotting database...".format(current_gen))
		saveChart(data, current_gen)


		print("[{}] Saving best DNAs...".format(current_gen))
		saveDNAs(current_gen, selected)
		if(current_gen % 5 == 0):
			print("[{}] Saving DB...".format(current_gen))
			saveDB(current_gen, data)
		
		minutes = (time.time() - start) / 60.0
		print("[{}] Complete.".format(current_gen))
		print("[{}] 	Fitness: {}".format(current_gen, round(fitness, 2)))
		print("[{}] 	Score: {}".format(current_gen, round(score, 2)))
		print("[{}] 	Steps: {}".format(current_gen, total_steps))
		print("[{}] 	Time: {}\n\n".format(current_gen, round(minutes, 2)))



def start(dnas, dataframe):
	print("Starting training.")
	runGenerations(dnas, dataframe)
	print("Training completed.")


#--------------------------------READ/WRITE SAVES--------------------------------#

inputValues = [[], []]

def loadGeneration(generation_number):
	db_path = os.path.join(os.getcwd(), "saved", "db", "db_gen{}".format(int(generation_number / 10) * 10))
	dnas_path = os.path.join(os.getcwd(), "saved", "dna", "dnas_gen{}".format(generation_number))

	loadDB(db_path)
	loadSelected(dnas_path)

def loadDB(path):
	inputValues[0] = pd.read_csv(path)
	print("Loaded DB correctly.")

def loadSelected(path):
	f = open(path, "r")
	text = f.read()
	f.close()

	lines = text.split(", \n")
	for line in lines:
		if len(line) > 2:
			inputValues[1].append({"dna": [float(weight) for weight in line.split(", ")]})
	print("Loaded dna's correctly.\n")

args = sys.argv[1:]

for i in range(len(args)):
		if args[i][0] == "-":
			parameter = ""
			value = ""
			try:
				parameter = args[i][1:]
				value = args[i + 1]
			except Exception:
				print("Invalid arguments!")

			if parameter == "g":
				loadGeneration(int(value))
	

#--------------------------------START TRAINING--------------------------------#
start(inputValues[0], inputValues[1])