import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PageContainer from "./layout/PageContainer";
import Securesharing from "./pages/Securesharing"; 

function App() {
  return (
    <Router>
      <PageContainer>
        <Routes>
          {/* This acts as a temporary empty Dashboard */}
          <Route path="/" element={<div style={{ padding: '20px' }}><h2>Dashboard Content Goes Here</h2></div>} />
          
          {/* This correctly links your page to the Secure Sharing sidebar button */}
          <Route path="/sharing" element={<Securesharing />} />
        </Routes>
      </PageContainer>
    </Router>
  );
}

export default App;