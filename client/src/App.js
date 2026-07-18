import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageContainer from "./layout/PageContainer";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import SecureSharing from "./pages/Securesharing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  return (
    <div className="App">
      <h1>Secure File Sharing - Client</h1>
    </div>
  );
}

export default App;