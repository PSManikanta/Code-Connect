import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/Button';
import { TagInput } from '../components/TagInput';
import { apiCall } from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Briefcase, 
  Sparkles, 
  Globe, 
  Link as LinkIcon, 
  Save, 
  Award, 
  CheckCircle2, 
  Compass, 
  Loader2,
  Code2
} from 'lucide-react';


export const Profile = () => {
  const { user, updateProfile, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    roleTitle: '',
    experienceLevel: 'Intermediate',
    bio: '',
    githubUrl: '',
    linkedinUrl: ''
  });
  const [skills, setSkills] = useState([]);
  const [saving, setSaving] = useState(false);
  const [matchedProjectsCount, setMatchedProjectsCount] = useState(0);
  const [loadingProposals, setLoadingProposals] = useState(true);

  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        roleTitle: user.role_title || '',
        experienceLevel: user.experience_level || 'Intermediate',
        bio: user.bio || '',
        githubUrl: user.github_url || '',
        linkedinUrl: user.linkedin_url || ''
      });
      setSkills(Array.isArray(user.skills) ? user.skills : []);
    }
  }, [user]);

  // Fetch proposals to calculate skill match count for user profile
  useEffect(() => {
    if (user) {
      fetchMatchStats();
    }
  }, [user, skills]);

  const fetchMatchStats = async () => {
    try {
      const proposals = await apiCall('/proposals');
      const userSkillsLower = (skills || []).map(s => s.toLowerCase());
      
      if (userSkillsLower.length === 0) {
        setMatchedProjectsCount(0);
      } else {
        const matches = proposals.filter(proposal => {
          let tags = proposal.tags;
          if (typeof tags === 'string') {
            try { tags = JSON.parse(tags); } catch(e) { tags = []; }
          }
          if (!Array.isArray(tags)) tags = [];
          return tags.some(t => userSkillsLower.includes(t.toLowerCase()));
        });
        setMatchedProjectsCount(matches.length);
      }
    } catch (err) {
      console.error("Failed to fetch match stats:", err);
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: formData.name,
        roleTitle: formData.roleTitle,
        experienceLevel: formData.experienceLevel,
        bio: formData.bio,
        skills: skills,
        githubUrl: formData.githubUrl,
        linkedinUrl: formData.linkedinUrl
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const experienceLevels = ['Beginner', 'Intermediate', 'Senior', 'Lead'];

  if (authLoading || !user) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-4rem)] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-text-muted text-sm">Loading profile...</p>
      </div>
    );
  }

  const userInitials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="min-h-[calc(100vh-4rem)] pb-16 relative">
      {/* Background Glows */}
      <div className="relative overflow-hidden border-b border-primary/10">
        <div className="absolute inset-0 mesh-bg opacity-30" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar Pill */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-primary via-secondary to-accent flex items-center justify-center text-3xl sm:text-4xl font-black text-white shadow-2xl shrink-0 border-2 border-white/20">
              {userInitials}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{user.name}</h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/15 border border-primary/30 text-primary">
                  <Award className="h-3.5 w-3.5" />
                  {formData.experienceLevel}
                </span>
              </div>

              <p className="text-text-muted text-lg mb-4 flex items-center justify-center md:justify-start gap-2">
                <Briefcase className="h-4 w-4 text-secondary" />
                {formData.roleTitle || 'Developer / Collaborator'}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-primary" /> {user.email}
                </span>
                {user.created_at && (
                  <span className="text-xs bg-surface-light px-2.5 py-1 rounded-full border border-primary/10">
                    Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>

            {/* Recommendation Stats Widget */}
            <div className="glass-card p-5 rounded-2xl border border-primary/20 flex flex-col items-center justify-center text-center min-w-[240px] shadow-lg">
              <div className="flex items-center gap-2 text-secondary mb-1">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">Feed Matches</span>
              </div>
              <div className="text-3xl font-black text-white mb-1">
                {loadingProposals ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                ) : (
                  <span>{matchedProjectsCount} Projects</span>
                )}
              </div>
              <p className="text-xs text-text-muted mb-3 max-w-[200px]">
                {skills.length === 0
                  ? 'Add your skills below to get matched project recommendations!'
                  : `Matching your ${skills.length} listed skills`}
              </p>
              <Link to="/feed?recommended=true">
                <Button size="sm" className="gap-1.5 text-xs py-1.5">
                  <Compass className="h-3.5 w-3.5" /> View Recommended Feed
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section: Basic Info */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-primary/15 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6 border-b border-primary/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text">Personal & Role Details</h2>
                <p className="text-xs text-text-muted">General info displayed to project owners</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-text">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Rivera"
                  className="w-full h-12 px-4 rounded-xl border border-primary/20 bg-surface/50 text-text focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-text">Role Title / Headline</label>
                <input
                  type="text"
                  name="roleTitle"
                  value={formData.roleTitle}
                  onChange={handleChange}
                  placeholder="e.g. Full-Stack Developer, AI Engineer"
                  className="w-full h-12 px-4 rounded-xl border border-primary/20 bg-surface/50 text-text focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold mb-2 text-text">Experience Level</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {experienceLevels.map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, experienceLevel: level }))}
                    className={`h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all ${
                      formData.experienceLevel === level
                        ? 'bg-primary/20 border-primary text-primary shadow-sm'
                        : 'bg-surface/30 border-primary/10 text-text-muted hover:text-text hover:bg-surface-light'
                    }`}
                  >
                    {formData.experienceLevel === level && <CheckCircle2 className="h-4 w-4" />}
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-text">Bio / About Me</label>
              <textarea
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Share a brief overview of your background, experience, and what kind of projects you love building..."
                className="w-full p-4 rounded-xl border border-primary/20 bg-surface/50 text-text focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none text-sm resize-y leading-relaxed transition-all"
              />
            </div>
          </div>

          {/* Section: Skills */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-primary/15 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 border-b border-primary/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text">Skills & Technologies</h2>
                  <p className="text-xs text-text-muted">Used to match and recommend relevant projects in the Feed</p>
                </div>
              </div>

              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary">
                {skills.length} Skill{skills.length !== 1 ? 's' : ''} Added
              </span>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2 text-text">Your Technical Skills</label>
              <div className="bg-surface/50 rounded-xl p-4 border border-primary/20 shadow-sm">
                <TagInput 
                  tags={skills} 
                  setTags={setSkills} 
                  placeholder="Type a skill (e.g. React, Node.js, Python, PostgreSQL) and press Enter or comma" 
                />
              </div>
              <p className="text-xs text-text-muted mt-2">
                💡 Projects in the feed that match these skill tags will be highlighted under <strong>Recommended Projects</strong>.
              </p>
            </div>

            {/* Quick Skill Suggestion Badges */}
            <div className="mt-4 pt-4 border-t border-primary/10">
              <p className="text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">Suggested Quick Add:</p>
              <div className="flex flex-wrap gap-2">
                {['React', 'Node.js', 'TypeScript', 'Python', 'TailwindCSS', 'PostgreSQL', 'Docker', 'GraphQL', 'Express', 'Next.js'].map(popularSkill => {
                  const alreadyAdded = skills.some(s => s.toLowerCase() === popularSkill.toLowerCase());
                  if (alreadyAdded) return null;
                  return (
                    <button
                      key={popularSkill}
                      type="button"
                      onClick={() => setSkills(prev => [...prev, popularSkill])}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface hover:bg-primary/20 text-text-muted hover:text-primary border border-primary/10 transition-all"
                    >
                      + {popularSkill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section: Social & Portfolio */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-primary/15 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6 border-b border-primary/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text">Links & Links</h2>
                <p className="text-xs text-text-muted">Showcase your repositories and work history</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-text flex items-center gap-2">
                  <Globe className="h-4 w-4 text-text-muted" /> GitHub Profile
                </label>
                <input
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                  className="w-full h-12 px-4 rounded-xl border border-primary/20 bg-surface/50 text-text focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-text flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-text-muted" /> LinkedIn / Portfolio
                </label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourusername"
                  className="w-full h-12 px-4 rounded-xl border border-primary/20 bg-surface/50 text-text focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="submit"
              size="lg"
              className="px-8 gap-2"
              isLoading={saving}
            >
              <Save className="h-4 w-4" /> Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
