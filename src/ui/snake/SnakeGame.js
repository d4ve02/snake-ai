// nothing: 0
// snake: 1
// apple: 2
export const NOTHING_VALUE = 0;
export const SNAKE_VALUE = 1;
export const APPLE_VALUE = 2;

export const isPointInsideMap = (map, x, y) => {
    return x >= 0 && x < map[0].length && y >= 0 && y < map.length;
};

export const generateSnake = (map) => {
    const headX = parseInt(Math.random() * (map[0].length - 1));
    const headY = parseInt(Math.random() * (map.length - 1));

    const tailX = isPointInsideMap(map, headX - 1, headY)
        ? headX - 1
        : headX + 1;
    const tailY = headY;

    return [
        [tailX, tailY],
        [headX, headY],
    ];
};

export const generateApple = (map) => {
    let emptyCells = [];
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] === 0) {
                emptyCells.push([x, y]);
            }
        }
    }
    const randCell =
        emptyCells[parseInt(Math.random() * (emptyCells.length - 1))];

    return randCell;
};

export const generateMap = (rows, cols, snake, apple) => {
    const newMap = new Array(cols);

    for (let i = 0; i < cols; i++) {
        newMap[i] = new Array(rows).fill(NOTHING_VALUE);
    }
    if (snake)
        for (let i = 0; i < snake.lenght; i++) {
            const x = snake[i][1];
            const y = snake[i][0];
            newMap[y][x] = SNAKE_VALUE;
        }

    if (apple) newMap[apple[1]][apple[0]] = APPLE_VALUE;

    return newMap;
};
