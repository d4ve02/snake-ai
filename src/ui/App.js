import "../css/App.css";
import "../css/normalize.css";
import SnakeView from "./snake/SnakeView";

function App() {
    return (
        <div>
            <SnakeView rows={30} cols={40} />
        </div>
    );
}

export default App;
