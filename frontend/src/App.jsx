// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
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
import Admin from './pages/Admin';
import ProtectedRoute from './components/Common/ProtectedRoute';
import './index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuctionProvider>
          <Router>
            <div className="App min-h-screen bg-gray-50">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/auction" element={<Auction />} />
                  <Route path="/teams" element={<Teams />} />
                  <Route path="/players" element={<Players />} />
                  <Route path="/tournament" element={<Tournament />} />
                  <Route path="/matches" element={<Matches />} />
                  <Route path="/live" element={<LiveStream />} />
                  <Route path="/admin" element={
                    <ProtectedRoute requireAdmin>
                      <Admin />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
            </div>
          </Router>
        </AuctionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;