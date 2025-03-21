"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, LogOut, MessageSquare } from "lucide-react";
import { FaPlus } from "react-icons/fa";
import { useCurrentUser } from "../hooks/get-current-user";
import { signOut } from "next-auth/react";
import { GiCarWheel } from "react-icons/gi";
import SearchBar from "./Search";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = useCurrentUser();
  const pathname = usePathname();

  // Close mobile menu when changing route
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Handle body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Fetch unread message count
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/messages");
        if (response.ok) {
          const { unreadCount } = await response.json();
          setUnreadCount(unreadCount);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();
    
    // Set up a polling interval
    const interval = setInterval(fetchUnreadCount, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/contact", label: "Contact" },
    { href: "/saved-vehicles", label: "Saved Vehicles" },
  ];

  if (user) {
    navLinks.push({ href: "/messages", label: "Messages" });
  }
  if (user?.role === "admin") {
    navLinks.push({ href: "/admin/dashboard", label: "Admin Dashboard" });
  }

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleLogout = async () => await signOut({ callbackUrl: "/sign-in" });
  const isActive = (href) => pathname === href;

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-md shadow-md py-2" : "bg-gradient-to-r from-blue-800 to-blue-600 py-3"
        }`}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-14">
            <div className="flex-shrink-0">
              <Link
                href="/"
                className={`text-xl sm:text-2xl font-bold transition-all duration-300 flex items-center gap-2 ${
                  scrolled ? "text-blue-700" : "text-white"
                }`}
              >
                <GiCarWheel className={`text-2xl sm:text-3xl ${scrolled ? "text-blue-600" : "text-blue-300"}`} />
                <span className="hidden xs:block">CarMarket</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-grow justify-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 lg:px-4 py-2 mx-1 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive(link.href)
                      ? scrolled
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-blue-700 shadow-md"
                      : scrolled
                      ? "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                      : "text-blue-100 hover:text-white hover:bg-blue-700/40"
                  }`}
                >
                  {link.label}
                  {link.href === "/messages" && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Desktop Search */}
              <div className="hidden md:block">
                <SearchBar scrolled={scrolled} />
              </div>
              
              {/* Add Listing Button */}
              <Link
                href="/new"
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-1 sm:gap-2 ${
                  scrolled ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white text-blue-700 hover:bg-blue-50"
                }`}
              >
                <FaPlus className="text-xs" />
                <span className="hidden sm:inline">Add Listing</span>
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link href="/user_details" className="relative">
                    <div
                      className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 ${
                        scrolled ? "bg-blue-100 text-blue-700" : "bg-blue-700/30 text-white"
                      }`}
                    >
                      <GiCarWheel size={18} className="animate-spin" />
                    </div>
                  </Link>
                  <div className={`hidden sm:flex items-center gap-2 text-sm ${scrolled ? "text-gray-700" : "text-white"}`}>
                    <span className="font-medium truncate max-w-[100px] lg:max-w-none">{user.name}</span>
                    <button
                      onClick={handleLogout}
                      className={`p-1 rounded-full transition-colors hover:bg-opacity-80 ${
                        scrolled ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-red-500/20 text-white hover:bg-red-500/30"
                      }`}
                      title="Sign out"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                  <button
                    onClick={handleLogout}
                    className={`sm:hidden rounded-full p-1.5 text-sm transition-all duration-300 ${
                      scrolled ? "bg-red-100 text-red-600" : "bg-red-500/20 text-white"
                    }`}
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    href="/sign-in"
                    className={`rounded-full px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                      scrolled
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "bg-blue-700/30 text-white hover:bg-blue-700/50 border border-white"
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/sign-up"
                    className={`rounded-full px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                      scrolled ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white text-blue-700 hover:bg-blue-50"
                    }`}
                  >
                    Register
                  </Link>
                </div>
              )}
              
              {/* Mobile Menu Toggle */}
              <div className="md:hidden">
                <button
                  onClick={toggleMenu}
                  className={`p-1.5 rounded-full transition-all duration-300 ${
                    scrolled ? "text-blue-700 hover:bg-blue-50" : "text-white hover:bg-blue-700/30"
                  }`}
                  aria-label="Toggle menu"
                >
                  {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden mt-6 fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={toggleMenu}>
          <div 
            className="fixed right-0 top-0 h-full w-3/4 max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2" onClick={toggleMenu}>
                  <GiCarWheel className="text-3xl text-blue-600" />
                  <span className="text-xl font-bold text-blue-700">CarMarket</span>
                </Link>
                <button 
                  onClick={toggleMenu}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="pb-2">
                <SearchBar scrolled={true} />
              </div>

              <div className="space-y-1 py-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition ${
                      isActive(link.href)
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    {link.label}
                    {link.href === "/messages" && unreadCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              <div className="my-3 h-px bg-gray-200"></div>
              
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <GiCarWheel size={24} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      {user.email && (
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    <LogOut size={18} />
                    <span>Sign out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <Link
                    href="/sign-in"
                    className="w-full py-3 text-center bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition block"
                  >
                    Login
                  </Link>
                  <Link
                    href="/sign-up"
                    className="w-full py-3 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition block"
                  >
                    Register
                  </Link>
                </div>
              )}
              
              <div className="pt-4">
                <Link
                  href="/new"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <FaPlus />
                  <span>Add New Listing</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;