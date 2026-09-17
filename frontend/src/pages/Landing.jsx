import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Code2, Users, Rocket, ArrowRight, Zap } from 'lucide-react';
import { Auth } from './Auth';

export const Landing = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Code2,
      title: "Pitch Your Idea",
      description: "Post your project proposal with the required tech stack and team needs.",
      color: "primary",
      gradient: "from-primary/20 to-purple-500/20",
      borderColor: "hover:border-primary/40",
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
    },
    {
      icon: Users,
      title: "Find Matches",
      description: "Developers browse the feed, filter by skills, and discover projects.",
      color: "secondary",
      gradient: "from-secondary/20 to-cyan-400/20",
      borderColor: "hover:border-secondary/40",
      iconBg: "bg-secondary/15",
      iconColor: "text-secondary",
    },
    {
      icon: Rocket,
      title: "Connect & Build",
      description: "One click sends an automated email intro. Start building together.",
      color: "accent",
      gradient: "from-accent/20 to-rose-400/20",
      borderColor: "hover:border-accent/40",
      iconBg: "bg-accent/15",
      iconColor: "text-accent",
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      {/* Left side: Intro */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-8 lg:px-16 text-left relative overflow-hidden">
        {/* Mesh background */}
        <div className="absolute inset-0 mesh-bg opacity-60" />
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}} />
        
        <div className="max-w-2xl w-full relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Zap className="h-3.5 w-3.5" />
            Open-source collaboration platform
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 animate-fade-in leading-[1.1]">
            Where Ideas<br />Meet{' '}
            <span className="gradient-text">Builders</span>
          </h1>
          <p className="text-lg md:text-xl text-text-muted mb-12 animate-fade-in max-w-xl leading-relaxed" style={{animationDelay: '0.1s'}}>
            The friction-free platform for developers to post project proposals and find collaborators instantly.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`group flex flex-col items-start p-5 rounded-2xl glass-card ${feature.borderColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-card animate-slide-up`}
                style={{animationDelay: `${0.15 + index * 0.1}s`}}
              >
                <div className={`h-10 w-10 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                </div>
                <h3 className="text-base font-bold mb-1.5">{feature.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side: Auth */}
      <div className="flex-1 flex items-center justify-center relative border-t lg:border-t-0 lg:border-l border-primary/10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="relative z-10">
          <Auth />
        </div>
      </div>
    </div>
  );
};
