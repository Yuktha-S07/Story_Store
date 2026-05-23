import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[linear-gradient(180deg,rgba(23,32,51,0.97)_0%,rgba(28,39,61,0.98)_100%)] text-[#f3ede3] shadow-[0_-12px_30px_rgba(15,23,42,0.16)]">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-[#F6C7D2]/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-[#F4D7B5]/18 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.3fr_0.85fr_0.85fr] md:items-start">
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-3xl text-white">Story Store</h3>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#c9ceda]">
              A place to discover, write, and keep coming back to the stories you love.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Link to="/stories" className="inline-flex w-fit text-sm font-semibold uppercase tracking-[0.3em] text-[#d7b88c] transition hover:text-white">
              Explore
            </Link>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link to="/" className="text-[#e6cc9a] transition duration-300 hover:translate-x-1 hover:text-white">Home</Link></li>
              <li><Link to="/stories" className="text-[#e6cc9a] transition duration-300 hover:translate-x-1 hover:text-white">Stories</Link></li>
              <li><Link to="/login" className="text-[#e6cc9a] transition duration-300 hover:translate-x-1 hover:text-white">Login</Link></li>
              <li><Link to="/login?next=/write" className="text-[#e6cc9a] transition duration-300 hover:translate-x-1 hover:text-white">Write</Link></li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7b88c]">Contact</h4>
            <div className="mt-4 space-y-3 text-sm text-[#d9dde6]">
              <p>Email: contact@storystore.com</p>
              <p>Phone: (123) 456-7890</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-[#aab3c4] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Story Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
