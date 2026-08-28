import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "Stories", to: "/stories" },
    { label: "Login", to: "/login" },
    { label: "Write", to: "/login?next=/write" },
  ];

  return (
    <footer className="border-t border-white/10 bg-[#101c2d] text-[#edf3ff]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-10">
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.75fr_0.7fr] md:items-start">
          <div className="space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#c7d2ff]">Story Store</p>
            <h3 className="font-serif text-2xl font-medium tracking-tight text-white sm:text-3xl">
              A quiet place for stories.
            </h3>
            <p className="max-w-md text-sm leading-6 text-[#d5ddef]">
              Discover, save, and share the stories that stay with you.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#a7b9ff]">Explore</p>
            <ul className="space-y-2.5 text-[15px]">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="inline-block text-white opacity-100 transition-all duration-200 hover:-translate-x-0.5 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 md:pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#c7d2ff]">Mail</p>
            <p className="text-sm text-[#eaf0ff]">placeholder@example.com</p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-5 text-sm text-[#b5bfce]">
          <p>&copy; {new Date().getFullYear()} Story Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
