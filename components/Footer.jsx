import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="text-gray-600 mb-4 md:mb-0">
          © {new Date().getFullYear()} Car MarketPlace
        </div>
        
        <div className="flex space-x-4">
          <a href="#" className="text-gray-600 hover:text-green-600"><Facebook size={20} /></a>
          <a href="#" className="text-gray-600 hover:text-green-600"><Twitter size={20} /></a>
          <a href="#" className="text-gray-600 hover:text-green-600"><Instagram size={20} /></a>
          <a href="#" className="text-gray-600 hover:text-green-600"><Linkedin size={20} /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
