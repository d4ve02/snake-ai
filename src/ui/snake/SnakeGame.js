export const NOTHING_VALUE = 0;
export const SNAKE_VALUE = 1;
export const APPLE_VALUE = 2;
export const WALL_VALUE = 3;

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

export const getSnakeView = (snake, gameMap) => {
    const result = [];

    const addCellToResult = (cell) => {
        let cellValue = WALL_VALUE;
        const toAdd = [0, 0, 0, 0];

        if (isCellValid(gameMap, cell)) {
            cellValue = gameMap[cell[1]][cell[0]];
        }

        toAdd[cellValue] = 1;

        for (let i = 0; i < toAdd.length; i++) {
            const value = toAdd[i];
            result.push(value);
        }
    };

    const head = snake[snake.length - 1];
    const second = snake[snake.length - 2];
    const forwardCell = getCellBasedOnDirection(head, second, FORWARD);
    const rightCell = getCellBasedOnDirection(head, second, RIGHT);
    const leftCell = getCellBasedOnDirection(head, second, LEFT);

    const cells = [];

    cells.push(forwardCell);
    cells.push(leftCell);
    cells.push(rightCell);
    cells.push(getCellBasedOnDirection(forwardCell, head, FORWARD));
    cells.push(getCellBasedOnDirection(leftCell, head, FORWARD));
    cells.push(getCellBasedOnDirection(rightCell, head, FORWARD));

    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        addCellToResult(cell);
    }

    return { result, cells };
};

export const getDistanceBetweenPoints = (point1, point2) =>
    Math.sqrt(
        Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2)
    );

export const getDistanceBetweenPointsSquared = (point1, point2) =>
    Math.pow(
        Math.sqrt(
            Math.pow(point1[0] - point2[0], 2) +
                Math.pow(point1[1] - point2[1], 2)
        ),
        2
    );

export const getAngleBetweenSnakeAndApple = (head, second, apple) => {
    const x = head[0] === second[0] ? apple[0] - head[0] : apple[1] - head[1];
    const y = head[0] === second[0] ? apple[1] - head[1] : apple[0] - head[0];

    return Math.atan2(x, y);
};

export const getAppleInfo = (snake, apple, rows, cols) => {
    const head = snake[snake.length - 1];
    const second = snake[snake.length - 2];

    let distance = getDistanceBetweenPoints(head, apple);
    let angle = getAngleBetweenSnakeAndApple(head, second, apple);

    //normalize data
    distance /= Math.sqrt(rows * rows + cols * cols);
    angle /= Math.PI;

    return { distance, angle };
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
    for (let y = 1; y < map.length - 1; y++) {
        for (let x = 1; x < map[y].length - 1; x++) {
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

    //Generate snake, 2 cell long
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
