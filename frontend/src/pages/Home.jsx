import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ProposalCard } from '../components/ProposalCard';
import { apiCall } from '../utils/api';
import { Loader2, Plus, LayoutGrid, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../components/Button';

export const Home = () => {
  const { user } = useContext(AuthContext);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchMyProposals();
    }
  }, [user]);

  useEffect(() => {
    if (!user && !loading) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const fetchMyProposals = async () => {
    try {
      const data = await apiCall('/proposals/me');
      setProposals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch user proposals error:', error);
      toast.error(error.message || 'Failed to load your proposals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      {/* Hero section */}
      <div className="relative overflow-hidden border-b border-primary/10">
        <div className="absolute inset-0 mesh-bg opacity-40" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="animate-fade-in">
              <p className="text-primary text-sm font-semibold tracking-wider uppercase mb-2">Dashboard</p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
                Welcome back, <span className="gradient-text">{user?.name}</span>
              </h1>
              <p className="text-text-muted text-lg max-w-xl">
                Manage your proposals and discover new opportunities to collaborate.
              </p>
            </div>
            <div className="flex items-center gap-3 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <Link to="/feed">
                <Button variant="outline" className="gap-2">
                  <LayoutGrid className="h-4 w-4" /> Browse Feed
                </Button>
              </Link>
              <Link to="/create-proposal">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Create Proposal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Proposals section */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-primary to-secondary" />
            <h2 className="text-2xl font-bold">Your Proposals</h2>
            {!loading && (
              <span className="text-sm text-text-muted bg-surface-light px-2.5 py-0.5 rounded-full">
                {proposals.length}
              </span>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-text-muted text-sm">Loading your proposals...</p>
          </div>
        ) : proposals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proposals.map((proposal, index) => (
              <div key={proposal.id} className="animate-slide-up" style={{animationDelay: `${index * 0.05}s`}}>
                <ProposalCard 
                  proposal={proposal} 
                  currentUser={user} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-card rounded-2xl animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">No proposals yet</h3>
            <p className="text-text-muted mb-8 max-w-sm mx-auto">Create your first proposal to start finding collaborators for your project.</p>
            <Link to="/create-proposal">
              <Button className="gap-2">
                Create Your First Proposal <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
