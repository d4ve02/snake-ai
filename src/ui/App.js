import "../css/App.css";
import "../css/normalize.css";
import SnakeView from "./snake/SnakeView";

function App() {
    return (
        <div>
            <SnakeView rows={39} cols={39} />
        </div>
    );
}

export default App;
