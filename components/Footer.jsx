import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Car } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white py-6 shadow-inner border-t border-gray-200">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and Copyright */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Car className="text-blue-600" size={20} />
            <span className="font-semibold text-gray-800">Car MarketPlace</span>
            <span className="text-gray-500 text-sm ml-2">© {currentYear}</span>
          </div>
          
          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
            <a href="/" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">Home</a>
            <a href="/search" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">Search Cars</a>
            <a href="/sell" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">Sell Your Car</a>
            <a href="/about" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">About</a>
            <a href="/contact" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">Contact</a>
          </div>
          
          {/* Contact & Social */}
          <div className="flex items-center space-x-6">
            <a href="mailto:info@carmarketplace.com" className="text-gray-600 hover:text-blue-600 transition-colors">
              <Mail size={16} />
            </a>
            <a href="tel:+15551234567" className="text-gray-600 hover:text-blue-600 transition-colors">
              <Phone size={16} />
            </a>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                <Linkedin size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;