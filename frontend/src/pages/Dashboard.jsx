import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ProposalCard } from '../components/ProposalCard';
import { apiCall } from '../utils/api';
import { Loader2, Search, Compass, Sparkles, UserCheck, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../components/Button';

export const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTag, setFilterTag] = useState('');
  
  const initialFilter = searchParams.get('recommended') === 'true' ? 'recommended' : 'all';
  const [filterStatus, setFilterStatus] = useState(initialFilter);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const data = await apiCall('/proposals');
      setProposals(data);
    } catch (error) {
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const userSkillsLower = useMemo(() => {
    if (!user || !user.skills || !Array.isArray(user.skills)) return [];
    return user.skills.map(s => s.toLowerCase().trim());
  }, [user]);

  const filteredProposals = useMemo(() => {
    let result = proposals;
    
    if (filterStatus === 'recommended') {
      if (userSkillsLower.length === 0) {
        result = [];
      } else {
        const scored = proposals.map(p => {
          let tags = p.tags;
          if (typeof tags === 'string') {
            try { tags = JSON.parse(tags); } catch(e) { tags = []; }
          }
          if (!Array.isArray(tags)) tags = [];

          const matchedTags = tags.filter(t => userSkillsLower.includes(t.toLowerCase().trim()));
          return {
            ...p,
            matchedCount: matchedTags.length,
            matchedTags: matchedTags
          };
        });

        // Filter projects that have at least 1 skill match and sort by highest overlap
        result = scored
          .filter(p => p.matchedCount > 0)
          .sort((a, b) => b.matchedCount - a.matchedCount);
      }
    } else if (filterStatus === 'open' || filterStatus === 'closed') {
      result = result.filter(p => p.status === filterStatus);
    }

    if (filterTag.trim()) {
      const lowerFilter = filterTag.toLowerCase();
      result = result.filter(p => {
        let tags = p.tags;
        if (typeof tags === 'string') {
          try { tags = JSON.parse(tags); } catch(e) { tags = []; }
        }
        if (!Array.isArray(tags)) tags = [];
        return (
          p.title?.toLowerCase().includes(lowerFilter) ||
          tags.some(tag => tag.toLowerCase().includes(lowerFilter))
        );
      });
    }

    return result;
  }, [proposals, filterTag, filterStatus, userSkillsLower]);

  const statusButtons = [
    { value: 'all', label: 'All Projects' },
    { value: 'recommended', label: '✨ Recommended For You' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
  ];

  const handleFilterChange = (val) => {
    setFilterStatus(val);
    if (val === 'recommended') {
      setSearchParams({ recommended: 'true' });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-primary/10">
        <div className="absolute inset-0 mesh-bg opacity-30" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <Compass className="h-5 w-5 text-secondary" />
                <p className="text-secondary text-sm font-semibold tracking-wider uppercase">Explore & Collaborate</p>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Project Feed</h1>
              <p className="text-text-muted text-lg max-w-xl">
                Discover projects matched to your skill set and find your next collaboration team.
              </p>
            </div>

            {/* Filters toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{animationDelay: '0.1s'}}>
              {/* Status & Recommendation toggle */}
              <div className="flex flex-wrap items-center rounded-xl bg-surface/60 border border-primary/15 p-1 gap-1">
                {statusButtons.map(btn => (
                  <button
                    key={btn.value}
                    onClick={() => handleFilterChange(btn.value)}
                    className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
                      filterStatus === btn.value
                        ? btn.value === 'recommended'
                          ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                          : 'bg-primary text-white shadow-sm'
                        : 'text-text-muted hover:text-text hover:bg-surface-light'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-text-muted/50" />
                </div>
                <input
                  type="text"
                  placeholder="Search title or tech tag..."
                  className="w-full pl-10 pr-4 py-2.5 bg-surface/60 border border-primary/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 text-sm placeholder:text-text-muted/40 transition-all"
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="container mx-auto px-4 py-10">
        {/* Banner when user is on Recommended tab but has no profile skills */}
        {filterStatus === 'recommended' && userSkillsLower.length === 0 && (
          <div className="mb-10 glass-card rounded-3xl p-8 border border-secondary/30 bg-gradient-to-r from-secondary/10 via-surface to-primary/10 text-center animate-fade-in relative overflow-hidden">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
              <Sparkles className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-black mb-2">Set Up Your Profile Skills for Personal Recommendations</h3>
            <p className="text-text-muted max-w-lg mx-auto mb-6 text-sm leading-relaxed">
              We use the skills in your profile to analyze and suggest open projects that match your expertise (e.g. React, Node.js, Python, PostgreSQL).
            </p>
            <Link to="/profile">
              <Button size="lg" className="gap-2">
                <UserCheck className="h-4 w-4" /> Add Skills to Profile <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* Recommended Header Banner when user HAS skills */}
        {filterStatus === 'recommended' && userSkillsLower.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-secondary animate-pulse" />
              <div>
                <p className="text-sm font-bold text-text">
                  Showing projects matching your skills:
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.skills.map((skill, i) => (
                    <span key={i} className="text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary/20 border border-secondary/30 text-secondary">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Link to="/profile">
              <Button variant="outline" size="sm" className="text-xs">
                Edit Profile Skills
              </Button>
            </Link>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-text-muted text-sm">Loading projects...</p>
          </div>
        ) : filteredProposals.length > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm text-text-muted">
                Showing <span className="text-text font-semibold">{filteredProposals.length}</span> project{filteredProposals.length !== 1 ? 's' : ''}
                {filterStatus === 'recommended' && ' ranked by skill match relevance'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProposals.map((proposal, index) => (
                <div key={proposal.id} className="animate-slide-up" style={{animationDelay: `${index * 0.04}s`}}>
                  <ProposalCard 
                    proposal={proposal} 
                    currentUser={user} 
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 glass-card rounded-2xl animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <Search className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-2">No matching projects found</h3>
            <p className="text-text-muted max-w-sm mx-auto mb-6 text-sm">
              {filterStatus === 'recommended'
                ? "No projects currently require your exact skill tags. Try adding more skills in your profile or view All Projects."
                : "Try adjusting your search filter or check back later for new projects."}
            </p>
            {filterStatus === 'recommended' && (
              <Button variant="outline" onClick={() => handleFilterChange('all')}>
                View All Projects
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
