
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Intelligence from './components/Intelligence';
import Pricing from './components/Pricing';
import Security from './components/Security';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Login from './components/Login';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'auth'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleNavigateToAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setCurrentView('auth');
    window.scrollTo(0, 0);
  };

  if (currentView === 'auth') {
    return (
      <Login 
        onBack={() => setCurrentView('landing')} 
        initialMode={authMode} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-gray900 selection:bg-secondary-main selection:text-neutral-gray900">
      <Header 
        onLoginClick={() => handleNavigateToAuth('login')} 
        onSignupClick={() => handleNavigateToAuth('signup')} 
      />
      <main>
        <Hero onSignupClick={() => handleNavigateToAuth('signup')} />
        <Features />
        <Intelligence />
        <Pricing />
        <Security />
        <CTA onSignupClick={() => handleNavigateToAuth('signup')} />
      </main>
      <Footer />
    </div>
  );
}

export default App;