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
    const [renderScheduled, setRenderScheduled] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    const [map, setMap] = useState(startingValues.map);
    const [snake, setSnake] = useState(startingValues.snake);
    const [apple, setApple] = useState(startingValues.apple);

    const snakeDirection = Math.round(Math.random() * 2 - 1);

    useEffect(() => {
        if (!renderScheduled && !gameOver) {
            setTimeout(() => {
                setRenderScheduled(true);
            }, 10);
        }

        const callbacks = {
            ateApple: () => {
                console.log("Ate apple!");
            },
            gameOver: () => {
                console.log("Game over!");
                setGameOver(true);
            },
        };

        if (gameOver) {
            setRenderScheduled(false);
        }

        if (renderScheduled && !gameOver) {
            setRenderScheduled(false);
            const updatedValues = updateGame(
                snakeDirection,
                map,
                snake,
                apple,
                callbacks
            );

            setMap(updatedValues.map);
            setSnake(updatedValues.snake);
            setApple(updatedValues.apple);
        }
    }, [renderScheduled]);

    const renderMap = () => {
        const rects = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let className = "map";
                if (map[row][col] === SNAKE_VALUE) className = "snake";
                if (map[row][col] === APPLE_VALUE) className = "apple";

                let border = "";

                let red;

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

                rects.push(
                    <rect
                        key={col + row * cols}
                        x={col * CELL}
                        y={row * CELL}
                        width={CELL}
                        height={CELL}
                        className={`${className}`}
                        style={{
                            strokeDasharray: border,
                            fill: red ? "red" : null,
                        }}
                    />
                );
            }
        }

        return rects;
    };

    return (
        <div className="snake-view">
            <svg className="snake-svg" width={CELL * cols} height={CELL * rows}>
                {renderMap()}
            </svg>
        </div>
    );
};

export default SnakeView;
