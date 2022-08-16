import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import MainComponent from './components/Main.component';


function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<MainComponent/>}/>
                </Routes>
            </div>
        </Router>
    </div>
  );
}

export default App;
