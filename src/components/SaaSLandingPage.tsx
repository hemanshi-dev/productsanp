import React, { useState, useEffect, useRef } from 'react';

const LumexAILanding: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptInput, setPromptInput] = useState('Describe your vision...');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const prompts = [
    { text: 'A crystal palace floating in clouds at sunset', category: 'Fantasy' },
    { text: 'Cyberpunk street market with neon holograms', category: 'Sci-Fi' },
    { text: 'Minimalist product photography of luxury watch', category: 'Commercial' },
    { text: 'Abstract geometric patterns with liquid gold', category: 'Abstract' },
    { text: 'Ancient temple overgrown with bioluminescent plants', category: 'Nature' },
    { text: 'Portrait of a steampunk inventor with mechanical wings', category: 'Character' }
  ];

  const features = [
    { 
      icon: '🎯', 
      title: 'Precision Control', 
      desc: 'Fine-tune every aspect with advanced parameters',
      gradient: 'from-purple-600 to-pink-600'
    },
    { 
      icon: '⚡', 
      title: 'Lightning Fast', 
      desc: 'Generate stunning images in under 2 seconds',
      gradient: 'from-blue-600 to-cyan-600'
    },
    { 
      icon: '🎨', 
      title: 'Style Mastery', 
      desc: '100+ artistic styles at your fingertips',
      gradient: 'from-orange-600 to-red-600'
    },
    { 
      icon: '🔮', 
      title: 'AI Intelligence', 
      desc: 'Smart enhancement and automatic optimization',
      gradient: 'from-green-600 to-emerald-600'
    },
    { 
      icon: '💎', 
      title: 'Ultra HD Quality', 
      desc: 'Crystal clear images up to 8K resolution',
      gradient: 'from-indigo-600 to-purple-600'
    },
    { 
      icon: '🚀', 
      title: 'Batch Processing', 
      desc: 'Create multiple variations simultaneously',
      gradient: 'from-pink-600 to-rose-600'
    }
  ];

  const stats = [
    { number: '50M+', label: 'Images Created', delay: 0 },
    { number: '2.3s', label: 'Average Generation', delay: 100 },
    { number: '99.9%', label: 'Uptime SLA', delay: 200 },
    { number: '4.9★', label: 'User Rating', delay: 300 }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const handlePromptClick = (prompt: { text: string; category: string }) => {
    setSelectedPrompt(prompt.text);
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2300);
  };

  const handleGenerate = () => {
    if (promptInput.trim()) {
      setIsGenerating(true);
      setTimeout(() => setIsGenerating(false), 2300);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        
        :root {
          --primary: #6366f1;
          --secondary: #ec4899;
          --accent: #14b8a6;
          --dark: #0a0a0a;
          --surface: #111111;
          --border: #1a1a1a;
          --text: #ffffff;
          --muted: #6b7280;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body { 
          background: var(--dark); 
          color: var(--text); 
          font-family: 'Inter', sans-serif; 
          overflow-x: hidden;
        }

        .font-display { font-family: 'Space Grotesk', sans-serif; }

        /* Gradient backgrounds */
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Glass morphism */
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Animations */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(1deg); }
          66% { transform: translateY(10px) rotate(-1deg); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.5); }
          50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.8); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .float-animation { animation: float 6s ease-in-out infinite; }
        .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .slide-up { animation: slide-up 0.8s ease-out; }
        .gradient-animation {
          background: linear-gradient(270deg, #667eea, #764ba2, #f093fb, #f5576c);
          background-size: 800% 800%;
          animation: gradient-shift 15s ease infinite;
        }

        /* Hover effects */
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(99, 102, 241, 0.3);
        }

        .hover-glow {
          transition: all 0.3s ease;
        }

        .hover-glow:hover {
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.6);
        }

        /* Scroll reveal */
        .scroll-reveal {
          opacity: 0;
          transform: translateY(50px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .scroll-reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: var(--dark); }
        ::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 4px; }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-title { font-size: 3rem !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-animation"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-animation" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-animation" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3 glass' : 'py-5 bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="font-display text-2xl font-bold">LUMEX</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
            <a href="#showcase" className="hover:text-purple-400 transition-colors">Showcase</a>
            <a href="#pricing" className="hover:text-purple-400 transition-colors">Pricing</a>
            <a href="#api" className="hover:text-purple-400 transition-colors">API</a>
            <button className="px-6 py-2 gradient-bg rounded-lg font-medium hover:scale-105 transition-transform">
              Start Creating
            </button>
          </div>

          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="space-y-1">
              <div className="w-6 h-0.5 bg-white"></div>
              <div className="w-6 h-0.5 bg-white"></div>
              <div className="w-6 h-0.5 bg-white"></div>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass mt-2">
            <div className="px-6 py-4 space-y-3">
              <a href="#features" className="block py-2">Features</a>
              <a href="#showcase" className="block py-2">Showcase</a>
              <a href="#pricing" className="block py-2">Pricing</a>
              <a href="#api" className="block py-2">API</a>
              <button className="w-full py-2 gradient-bg rounded-lg">Start Creating</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="slide-up">
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">AI-Powered</span><br />
              Visual Creation
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Transform your imagination into stunning visuals with our advanced AI technology. 
              Create, customize, and export professional images in seconds.
            </p>
          </div>

          {/* Interactive Prompt Input */}
          <div className="max-w-2xl mx-auto mb-12 slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative group">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Describe your vision..."
                className="w-full px-6 py-4 glass rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button
                onClick={handleGenerate}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 gradient-bg rounded-xl font-medium hover:scale-105 transition-transform"
              >
                Generate
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 slide-up" style={{ animationDelay: '0.4s' }}>
            {['Photo', 'Art', 'Logo', 'Character'].map((action) => (
              <button
                key={action}
                className="px-6 py-3 glass rounded-lg hover:bg-white hover:bg-opacity-10 transition-all"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 glass">
        <div className="max-w-6xl mx-auto">
          <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center scroll-reveal"
                style={{ animationDelay: `${stat.delay}ms` }}
              >
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Features Grid */}
      <section 
        id="features" 
        ref={(el) => { sectionRefs.current['features'] = el; }}
        className="py-20 px-6 scroll-reveal"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Powerful <span className="gradient-text">Features</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to create professional AI-generated content
            </p>
          </div>

          <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`relative p-8 glass rounded-2xl hover-lift cursor-pointer ${
                  hoveredFeature === index ? 'ring-2 ring-purple-500' : ''
                }`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-2xl mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
                
                {hoveredFeature === index && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-10 rounded-2xl pointer-events-none`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Showcase */}
      <section 
        id="showcase" 
        ref={(el) => { sectionRefs.current['showcase'] = el; }}
        className="py-20 px-6 scroll-reveal"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Try <span className="gradient-text">Examples</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Click any prompt to see the magic happen
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="glass rounded-xl p-1 flex">
              {['create', 'style', 'enhance'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-lg capitalize transition-all ${
                    activeTab === tab 
                      ? 'gradient-bg text-white' 
                      : 'hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Prompts Panel */}
            <div>
              <h3 className="text-2xl font-semibold mb-6">Sample Prompts</h3>
              <div className="space-y-4">
                {prompts.map((prompt, index) => (
                  <div
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    className={`p-4 glass rounded-xl cursor-pointer transition-all hover-lift ${
                      selectedPrompt === prompt.text ? 'ring-2 ring-purple-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm text-purple-400 font-medium">{prompt.category}</span>
                      <span className="text-gray-400">→</span>
                    </div>
                    <p className="text-gray-200">{prompt.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Result Panel */}
            <div>
              <h3 className="text-2xl font-semibold mb-6">Generated Result</h3>
              <div className="relative aspect-square glass rounded-2xl overflow-hidden">
                {isGenerating ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 border-4 border-t-purple-500 border-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-lg">Creating magic...</p>
                    </div>
                  </div>
                ) : selectedPrompt ? (
                  <div className="w-full h-full gradient-animation flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-6xl mb-4">✨</div>
                      <p className="text-xl font-medium mb-2">Generated Successfully</p>
                      <p className="text-sm opacity-80">Time: 2.3s | Quality: Ultra HD</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Select a prompt to generate
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section 
        id="pricing" 
        ref={(el) => { sectionRefs.current['pricing'] = el; }}
        className="py-20 px-6 scroll-reveal"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Simple <span className="gradient-text">Pricing</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Choose the perfect plan for your creative needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: 'Free',
                desc: 'Perfect for trying out',
                features: ['10 images/month', 'Basic styles', 'Standard resolution', 'Community support'],
                gradient: 'from-gray-600 to-gray-700'
              },
              {
                name: 'Creator',
                price: '$19/mo',
                desc: 'For passionate creators',
                features: ['Unlimited images', 'All styles', 'HD resolution', 'Priority support', 'Commercial license'],
                gradient: 'from-purple-600 to-pink-600',
                popular: true
              },
              {
                name: 'Pro',
                price: '$49/mo',
                desc: 'For professionals',
                features: ['Everything in Creator', '4K resolution', 'API access', 'Team collaboration', 'Custom models'],
                gradient: 'from-blue-600 to-cyan-600'
              }
            ].map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 glass rounded-2xl hover-lift ${
                  plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 gradient-bg rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center text-2xl mb-6 mx-auto`}>
                  {index === 0 ? '🌱' : index === 1 ? '🎨' : '🚀'}
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-2">{plan.price}</div>
                <p className="text-gray-400 mb-6">{plan.desc}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs mr-3">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-3 rounded-xl font-medium transition-all ${
                  plan.popular 
                    ? 'gradient-bg hover:scale-105' 
                    : 'glass hover:bg-white hover:bg-opacity-10'
                }`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="gradient-animation rounded-3xl p-12 text-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Create Amazing Content?
            </h2>
            <p className="text-xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already using LUMEX AI to bring their ideas to life
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-black rounded-xl font-semibold hover:scale-105 transition-transform">
                Start Free Trial
              </button>
              <button className="px-8 py-4 glass rounded-xl font-semibold hover:bg-white hover:bg-opacity-10 transition-all">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">L</span>
                </div>
                <span className="font-display text-2xl font-bold">LUMEX</span>
              </div>
              <p className="text-gray-400">AI-powered visual creation platform</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Features</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Pricing</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">API</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">About</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Blog</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Careers</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Privacy</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Terms</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">License</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LUMEX AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LumexAILanding;
