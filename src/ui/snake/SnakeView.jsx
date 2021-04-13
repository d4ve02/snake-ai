import React, { Component } from "react";
import {
    APPLE_VALUE,
    areCellsConsecutiveSnake,
    getAppleInfo,
    getSnakeView,
    SNAKE_VALUE,
    startGame,
    updateGame,
} from "./SnakeGame";
import "../../css/snake/SnakeView.css";
import { FORWARD, RIGHT, LEFT } from "./dna";
import * as tf from "@tensorflow/tfjs";

export default class SnakeView extends Component {
    constructor(props) {
        super(props);

        const { rows, cols, model, cellSize } = this.props;

        const startingValues = startGame(rows, cols);
        this.state = {
            shouldRestart: false,
            gameOver: false,
            pause: false,
            showInfo: false,
            speed: 1,
            map: startingValues.map,
            snake: startingValues.snake,
            apple: startingValues.apple,
            model,
            cellSize,
            rects: this.updateRects(
                startingValues.map,
                startingValues.snake,
                startingValues.apple
            ),
        };
    }

    componentDidMount = () => {
        this.update();
    };

    update = () => {
        const {
            pause,
            gameOver,
            speed,
            map,
            snake,
            apple,
            showInfo,
        } = this.state;

        if (!pause && !gameOver) {
            this.updateData();
            this.updateRects(map, snake, apple, showInfo);
        }

        setTimeout(() => {
            this.update();
        }, 500 / Math.pow(30, parseFloat(speed) / 100));
    };

    updateData = () => {
        const { rows, cols, model } = this.props;
        const { gameOver, pause, map, snake, apple } = this.state;
        const appleInfo = getAppleInfo(snake, apple, rows, cols);

        if (!gameOver && !pause) {
            const input = tf.tensor(
                [
                    ...getSnakeView(snake, map).result,
                    appleInfo.distance,
                    appleInfo.angle,
                ],
                [1, 26]
            );

            let move = 0;
            let snakeDirection;

            if (model) {
                const prediction = model.predict(input).arraySync()[0];
                console.log(input.arraySync());

                for (let i = 0; i < prediction.length; i++) {
                    if (prediction[i] > prediction[move]) {
                        move = i;
                    }
                }
            }

            const gameData = {
                gameOver,
            };

            if (move === 0) {
                snakeDirection = FORWARD;
            } else if (move === 1) {
                snakeDirection = RIGHT;
            } else if (move === 2) {
                snakeDirection = LEFT;
            }

            const updatedValues = updateGame(
                snakeDirection,
                map,
                snake,
                apple,
                {
                    ateApple: () => {},
                    gameOver: () => (gameData.gameOver = true),
                }
            );

            this.setState({
                map: updatedValues.map,
                snake: updatedValues.snake,
                apple: updatedValues.apple,
                gameOver: gameData.gameOver,
            });
        }
    };

    restart = () => {
        const { rows, cols } = this.props;
        const newValues = startGame(rows, cols);

        this.setState({
            map: newValues.map,
            snake: newValues.snake,
            apple: newValues.apple,

            pause: false,
            gameOver: false,
        });
    };

    updateRects = (map, snake, apple, showInfo) => {
        const result = [];
        const { rows, cols, cellSize } = this.props;
        const viewed = getSnakeView(snake, map).cells;

        const appleInfo = getAppleInfo(snake, apple, rows, cols);
        const snakeHead = snake[snake.length - 1];
        let controlClass = "";

        if (!showInfo) controlClass = " hidden";

        result.push(
            <line
                x1={cellSize / 2 + cellSize * snakeHead[0]}
                y1={cellSize / 2 + cellSize * snakeHead[1]}
                x2={cellSize / 2 + cellSize * apple[0]}
                y2={cellSize / 2 + cellSize * apple[1]}
                className={`distanceLine ${controlClass}`}
            />
        );

        result.push(
            <circle
                cx={cellSize / 2 + cellSize * snakeHead[0]}
                cy={cellSize / 2 + cellSize * snakeHead[1]}
                r={
                    appleInfo.distance *
                    cellSize *
                    Math.sqrt(rows * rows + cols * cols)
                }
                className={`distanceLine ${controlClass}`}
            />
        );

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let className = "map";
                if (map[row][col] === SNAKE_VALUE) className = "snake";
                if (map[row][col] === APPLE_VALUE) className = "apple";

                for (let i = 0; i < viewed.length; i++) {
                    if (
                        col === viewed[i][0] &&
                        row === viewed[i][1] &&
                        showInfo
                    )
                        className += " viewed";
                }

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
                            show += cellSize;
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
                            hide += cellSize;
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
                        x={col * cellSize}
                        y={row * cellSize}
                        width={cellSize}
                        height={cellSize}
                        className={`${className}`}
                        style={{
                            strokeDasharray: border,
                        }}
                    />
                );
            }
        }

        this.setState({ rects: result });
    };

    render = () => {
        const { rows, cols, cellSize } = this.props;
        const { pause, rects, gameOver, speed, snake, showInfo } = this.state;

        return (
            <div className="snake-simulation">
                <div className="snake-view">
                    <svg
                        className="snake-svg"
                        width={cellSize * cols}
                        height={cellSize * rows}
                    >
                        {rects}
                    </svg>

                    <button
                        className="play-button"
                        onClick={() => this.setState({ pause: false })}
                        style={{
                            filter: `opacity(${pause ? "1" : "0"})`,
                            width: `${pause ? "1" : "2"}00px`,
                            height: `${pause ? "1" : "2"}00px`,
                        }}
                    >
                        <i className="fas fa-play" />
                    </button>
                </div>
                <div className="controls">
                    <span className="score">{`Score: ${
                        snake.length - 2
                    }`}</span>

                    {gameOver && <span className="game-over">Game Over</span>}

                    <span className="speed">{`${Math.pow(
                        30,
                        parseFloat(speed) / 100
                    ).toFixed(1)}x`}</span>

                    <input
                        type="range"
                        className="speed-slider"
                        onChange={(e) =>
                            this.setState({ speed: e.currentTarget.value })
                        }
                        value={speed}
                    />

                    <button
                        className="pause-button"
                        onClick={() => this.setState({ showInfo: !showInfo })}
                    >
                        <i className="fas fa-info" />
                    </button>

                    <button
                        className="pause-button"
                        onClick={() => this.setState({ pause: !pause })}
                    >
                        {pause ? (
                            <i className="fas fa-play" />
                        ) : (
                            <i className="fas fa-pause" />
                        )}
                    </button>

                    <button
                        className="restart-button"
                        onClick={() => this.restart()}
                    >
                        <i className="fas fa-redo" />
                    </button>
                </div>
            </div>
        );
    };
}
