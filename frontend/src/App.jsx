import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { CreateProposal } from './pages/CreateProposal';
import { Profile } from './pages/Profile';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth defaultMode="login" />} />
          <Route path="/signup" element={<Auth defaultMode="signup" />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/home" element={<Home />} />
          <Route path="/feed" element={<Dashboard />} />
          <Route path="/create-proposal" element={<CreateProposal />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0f1729',
            color: '#f1f5f9',
            border: '1px solid rgba(124, 58, 237, 0.15)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#0f1729',
            },
          },
          error: {
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#0f1729',
            },
          },
        }} 
      />
    </div>
  );
}

export default App;
