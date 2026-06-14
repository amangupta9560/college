import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Github, Linkedin, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded border-t border-border transition-colors duration-200 mt-auto">
      <nav className="grid grid-flow-col gap-4">
        <Link to="/about" className="link link-hover text-sm">About Us</Link>
        <Link to="/contact" className="link link-hover text-sm">Contact</Link>
        <Link to="/terms" className="link link-hover text-sm">Terms of Service</Link>
        <Link to="/privacy" className="link link-hover text-sm">Privacy Policy</Link>
      </nav>
      <nav>
        <div className="grid grid-flow-col gap-4">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            <Github size={20} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            <Linkedin size={20} />
          </a>
          <a href="mailto:support@hackmatch.app" className="hover:text-primary transition-colors">
            <Mail size={20} />
          </a>
        </div>
      </nav>
      <aside className="flex flex-col items-center gap-1">
        <p className="font-bold flex items-center gap-1.5 text-base-content/80">
          <Layers size={16} className="text-primary" /> HackMatch
        </p>
        <p className="text-xs text-base-content/50">Copyright © {new Date().getFullYear()} - All rights reserved by HackMatch Ltd.</p>
      </aside>
    </footer>
  );
};

export default Footer;
