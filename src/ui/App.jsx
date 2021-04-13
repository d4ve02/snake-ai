import { useEffect, useState } from "react";
import "../css/App.css";
import "../css/normalize.css";
import SnakeView from "./snake/SnakeView";
import * as tf from "@tensorflow/tfjs";
import dna, { fromDNAtoWeights } from "./snake/dna";

function App() {
    const [model, setModel] = useState(null);

    useEffect(() => {
        const createdModel = tf.sequential();
        createdModel.add(
            tf.layers.dense({
                units: 8,
                activation: "sigmoid",
                inputShape: [26],
            })
        );
        createdModel.add(
            tf.layers.dense({
                units: 8,
                activation: "sigmoid",
            })
        );
        createdModel.add(
            tf.layers.dense({
                units: 3,
                activation: "sigmoid",
            })
        );

        const weights = fromDNAtoWeights(dna);
        createdModel.setWeights(weights);

        setModel(createdModel);
    }, []);

    return (
        <main>
            <h1>Snake AI</h1>
            <SnakeView rows={25} cols={35} model={model} cellSize={16} />
        </main>
    );
}

export default App;
