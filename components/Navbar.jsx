'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { FaPlus } from "react-icons/fa";
import { useCurrentUser } from '../hooks/get-current-user';
import { signOut } from 'next-auth/react';
import { GiCarWheel } from "react-icons/gi";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useCurrentUser();
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Contact' }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/sign-in' });
  };

  return (
    <nav className="w-full z-50 bg-white shadow-md">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          
          <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition sm:block hidden">
            Car MarketPlace
          </Link>

          <div className="hidden md:flex space-x-8 font-semibold">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-blue-600 transition duration-300 ease-in-out"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <nav className="flex gap-4 items-center"> 
            <Link href="/new" 
              className="px-3 py-2 text-black hover:bg-blue-700 hover:text-white border-[2px] border-blue-700
              rounded-full font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2">
              <FaPlus />
              <span>Add Listing</span>
            </Link>

            <span className="hidden md:block text-gray-300 text-xl">|</span>

            {user ? (
              <>
                <span>
                  <Link href="/user_details">
                  <GiCarWheel size={24} className="transition-all duration-3000 hover:scale-105 animate-spin " />

                  </Link>
                </span>
                <span className="text-gray-700">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-md bg-red-600 text-white transition-all duration-300 hover:scale-105 
                  px-4 py-2 flex justify-center items-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/sign-in"
                  className="rounded-md bg-blue-700 text-white transition-all duration-300 hover:scale-105 
                  px-4 py-2 flex justify-center items-center text-center">
                  Login
                </Link>

                <Link href="/sign-up" 
                  className="rounded-md bg-blue-700 text-white transition-all duration-300 hover:scale-105 
                  px-4 py-2 flex justify-center items-center">
                  Register
                </Link>
              </>
            )}
          </nav>

          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 bg-white shadow-lg">
            <div className="px-4 pt-2 pb-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-3 text-gray-700 hover:bg-gray-100 rounded-md transition"
                  onClick={toggleMenu}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
