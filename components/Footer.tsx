import React from 'react';
import { Linkedin, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-gray50 border-t border-neutral-gray200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
             <a href="#" className="text-2xl font-extrabold tracking-tight text-primary-main mb-6 block">
              Mape<span className="text-secondary-dark">RH</span>
            </a>
            <p className="text-neutral-gray600 mb-6">
              Transformando a gestão de RH para consultores e empresas em todo o Brasil.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-main transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-primary-main transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-primary-main transition-colors"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-neutral-gray900 mb-4">Produto</h4>
            <ul className="space-y-3 text-neutral-gray600">
              <li><a href="#" className="hover:text-primary-main">Funcionalidades</a></li>
              <li><a href="#" className="hover:text-primary-main">Planos e Preços</a></li>
              <li><a href="#" className="hover:text-primary-main">Para Consultores</a></li>
              <li><a href="#" className="hover:text-primary-main">Para Empresas</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-neutral-gray900 mb-4">Empresa</h4>
            <ul className="space-y-3 text-neutral-gray600">
              <li><a href="#" className="hover:text-primary-main">Sobre nós</a></li>
              <li><a href="#" className="hover:text-primary-main">Carreiras</a></li>
              <li><a href="#" className="hover:text-primary-main">Blog</a></li>
              <li><a href="#" className="hover:text-primary-main">Contato</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-neutral-gray900 mb-4">Legal</h4>
            <ul className="space-y-3 text-neutral-gray600">
              <li><a href="#" className="hover:text-primary-main">Termos e Condições</a></li>
              <li><a href="#" className="hover:text-primary-main">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-primary-main">Política de Cookies</a></li>
              <li><a href="#" className="hover:text-primary-main">LGPD</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-gray200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-neutral-gray400">
          <p>© {new Date().getFullYear()} MapeRH. Todos os direitos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
             <span>Feito com <span className="text-red-500">♥</span> no Brasil</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;