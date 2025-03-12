'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, LogOut } from 'lucide-react';
import { FaPlus } from "react-icons/fa";
import { useCurrentUser } from '../hooks/get-current-user';
import { signOut } from 'next-auth/react';
import { GiCarWheel } from "react-icons/gi";
import SearchBar from './Search';


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = useCurrentUser();
  const pathname = usePathname();
  
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Contact' },
    { href: '/saved-vehicles', label: 'Saved Vehicles' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/sign-in' });
  };

  const isActive = (href) => pathname === href;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-2' : 'bg-gradient-to-r from-blue-800 to-blue-600 py-4'
    }`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center">
          {/* Logo - Left Side */}
          <div className="flex-shrink-0">
            <Link href="/" className={`text-2xl font-bold transition-all duration-300 flex items-center gap-2 ${
              scrolled ? 'text-blue-700' : 'text-white'
            }`}>
              <GiCarWheel className={`text-3xl ${scrolled ? 'text-blue-600' : 'text-blue-300'}`} />
              <span className="hidden sm:block">CarMarket</span>
            </Link>
          </div>
          
          {/* Navigation Links - Center */}
          <div className="hidden md:flex flex-grow justify-center">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className={`px-4 py-2 mx-1 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive(link.href)
                    ? scrolled 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-blue-700 shadow-md'
                    : scrolled 
                      ? 'text-gray-700 hover:text-blue-700 hover:bg-blue-50' 
                      : 'text-blue-100 hover:text-white hover:bg-blue-700/40'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          {/* Right Side Elements */}
          <div className="flex items-center gap-3 ml-auto"> 
            {/* Search Bar */}
            <div className="hidden md:block">
              <SearchBar scrolled={scrolled} />
            </div>

            <Link href="/new" 
              className={`px-3 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                scrolled 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-white text-blue-700 hover:bg-blue-50'
              }`}>
              <FaPlus className="text-xs" />
              <span className="hidden sm:inline">Add Listing</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/user_details" className="relative">
                  <div className={`p-2 rounded-full transition-all duration-300 ${
                    scrolled ? 'bg-blue-100 text-blue-700' : 'bg-blue-700/30 text-white'
                  }`}>
                    <GiCarWheel size={20} className="animate-spin" />
                  </div>
                </Link>
                
                <div className={`hidden sm:flex items-center gap-2 text-sm ${
                  scrolled ? 'text-gray-700' : 'text-white'
                }`}>
                  <span className="font-medium">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className={`p-1 rounded-full transition-colors hover:bg-opacity-80 ${
                      scrolled ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-red-500/20 text-white hover:bg-red-500/30'
                    }`}
                    title="Sign out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
                
                <button
                  onClick={handleLogout}
                  className={`sm:hidden rounded-full p-2 text-sm transition-all duration-300 ${
                    scrolled ? 'bg-red-100 text-red-600' : 'bg-red-500/20 text-white'
                  }`}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/sign-in"
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    scrolled 
                      ? 'bg-blue-100  text-blue-700 hover:bg-blue-200' 
                      : 'bg-blue-700/30 text-white hover:bg-blue-700/50 border-2 border-white'
                  }`}>
                  Login
                </Link>

                <Link href="/sign-up" 
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    scrolled 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-white text-blue-700 hover:bg-blue-50'
                  }`}>
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden ml-2">
            <button 
              onClick={toggleMenu}
              className={`p-2 rounded-full transition-all duration-300 ${
                scrolled 
                  ? 'text-blue-700 hover:bg-blue-50' 
                  : 'text-white hover:bg-blue-700/30'
              }`}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute left-0 right-0 mt-2 mx-4 rounded-xl overflow-hidden bg-white shadow-xl">
          <div className="p-2 space-y-1">
            {/* Mobile Search */}
            <div className="px-4 py-2">
              <form className="relative">
                <input
                  type="text"
                  placeholder="Search cars..."
                  className="w-full rounded-lg bg-gray-100 py-2 pl-10 pr-4 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="absolute left-0 top-0 p-2 text-gray-500"
                >
                  <Search size={16} />
                </button>
              </form>
            </div>
            
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex px-4 py-3 rounded-lg transition ${
                  isActive(link.href)
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
                onClick={toggleMenu}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="my-2 h-px bg-gray-200"></div>
            
            {user ? (
              <div className="px-4 py-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <GiCarWheel size={20} className="text-blue-600" />
                  </div>
                  <span className="font-medium">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                    title="Sign out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 flex flex-col gap-2">
                <Link
                  href="/sign-in"
                  className="w-full py-2 text-center bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  href="/sign-up"
                  className="w-full py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  onClick={toggleMenu}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;