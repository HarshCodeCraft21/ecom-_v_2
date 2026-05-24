import React from 'react';

export const Footer = () => {
  return (
    <footer className="border-t border-lux-100/50 bg-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-lux-dark">
            Lux <span className="text-lux-dark/45 font-normal">Spaces</span>
          </span>
          <p className="text-[10px] text-lux-dark/40 mt-1">© {new Date().getFullYear()} Lux Spaces Inc. All rights reserved.</p>
        </div>
        <div className="flex gap-6 text-[10px] font-bold uppercase tracking-wider text-lux-dark/45">
          <a href="#" className="hover:text-lux-dark transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-lux-dark transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-lux-dark transition-colors">Contact Support</a>
        </div>
      </div>
    </footer>
  );
};
