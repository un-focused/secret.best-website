import React, { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css';
import TopBar from './components/topBar';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/home';
import Decipher from './pages/decipher';
import Secret from './pages/secret';
import Error from './pages/error';

function App() {
  return (
    <React.Fragment>
      <BrowserRouter>
        <TopBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/secret/:id" element={<Secret />} />
          <Route path="/decipher" element={<Decipher />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;
