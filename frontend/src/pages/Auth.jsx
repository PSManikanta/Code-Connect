import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/Button';
import toast from 'react-hot-toast';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Terminal } from 'lucide-react';

export const Auth = ({ defaultMode }) => {
  const [isLogin, setIsLogin] = useState(() => {
    if (defaultMode === 'signup') return false;
    return true;
  });
  const [loading, setLoading] = useState(false);
  const { login, signup, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    if (mode === 'signup' || location.pathname === '/signup' || defaultMode === 'signup') {
      setIsLogin(false);
    } else if (mode === 'login' || location.pathname === '/login' || defaultMode === 'login') {
      setIsLogin(true);
    }
  }, [location, defaultMode]);

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Successfully logged in!');
        navigate('/home');
      } else {
        await signup(formData.name, formData.email, formData.password);
        toast.success('Account created successfully! Please sign in.');
        setIsLogin(true);
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (error) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleMode = () => {
    const newIsLogin = !isLogin;
    setIsLogin(newIsLogin);
    if (location.pathname === '/login' || location.pathname === '/signup') {
      navigate(newIsLogin ? '/login' : '/signup', { replace: true });
    }
  };

  const isStandalonePage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/auth';

  const formContent = (
    <div className="w-full max-w-md p-8 rounded-2xl glass-card shadow-card animate-scale-in">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
          <Terminal className="h-6 w-6 text-primary group-hover:text-secondary transition-colors" />
          <span className="font-extrabold text-xl tracking-tight">
            Code<span className="gradient-text">Connect</span>
          </span>
        </Link>
        <h2 className="text-3xl font-bold mb-2">
          {isLogin ? 'Welcome Back' : 'Join the Community'}
        </h2>
        <p className="text-text-muted text-sm">
          {isLogin ? 'Sign in to continue building' : 'Create your account and start collaborating'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium mb-1.5 text-text-muted">Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-text-muted/50" />
              </div>
              <input 
                type="text" 
                name="name"
                required={!isLogin}
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full h-11 pl-10 pr-3 rounded-lg border border-primary/10 bg-surface/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none text-sm placeholder:text-text-muted/40 transition-all text-text"
              />
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-1.5 text-text-muted">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-text-muted/50" />
            </div>
            <input 
              type="email" 
              name="email"
              required
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full h-11 pl-10 pr-3 rounded-lg border border-primary/10 bg-surface/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none text-sm placeholder:text-text-muted/40 transition-all text-text"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-text-muted">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-text-muted/50" />
            </div>
            <input 
              type="password" 
              name="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full h-11 pl-10 pr-3 rounded-lg border border-primary/10 bg-surface/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none text-sm placeholder:text-text-muted/40 transition-all text-text"
            />
          </div>
        </div>

        <Button type="submit" className="w-full mt-6 gap-2" isLoading={loading}>
          {isLogin ? 'Log In' : 'Create Account'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button 
          type="button"
          onClick={toggleMode}
          className="text-sm text-text-muted hover:text-primary transition-colors duration-200"
        >
          {isLogin 
            ? <>Don't have an account? <span className="text-primary font-medium">Sign up</span></> 
            : <>Already have an account? <span className="text-primary font-medium">Log in</span></>
          }
        </button>
      </div>
    </div>
  );

  if (isStandalonePage) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg opacity-40" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />

        <div className="w-full max-w-md relative z-10">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full px-4 py-8">
      {formContent}
    </div>
  );
};

