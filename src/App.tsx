import React, { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css';
import TopBar from './components/topBar';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/home';
import Decipher from './pages/decipher';

function App() {
  return (
    <React.Fragment>
      <BrowserRouter>
        <TopBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/decipher" element={<Decipher />} />
        </Routes>
      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;
