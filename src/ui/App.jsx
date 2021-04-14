import React, { Component } from "react";
import "../css/App.css";
import "../css/normalize.css";
import SnakeView from "./snake/SnakeView";
import * as tf from "@tensorflow/tfjs";
import dna, { fromDNAtoWeights } from "./snake/dna";

export default class App extends Component {
    constructor() {
        super();

        this.state = {};
    }

    componentDidMount = () => {
        const model = tf.sequential();
        model.add(
            tf.layers.dense({
                units: 8,
                activation: "sigmoid",
                inputShape: [26],
            })
        );
        model.add(
            tf.layers.dense({
                units: 8,
                activation: "sigmoid",
            })
        );
        model.add(
            tf.layers.dense({
                units: 3,
                activation: "sigmoid",
            })
        );
        model.setWeights(fromDNAtoWeights(dna));

        this.setState({
            model,
        });
    };

    render = () => {
        const { model } = this.state;

        return (
            <div className="main">
                <div className="topHeader">
                    <a
                        href="https://github.com/d4ve02/snake-ai"
                        rel="noreferrer"
                        target="_blank"
                    >
                        <i className="fab fa-github"></i>
                        Check the source code!
                    </a>
                </div>
                <h1 className="title">Snake AI</h1>
                <SnakeView rows={25} cols={25} model={model} cellSize={18} />

                <h2 className="title-second">Development Logs</h2>
                <div className="information">
                    <div className="section">
                        <div className="date">13/4/2021 - 14:07</div>
                        <div className="sectionInfo">
                            <a
                                href="/stats.png"
                                rel="noreferrer"
                                target="_blank"
                            >
                                <img
                                    src="/stats.png"
                                    alt="The evolution statistics"
                                />
                                <div>
                                    Training statistics, Python + Tensorflow
                                </div>
                            </a>

                            <div className="text">
                                Hello and welcome to the Snake AI project!
                                <br />
                                My name is Davide Halili and this is the first
                                development log of this project! I'm attempting
                                to develop the best Snake AI I can, using
                                genetic algorithms to tune a neural network's
                                parameters until I get a <i>really</i> good AI.
                                <br />
                                The current AI structure is a neural network
                                with:
                                <ul>
                                    <li>
                                        an input layer with 26 input neurons,
                                        click the "i" button above to know what
                                        the inputs are!
                                    </li>
                                    <li>
                                        two hidden layers with 8 neurons each
                                    </li>
                                    <li>
                                        one output layer with 3 neurons that
                                        code LEFT, STRAIGHT or RIGHT
                                    </li>
                                </ul>
                                I've trained a decent AI at this point, but it
                                has three big issues:
                                <ul>
                                    <li>
                                        it can't get any apples if they're
                                        touching the wall
                                    </li>
                                    <li>
                                        it can't get any apples on the left side
                                        of the map
                                    </li>
                                    <li>
                                        it doesn't know how to avoid hitting
                                        itself
                                    </li>
                                    <li>it sometimes gets stuck in loops</li>
                                </ul>
                                The best way to solve these issues is: changing
                                the map size randomly during training to give
                                the AI more opportunities to learn how to avoid
                                hitting itself; simply training more.
                                <br />
                                The next step is implementing the same training
                                algorithm using C++ instead of Python, so I can
                                get better performance and train with bigger
                                population size.
                                <br />
                                Until then, have a fun time coding!
                                <br />
                                <br />
                                <hr />
                                <div className="right">Dave :)</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="closingFooter">
                    <div
                        className="scrollToTop"
                        onClick={() => {
                            window.scrollTo(0, 0);
                            console.log("Moved window");
                        }}
                    >
                        <i className="fas fa-arrow-up" />
                    </div>
                </div>
            </div>
        );
    };
}
