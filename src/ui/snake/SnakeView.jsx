import React, { useEffect, useMemo, useState } from "react";
import {
    APPLE_VALUE,
    areCellsConsecutiveSnake,
    SNAKE_VALUE,
    startGame,
    updateGame,
} from "./SnakeGame";
import "../../css/snake/SnakeView.css";

const CELL = 13;

const SnakeView = ({ rows, cols }) => {
    const startingValues = useMemo(() => startGame(rows, cols), [rows, cols]);
    const [shouldRender, setShouldRender] = useState(false);
    const [shouldRestart, setShouldRestart] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [pause, setPause] = useState(false);
    const [speed, setSpeed] = useState(1);

    const [map, setMap] = useState(startingValues.map);
    const [snake, setSnake] = useState(startingValues.snake);
    const [apple, setApple] = useState(startingValues.apple);

    const rects = useMemo(() => {
        const result = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let className = "map";
                if (map[row][col] === SNAKE_VALUE) className = "snake";
                if (map[row][col] === APPLE_VALUE) className = "apple";

                let border = "";

                if (map[row][col] === SNAKE_VALUE) {
                    const borders = [true, true, true, true];
                    const dashed = [];

                    try {
                        if (map[row - 1][col] === SNAKE_VALUE) {
                            const cell1 = [col, row];
                            const cell2 = [col, row - 1];
                            if (areCellsConsecutiveSnake(cell1, cell2, snake))
                                borders[0] = false;
                        }
                    } catch (ex) {}

                    try {
                        if (map[row][col + 1] === SNAKE_VALUE) {
                            const cell1 = [col, row];
                            const cell2 = [col + 1, row];
                            if (areCellsConsecutiveSnake(cell1, cell2, snake))
                                borders[1] = false;
                        }
                    } catch (ex) {}

                    try {
                        if (map[row + 1][col] === SNAKE_VALUE) {
                            const cell1 = [col, row];
                            const cell2 = [col, row + 1];
                            if (areCellsConsecutiveSnake(cell1, cell2, snake))
                                borders[2] = false;
                        }
                    } catch (ex) {}

                    try {
                        if (map[row][col - 1] === SNAKE_VALUE) {
                            const cell1 = [col, row];
                            const cell2 = [col - 1, row];
                            if (areCellsConsecutiveSnake(cell1, cell2, snake))
                                borders[3] = false;
                        }
                    } catch (ex) {}

                    let show = 0;
                    let hide = 0;

                    for (let i = 0; i < borders.length; i++) {
                        if (borders[i]) {
                            show += CELL;
                            if (i !== 0) {
                                if (!borders[i - 1]) {
                                    dashed.push(hide);
                                    hide = 0;
                                }
                            }
                            if (i === borders.length - 1) {
                                dashed.push(show);
                            }
                        } else {
                            hide += CELL;
                            if (i !== 0) {
                                if (borders[i - 1]) {
                                    dashed.push(show);
                                    show = 0;
                                }
                            } else {
                                dashed.push(0);
                            }
                            if (i === borders.length - 1) {
                                dashed.push(hide);
                            }
                        }
                    }

                    for (let i = 0; i < dashed.length; i++) {
                        border += `${dashed[i]}${
                            i === dashed.length - 1 ? "" : ","
                        } `;
                    }
                }

                result.push(
                    <rect
                        key={col + row * cols}
                        x={col * CELL}
                        y={row * CELL}
                        width={CELL}
                        height={CELL}
                        className={`${className}`}
                        style={{
                            strokeDasharray: border,
                        }}
                    />
                );
            }
        }

        return result;
    }, [rows, cols, map, snake]);

    const snakeDirection = Math.round(Math.random() * 2 - 1);

    useEffect(() => {
        let timeout;
        if (!shouldRender && !pause && !gameOver) {
            timeout = setTimeout(() => {
                setShouldRender(true);
            }, 500 / Math.pow(30, parseFloat(speed) / 100));
        } else {
            setShouldRender(false);
        }
        if (timeout) {
            return () => {
                clearTimeout(timeout);
            };
        }
    }, [shouldRender, speed, pause, gameOver]);

    useEffect(() => {
        if (shouldRender && !gameOver && !pause) {
            const updatedValues = updateGame(
                snakeDirection,
                map,
                snake,
                apple,
                {
                    ateApple: () => {
                        console.log("Ate apple!");
                    },
                    gameOver: () => {
                        console.log("Game over!");
                        setGameOver(true);
                    },
                }
            );

            setMap(updatedValues.map);
            setSnake(updatedValues.snake);
            setApple(updatedValues.apple);
        }
    }, [shouldRender, pause, apple, gameOver, map, snake, snakeDirection]);

    useEffect(() => {
        if (shouldRestart) {
            setShouldRestart(false);

            const newValues = startGame(rows, cols);
            setMap(newValues.map);
            setSnake(newValues.snake);
            setApple(newValues.apple);

            setPause(false);
            setGameOver(false);
            setShouldRender(false);
            setSpeed(speed);
        }
    });

    return (
        <div className="snake-simulation">
            <div className="snake-view">
                <svg
                    className="snake-svg"
                    width={CELL * cols}
                    height={CELL * rows}
                >
                    {rects}
                </svg>

                <button
                    className="play-button"
                    onClick={() => setPause(false)}
                    style={{ filter: `opacity(${pause ? "1" : "0"})` }}
                >
                    <i className="fas fa-play" />
                </button>
            </div>
            <div className="controls">
                <span className="score">{`Score: ${snake.length - 2}`}</span>

                {gameOver && <span className="game-over">Game Over</span>}

                <span className="speed">{`${Math.pow(
                    30,
                    parseFloat(speed) / 100
                ).toFixed(1)}x`}</span>

                <input
                    type="range"
                    className="speed-slider"
                    onChange={(e) => {
                        setSpeed(e.currentTarget.value);
                    }}
                    value={speed}
                />

                <button
                    className="pause-button"
                    onClick={() => setPause(!pause)}
                >
                    {pause ? (
                        <i className="fas fa-play" />
                    ) : (
                        <i className="fas fa-pause" />
                    )}
                </button>

                <button
                    className="restart-button"
                    onClick={() => setShouldRestart(true)}
                >
                    <i className="fas fa-redo" />
                </button>
            </div>
        </div>
    );
};

export default SnakeView;
