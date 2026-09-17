import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiCall } from '../utils/api';
import { Button } from '../components/Button';
import { TagInput } from '../components/TagInput';
import toast from 'react-hot-toast';
import { FileText, Layers, Users, ArrowLeft, Send } from 'lucide-react';

export const CreateProposal = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    roleRequirements: ''
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.description.length < 20) {
      toast.error("Description must be at least 20 characters");
      return;
    }

    setLoading(true);
    try {
      await apiCall('/proposals', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          tags: tags,
          roleRequirements: formData.roleRequirements
        })
      });
      toast.success('Proposal posted successfully!');
      navigate('/home');
    } catch (error) {
      toast.error(error.message || 'Failed to post proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 mesh-bg opacity-20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-10 max-w-2xl relative z-10">
        <div className="mb-8 animate-fade-in">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Post a <span className="gradient-text">Project</span>
          </h1>
          <p className="text-text-muted text-lg">Share your idea and find the perfect collaborators.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 glass-card p-8 rounded-2xl shadow-card animate-slide-up" style={{animationDelay: '0.1s'}}>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-2">
              <FileText className="h-4 w-4 text-primary" />
              Project Title
            </label>
            <input 
              type="text" 
              name="title"
              required
              minLength={5}
              placeholder="e.g. E-commerce Mobile App"
              value={formData.title}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-lg border border-primary/10 bg-surface/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none text-sm placeholder:text-text-muted/40 transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-2">
              <Layers className="h-4 w-4 text-secondary" />
              Tech Stack
            </label>
            <TagInput tags={tags} setTags={setTags} />
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-semibold mb-2">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                Team Requirements
              </span>
              <span className="text-xs text-text-muted font-normal">Optional</span>
            </label>
            <input 
              type="text" 
              name="roleRequirements"
              placeholder="e.g. 1 Frontend Dev (React), 2 Backend (Node.js)"
              value={formData.roleRequirements}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-lg border border-primary/10 bg-surface/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none text-sm placeholder:text-text-muted/40 transition-all"
            />
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-semibold mb-2">
              <span>Description</span>
              <span className="text-xs text-text-muted font-normal">Markdown supported</span>
            </label>
            <textarea 
              name="description"
              required
              minLength={20}
              rows={8}
              placeholder="Describe your project, goals, and what kind of help you need..."
              value={formData.description}
              onChange={handleChange}
              className="w-full p-4 rounded-lg border border-primary/10 bg-surface/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none resize-y font-mono text-sm placeholder:text-text-muted/40 transition-all"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-primary/10">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading} className="gap-2">
              <Send className="h-4 w-4" /> Post Proposal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
