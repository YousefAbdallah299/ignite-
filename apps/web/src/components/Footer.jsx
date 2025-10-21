import React from 'react';
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

const footerLinks = {
  "For Job Seekers": [
    { name: "Browse Jobs", href: "/jobs" },
    { name: "Browse Courses", href: "/courses" },
    { name: "Career Advice", href: "/blog?category=career-advice" }
  ],
  "For Employers": [
    { name: "Post a Job", href: "/jobs" },
    { name: "Browse Candidates", href: "/job-seekers" },
    { name: "Pricing", href: "/pricing" }
  ],
  "Resources": [
    { name: "Feed", href: "/blog" },
    { name: "Help Center", href: "/help" },
    { name: "About Us", href: "/about" }
  ],
  "Legal": [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" }
  ]
};

const socialLinks = [
  { name: "LinkedIn", href: "#", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg" },
  { name: "Twitter", href: "#", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitter.svg" },
  { name: "Facebook", href: "#", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg" },
  { name: "Instagram", href: "#", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg" }
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">I</span>
              </div>
              <span className="ml-2 text-2xl font-bold text-white">Ignite</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              The premier platform connecting exceptional talent with leading companies. 
              Building careers, building futures.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5 text-red-500" />
                <span>contact@ignite.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-red-500" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-red-500" />
                <span>Cairo, Egypt</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © 2025 Ignite. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Follow us:</span>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-8 h-8 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors duration-200 group"
                    aria-label={social.name}
                  >
                    <img
                      src={social.icon}
                      alt={social.name}
                      className="w-4 h-4 filter brightness-0 invert opacity-60 group-hover:opacity-100"
                    />
                  </a>
                ))}
              </div>
            </div>

            {/* Language Display */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">🌐</span>
              <span className="text-gray-400 text-sm">English</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}