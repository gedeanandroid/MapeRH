
import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import Button from './ui/Button';
import { Menu, X, Layers } from 'lucide-react';

interface HeaderProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onSignupClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    const element = document.getElementById(id);
    if (element) {
      // Calculate offset based on header height (~80px)
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navLinks = [
    { name: 'Funcionalidades', id: 'features' },
    { name: 'Inteligência', id: 'intelligence' },
    { name: 'Planos', id: 'pricing' },
    { name: 'Segurança', id: 'security' },
  ];

  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' 
          : 'bg-white/50 backdrop-blur-sm py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo Area */}
        <div className="flex items-center group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 bg-primary-main rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-primary-main/20 group-hover:scale-105 transition-transform">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <a href="#" className="text-xl md:text-2xl font-extrabold tracking-tight text-primary-main">
            Mape<span className="text-secondary-dark">RH</span>
          </a>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a 
              key={link.id}
              href={`#${link.id}`} 
              onClick={(e) => scrollToSection(e, link.id)}
              className="relative text-sm font-semibold text-neutral-gray600 hover:text-primary-main transition-colors group py-2"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary-main transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
          
          <div className="pl-6 border-l border-gray-200 flex items-center space-x-3">
            <button 
              onClick={onLoginClick}
              className="text-sm font-semibold text-neutral-gray600 hover:text-primary-main transition-colors px-4 py-2"
            >
              Entrar
            </button>
            <Button 
              variant="primary" 
              className="!py-2.5 !px-5 text-sm !rounded-lg font-bold shadow-md hover:shadow-lg"
              onClick={onSignupClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Criar conta grátis
            </Button>
          </div>
        </nav>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-2 text-neutral-gray800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 md:hidden overflow-hidden"
        >
          <div className="flex flex-col p-6 space-y-4">
            {navLinks.map((link) => (
              <a 
                key={link.id}
                href={`#${link.id}`} 
                onClick={(e) => scrollToSection(e, link.id)}
                className="text-lg font-medium text-neutral-gray800 hover:text-primary-main py-2 border-b border-gray-50 last:border-0"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 flex flex-col gap-3">
              <Button 
                variant="secondary" 
                className="w-full justify-center !border-gray-200"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onLoginClick) onLoginClick();
                }}
              >
                Entrar
              </Button>
              <Button 
                variant="primary" 
                className="w-full justify-center font-bold"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onSignupClick) onSignupClick();
                }}
              >
                Criar conta grátis
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;
