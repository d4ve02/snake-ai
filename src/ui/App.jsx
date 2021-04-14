import React, { Component } from "react";
import * as tf from "@tensorflow/tfjs";
import dna, { fromDNAtoWeights } from "./snake/dna";
import TopHeader from "./TopHeader";
import SnakeView from "./snake/SnakeView";
import DevelopmentLogs from "./DevelopmentLogs";
import Footer from "./Footer";
import "../css/App.css";
import "../setup/normalize.css";

export default class App extends Component {
    componentDidMount = () => {
        const model = tf.sequential();

        const hiddenLayer0 = tf.layers.dense({
            units: 8,
            activation: "sigmoid",
            inputShape: [26],
        });
        const hiddenLayer1 = tf.layers.dense({
            units: 8,
            activation: "sigmoid",
        });
        const outputLayer = tf.layers.dense({
            units: 3,
            activation: "sigmoid",
        });

        model.add(hiddenLayer0);
        model.add(hiddenLayer1);
        model.add(outputLayer);

        model.setWeights(fromDNAtoWeights(dna));

        this.setState({
            model,
        });
    };

    render = () => {
        let model;
        if (this.state) {
            model = this.state.model;
        }

        const rows = 25;
        const cols = 25;
        const maxCellSize = 18;

        let cellSize = parseInt((window.innerWidth - 50) / cols);
        if (cellSize > maxCellSize) {
            cellSize = maxCellSize;
        }

        return (
            <div className="main">
                <TopHeader />

                <h1 className="title">Snake AI</h1>
                <SnakeView
                    rows={rows}
                    cols={cols}
                    model={model}
                    cellSize={cellSize}
                />

                <DevelopmentLogs />
                <Footer />
            </div>
        );
    };
}
