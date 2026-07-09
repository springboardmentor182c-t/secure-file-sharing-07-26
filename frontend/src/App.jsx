import "./App.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ActivityMonitor from "./pages/ActivityMonitor";

function App() {
  return (
    <div className="app">
      <Sidebar />

      <div className="main-content">
        <Navbar />
        <ActivityMonitor />
      </div>
    </div>
  );
}

export default App;