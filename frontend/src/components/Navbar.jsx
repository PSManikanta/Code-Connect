import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from './Button';
import { Terminal, Sparkles, LogOut, Menu, X, User } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-primary/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <Terminal className="h-6 w-6 text-primary group-hover:text-secondary transition-colors duration-300" />
            <div className="absolute -inset-1 bg-primary/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">
            Code<span className="gradient-text">Connect</span>
          </span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              <Link 
                to="/home" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/home') 
                    ? 'text-primary bg-primary/10' 
                    : 'text-text-muted hover:text-text hover:bg-surface-light'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/feed" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/feed') 
                    ? 'text-primary bg-primary/10' 
                    : 'text-text-muted hover:text-text hover:bg-surface-light'
                }`}
              >
                Feed
              </Link>
              <Link 
                to="/profile" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  isActive('/profile') 
                    ? 'text-primary bg-primary/10' 
                    : 'text-text-muted hover:text-text hover:bg-surface-light'
                }`}
              >
                <User className="h-4 w-4" /> Profile
              </Link>
              <Link to="/create-proposal" className="ml-2">
                <Button size="sm" className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> New Proposal
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-1 gap-1.5">
                <LogOut className="h-3.5 w-3.5" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="text-text hover:text-primary transition-colors p-2"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass border-b border-primary/10 absolute top-16 left-0 w-full animate-fade-in shadow-xl">
          <div className="flex flex-col p-4 gap-2">
            {user ? (
              <>
                <Link 
                  to="/home" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/home') 
                      ? 'text-primary bg-primary/10' 
                      : 'text-text hover:bg-surface-light'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/feed" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/feed') 
                      ? 'text-primary bg-primary/10' 
                      : 'text-text hover:bg-surface-light'
                  }`}
                >
                  Feed
                </Link>
                <Link 
                  to="/profile" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive('/profile') 
                      ? 'text-primary bg-primary/10' 
                      : 'text-text hover:bg-surface-light'
                  }`}
                >
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link to="/create-proposal" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-center gap-1.5 mt-2">
                    <Sparkles className="h-4 w-4" /> New Proposal
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleLogout} className="w-full justify-center gap-1.5 mt-2 text-text">
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">Login</Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-center">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

