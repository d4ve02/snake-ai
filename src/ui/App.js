import "../css/App.css";
import "../css/normalize.css";
import SnakeView from "./snake/SnakeView";

function App() {
    return <SnakeView rows={30} cols={50} />;
}

export default App;
