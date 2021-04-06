export const NOTHING_VALUE = 0;
export const SNAKE_VALUE = 1;
export const APPLE_VALUE = 2;

export const FORWARD = 0;
export const RIGHT = 1;
export const LEFT = -1;

/*



--------> CELL FUNCTIONS <--------



*/
export const isCellValid = (map, cell) =>
    cell[0] >= 0 &&
    cell[0] < map[0].length &&
    cell[1] >= 0 &&
    cell[1] < map.length;

export const cellsMatch = (cell1, cell2) =>
    cell1[0] === cell2[0] && cell1[1] === cell2[1];

export const isCellInsideSnake = (cell, snake) => {
    for (let i = 0; i < snake.length; i++) {
        if (cellsMatch(cell, snake[i])) {
            return true;
        }
    }
    return false;
};

export const areCellsConsecutiveSnake = (cell1, cell2, snake) => {
    let i1 = null;
    let i2 = null;

    for (let i = 0; i < snake.length; i++) {
        if (cellsMatch(cell1, snake[i])) {
            i1 = i;
        } else if (cellsMatch(cell2, snake[i])) {
            i2 = i;
        }
    }

    return Math.abs(i1 - i2) === 1;
};

export const getCellBasedOnDirection = (firstCell, secondCell, direction) => {
    if (direction === FORWARD) {
        return [
            firstCell[0] + (firstCell[0] - secondCell[0]),
            firstCell[1] + (firstCell[1] - secondCell[1]),
        ];
    } else if (direction === LEFT) {
        return [
            firstCell[0] + (firstCell[1] - secondCell[1]),
            firstCell[1] - (firstCell[0] - secondCell[0]),
        ];
    } else if (direction === RIGHT) {
        return [
            firstCell[0] - (firstCell[1] - secondCell[1]),
            firstCell[1] + (firstCell[0] - secondCell[0]),
        ];
    }
};

/*



--------> UPDATE FUNCTIONS <--------



*/
const updateMapWithSnake = (map, snake) => {
    for (let i = 0; i < snake.length; i++) {
        const x = snake[i][0];
        const y = snake[i][1];
        map[y][x] = SNAKE_VALUE;
    }
};

const updateMapWithApple = (map, apple) => {
    map[apple[1]][apple[0]] = APPLE_VALUE;
};

const generateApple = (map) => {
    let emptyCells = [];
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] === 0) {
                emptyCells.push([x, y]);
            }
        }
    }
    return emptyCells[parseInt(Math.random() * (emptyCells.length - 1))];
};

const generateEmptyMap = (rows, cols) => {
    const map = new Array(rows);

    for (let i = 0; i < rows; i++) {
        map[i] = new Array(cols).fill(NOTHING_VALUE);
    }

    return map;
};

/*



--------> GAME FUNCTIONS <--------



*/
export const startGame = (rows, cols) => {
    const map = generateEmptyMap(rows, cols);

    //Generate snake
    const headX = parseInt(Math.random() * (cols - 1));
    const headY = parseInt(Math.random() * (rows - 1));

    const tailX = isCellValid(map, [headX - 1, headY]) ? headX - 1 : headX + 1;
    const tailY = headY;

    const snake = [
        [tailX, tailY],
        [headX, headY],
    ];

    updateMapWithSnake(map, snake);
    const apple = generateApple(map);
    updateMapWithApple(map, apple);

    return { map, snake, apple };
};

export const updateGame = (snakeDirection, map, snake, apple, callbacks) => {
    let snakeAteApple = false;
    const updatedMap = generateEmptyMap(map.length, map[0].length);
    const updatedSnake = [];

    const nextSnakeCell = getCellBasedOnDirection(
        snake[snake.length - 1],
        snake[snake.length - 2],
        snakeDirection
    );

    if (
        isCellInsideSnake(nextSnakeCell, snake) ||
        !isCellValid(map, nextSnakeCell)
    ) {
        callbacks.gameOver();
        return { map, snake, apple };
    }

    if (cellsMatch(nextSnakeCell, apple)) {
        callbacks.ateApple();
        snakeAteApple = true;
    }

    for (let i = snakeAteApple ? 0 : 1; i < snake.length; i++) {
        updatedSnake.push([...snake[i]]);
    }
    updatedSnake.push(nextSnakeCell);
    updateMapWithSnake(updatedMap, updatedSnake);

    const updatedApple = snakeAteApple ? generateApple(updatedMap) : apple;
    updateMapWithApple(updatedMap, updatedApple);

    return { map: updatedMap, snake: updatedSnake, apple: updatedApple };
};
