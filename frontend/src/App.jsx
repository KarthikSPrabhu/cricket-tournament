// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuctionProvider } from './context/AuctionContext';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Auction from './pages/Auction';
import Teams from './pages/Teams';
import Players from './pages/Players';
import Tournament from './pages/Tournament';
import Matches from './pages/Matches';
import LiveStream from './pages/LiveStream';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <AuctionProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/auction" element={<Auction />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/players" element={<Players />} />
                <Route path="/tournament" element={<Tournament />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/live" element={<LiveStream />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuctionProvider>
    </AuthProvider>
  );
}

export default App;