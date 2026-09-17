import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { apiCall } from '../utils/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import anime from 'animejs';
import { X, Edit2, Eye, Users, Calendar, User, ChevronDown, Sparkles } from 'lucide-react';
import { TagInput } from './TagInput';


// Helper to ensure tags are always an array of strings
const normalizeTags = (rawTags) => {
  if (!rawTags) return [];
  if (Array.isArray(rawTags)) return rawTags;
  if (typeof rawTags === 'string') {
    try {
      const parsed = JSON.parse(rawTags);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return rawTags.split(',').map(t => t.trim()).filter(Boolean);
    }
  }
  return [];
};

export const ProposalCard = ({ proposal: initialProposal, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [proposal, setProposal] = useState(initialProposal);
  
  const parsedTags = normalizeTags(proposal.tags);

  // Compute skill matches against currentUser's skills
  const userSkillsLower = (currentUser?.skills || []).map(s => String(s).toLowerCase().trim());
  const matchedTagsCount = parsedTags.filter(tag => userSkillsLower.includes(tag.toLowerCase().trim())).length;

  const [formData, setFormData] = useState({
    title: proposal.title,
    description: proposal.description,
    roleRequirements: proposal.role_requirements || '',
    status: proposal.status || 'open'
  });
  const [tags, setTags] = useState(parsedTags);

  const isOwner = currentUser?.email === proposal.owner_email;

  const handleInterested = async (e) => {
    if (!currentUser) {
      toast.error("Please login to express interest.");
      return;
    }
    
    setLoading(true);
    
    anime({
      targets: e.currentTarget,
      scale: [1, 0.95, 1],
      duration: 300,
      easing: 'easeInOutQuad'
    });

    try {
      await apiCall('/email/interested', {
        method: 'POST',
        body: JSON.stringify({
          proposalId: proposal.id,
          interestedName: currentUser.name,
          interestedEmail: currentUser.email
        })
      });
      toast.success(`Email sent to ${proposal.owner_name}!`);
    } catch (error) {
      toast.error(error.message || "Failed to send interest email.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await apiCall(`/proposals/${proposal.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          roleRequirements: formData.roleRequirements,
          tags: tags,
          status: formData.status
        })
      });
      setProposal(prev => ({ ...prev, ...updated }));
      toast.success('Proposal updated successfully!');
      setIsEditing(false);
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (editMode = false) => {
    const currentParsedTags = normalizeTags(proposal.tags);
    setFormData({
      title: proposal.title,
      description: proposal.description,
      roleRequirements: proposal.role_requirements || '',
      status: proposal.status || 'open'
    });
    setTags(currentParsedTags);
    setIsEditing(editMode);
    setIsModalOpen(true);
  };

  // Close modal on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  return (
    <>
      <div className={`group relative flex flex-col justify-between rounded-2xl glass-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-primary/30 h-full ${
        matchedTagsCount > 0 ? 'border-secondary/30 bg-secondary/5' : ''
      }`}>
        {/* Glow on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <div className="relative z-10">
          {matchedTagsCount > 0 && (
            <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/20 border border-secondary/30 text-secondary text-xs font-bold shadow-sm">
              <Sparkles className="h-3 w-3 animate-pulse" />
              <span>{matchedTagsCount} Skill Match{matchedTagsCount > 1 ? 'es' : ''}</span>
            </div>
          )}

          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 mr-3">
              <h3 className="text-lg font-bold tracking-tight text-text mb-1 truncate">{proposal.title}</h3>
              <div className="flex items-center gap-1.5 text-sm text-text-muted">
                <User className="h-3 w-3 text-primary" />
                <span>{proposal.owner_name}</span>
              </div>
            </div>
            {proposal.status === 'open' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 border border-success/20 px-2.5 py-1 text-xs font-semibold text-success shrink-0">
                <span className="glow-dot bg-success" />
                Open
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 border border-slate-500/20 px-2.5 py-1 text-xs font-semibold text-slate-400 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Closed
              </span>
            )}
          </div>
          
          <div className="prose prose-invert prose-sm max-w-none text-text-muted mb-5 line-clamp-3 [&>*]:mb-0">
            <ReactMarkdown>{proposal.description}</ReactMarkdown>
          </div>
        </div>
        
        <div className="relative z-10 mt-auto">
          {parsedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {parsedTags.map((tag, idx) => {
                const isMatched = userSkillsLower.includes(tag.toLowerCase().trim());
                return (
                  <span 
                    key={idx} 
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border transition-all ${
                      isMatched 
                        ? 'bg-secondary/25 border-secondary/50 text-white font-bold shadow-sm'
                        : 'bg-primary/10 border-primary/20 text-primary'
                    }`}
                  >
                    {isMatched && <span className="mr-1 text-secondary">⚡</span>}
                    {tag}
                  </span>
                );
              })}
            </div>
          )}

          {proposal.role_requirements && (
            <div className="flex items-center gap-1.5 text-xs text-text-muted mb-4">
              <Users className="h-3 w-3 text-accent" />
              <span className="truncate">{proposal.role_requirements}</span>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => handleOpenModal(false)}
            >
              <Eye className="h-3.5 w-3.5" /> View Details
            </Button>
            {!isOwner && proposal.status === 'open' && (
              <Button 
                size="sm"
                className="flex-1" 
                onClick={handleInterested} 
                isLoading={loading}
              >
                I'm Interested
              </Button>
            )}
            {isOwner && (
              <Button 
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
                onClick={() => handleOpenModal(true)}
              >
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal Dialog Portaled to Body */}
      {isModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 animate-fade-in" 
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-[#0b1120] border border-primary/30 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.9)] animate-scale-in relative overflow-hidden text-text z-[100000]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Top Sticky Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-primary/20 bg-[#0e1629] shrink-0">
              <div className="flex-1 pr-4 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {proposal.status === 'open' ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 border border-success/30 px-3 py-0.5 text-xs font-bold text-success">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      Open Project
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/15 border border-slate-500/30 px-3 py-0.5 text-xs font-bold text-slate-400">
                      Closed
                    </span>
                  )}
                  {matchedTagsCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary/20 border border-secondary/30 text-secondary text-xs font-bold">
                      <Sparkles className="h-3 w-3" />
                      {matchedTagsCount} Skill Match{matchedTagsCount > 1 ? 'es' : ''}
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-text leading-tight break-words">
                  {proposal.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-text-muted mt-2">
                  <span className="flex items-center gap-1.5 font-medium text-text">
                    <User className="h-3.5 w-3.5 text-primary" /> {proposal.owner_name}
                  </span>
                  {proposal.created_at && (
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-secondary" /> {formatDate(proposal.created_at)}
                    </span>
                  )}
                </div>
              </div>

              {/* Close Button (X) - Fixed & Visible */}
              <button 
                type="button"
                className="shrink-0 text-text-muted hover:text-white transition-all bg-surface hover:bg-primary/20 border border-primary/20 rounded-full p-2 shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95 ml-2"
                onClick={() => setIsModalOpen(false)}
                title="Close window (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Modal Content Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 bg-[#0b1120] text-text">
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="space-y-5">
                  <h3 className="text-lg font-bold text-text border-b border-primary/15 pb-2">Edit Proposal Details</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold mb-1.5 text-text">Title</label>
                      <input 
                        type="text" name="title" required minLength={5}
                        value={formData.title} onChange={handleEditChange}
                        className="w-full h-11 px-4 rounded-xl border border-primary/20 bg-surface text-text focus:ring-2 focus:ring-primary/40 outline-none text-sm transition-all shadow-sm"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold mb-1.5 text-text">Status</label>
                      <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-primary/20 h-11">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, status: 'open' }))}
                          className={`flex-1 h-8 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                            (formData.status || 'open') === 'open'
                              ? 'bg-success/20 text-success border border-success/40'
                              : 'text-text-muted hover:text-text'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-success" />
                          Open
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, status: 'closed' }))}
                          className={`flex-1 h-8 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                            formData.status === 'closed'
                              ? 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
                              : 'text-text-muted hover:text-text'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Closed
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-text">Team Requirements</label>
                    <input 
                      type="text" name="roleRequirements"
                      value={formData.roleRequirements} onChange={handleEditChange}
                      placeholder="e.g. 1 Frontend Dev, 2 Backend"
                      className="w-full h-11 px-4 rounded-xl border border-primary/20 bg-surface/50 focus:ring-2 focus:ring-primary/40 outline-none text-sm placeholder:text-text-muted/40 transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-text">Tech Stack Tags</label>
                    <div className="bg-surface/50 rounded-xl p-3 border border-primary/20 shadow-sm">
                      <TagInput tags={tags} setTags={setTags} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-text">Description</label>
                    <textarea 
                      name="description" required minLength={20} rows={8}
                      value={formData.description} onChange={handleEditChange}
                      className="w-full p-4 rounded-xl border border-primary/20 bg-surface/50 focus:ring-2 focus:ring-primary/40 outline-none resize-y font-sans text-sm transition-all shadow-sm leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-primary/15">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setFormData({
                          title: proposal.title,
                          description: proposal.description,
                          roleRequirements: proposal.role_requirements || '',
                          status: proposal.status
                        });
                        setTags(normalizeTags(proposal.tags));
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="px-5" isLoading={loading}>Save Changes</Button>
                  </div>
                </form>
              ) : (
                <>
                  {proposal.role_requirements && (
                    <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-accent" />
                        <h4 className="text-xs font-bold text-text uppercase tracking-wider">Team Requirements</h4>
                      </div>
                      <p className="text-text-muted text-sm pl-6 leading-relaxed">{proposal.role_requirements}</p>
                    </div>
                  )}

                  {parsedTags.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Tech Stack Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {parsedTags.map((tag, idx) => {
                          const isMatched = userSkillsLower.includes(tag.toLowerCase().trim());
                          return (
                            <span 
                              key={idx} 
                              className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold border transition-all ${
                                isMatched
                                  ? 'bg-secondary/25 border-secondary/50 text-white shadow-sm'
                                  : 'bg-primary/10 border-primary/20 text-primary'
                              }`}
                            >
                              {isMatched && <span className="mr-1 text-secondary">⚡</span>}
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Project Description</h4>
                    <div className="prose prose-invert prose-sm max-w-none text-text-muted bg-[#12192c] p-5 rounded-2xl border border-primary/15 leading-relaxed [&>h1]:text-text [&>h2]:text-text [&>h3]:text-text [&>strong]:text-text shadow-inner">
                      <ReactMarkdown>{proposal.description}</ReactMarkdown>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Bottom Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-primary/20 bg-[#0e1629] flex items-center justify-between gap-3 shrink-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                {isOwner && !isEditing && (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-3.5 w-3.5" /> Edit Proposal
                  </Button>
                )}

                {!isOwner && proposal.status === 'open' && (
                  <Button 
                    size="sm"
                    className="px-5 gap-2 font-bold shadow-md"
                    onClick={handleInterested} 
                    isLoading={loading}
                  >
                    <Sparkles className="h-4 w-4" /> I'm Interested
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};



