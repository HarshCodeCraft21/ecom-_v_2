import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';

export const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-tr from-lux-50/20 via-white to-lux-100/10 font-sans text-lux-dark antialiased">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
