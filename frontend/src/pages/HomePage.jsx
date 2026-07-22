import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiFeather, FiBook, FiBookmark } from "react-icons/fi";
import api from "../services/api";
import StoryCard from "../components/StoryCard";
import TrendingStories from '../components/TrendingStories';
import Genres from '../components/Genres';

const HomePage = () => {
  const [stories, setStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [storiesError, setStoriesError] = useState('');

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoadingStories(true);
        setStoriesError('');
        const response = await api.get('/api/stories?status=published&limit=100');
        setStories(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching stories for home page:', error);
        setStoriesError('Unable to load stories right now.');
        setStories([]);
      } finally {
        setLoadingStories(false);
      }
    };

    fetchStories();
  }, []);

  return (
    <div className="w-full overflow-x-hidden bg-transparent text-[#3a3a3a]">
      <section className="w-full border-b border-black/5 bg-transparent">
        <div className="mx-auto grid min-h-[60vh] md:min-h-[80vh] max-w-7xl grid-cols-1 items-center gap-6 md:gap-10 px-6 py-6 md:py-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:py-12">
          <div className="max-w-2xl">
            <p className="mb-4 md:mb-6 text-sm font-semibold uppercase tracking-[0.45em] text-[#6d6a63]">
              Story Store
            </p>
            <h1 className="font-serif text-[2.5rem] leading-[0.92] tracking-tight text-[#26231f] sm:text-6xl lg:text-[6.2rem]">
              Find stories that feel like home.
            </h1>
            <p className="mt-4 md:mt-6 max-w-xl text-sm leading-6 md:text-base md:leading-7 text-[#5d584f] sm:text-lg lg:text-[1.08rem] lg:leading-8">
              A universe of stories is waiting for you. Discover new worlds,
              connect with writers, and share your own voice.
            </p>
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
              <Link
                to="/login"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[linear-gradient(135deg,#C96D7D_0%,#E5A6AF_100%)] px-6 md:px-7 py-3 md:py-3.5 font-semibold text-white text-sm md:text-base shadow-[0_14px_30px_rgba(201,109,125,0.22)] ring-1 ring-white/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(201,109,125,0.28)]"
              >
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_42%)] opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute -left-6 top-0 h-full w-12 -skew-x-12 bg-white/16 blur-md transition-all duration-500 group-hover:left-[110%]" />
                <FiFeather className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12" />
                <span className="relative tracking-wide">Login</span>
              </Link>
              <Link
                to="/stories"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[linear-gradient(135deg,#C96D7D_0%,#E5A6AF_100%)] px-6 md:px-7 py-3 md:py-3.5 font-semibold text-white text-sm md:text-base shadow-[0_14px_30px_rgba(201,109,125,0.22)] ring-1 ring-white/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(201,109,125,0.28)]"
              >
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_42%)] opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute -left-6 top-0 h-full w-12 -skew-x-12 bg-white/16 blur-md transition-all duration-500 group-hover:left-[110%]" />
                <FiBook className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                <span className="relative tracking-wide">Browse stories</span>
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[500px] sm:max-w-[700px] aspect-[5/4] lg:max-w-[920px] z-10 lg:translate-x-10 xl:translate-x-16">
              <div className="absolute inset-0 translate-x-2 translate-y-2 md:translate-x-4 md:translate-y-3 rounded-full bg-[#e8dcc7] blur-3xl" />
               <div className="absolute inset-0 overflow-hidden rounded-[16px] md:rounded-[20px] shadow-[0_20px_50px_rgba(62,46,26,0.15)] md:shadow-[0_34px_90px_rgba(62,46,26,0.2)] ring-1 ring-black/5">
                <img
                  src="/Hero_Image.png"
                  alt="Reading illustration"
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <TrendingStories />
      <Genres />

      {/* Browse / All Stories section removed per request */}

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-12">
        <div className="mt-8">
          <h2 className="text-center font-serif text-4xl text-[#26231f]">
            A Platform Built for You
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <article className="group rounded-[28px] border border-black/8 bg-white p-8 shadow-[0_16px_40px_rgba(0,0,0,0.05)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_24px_50px_rgba(0,0,0,0.1)]">
              <FiFeather className="h-12 w-12 text-[#3a3a3a] transition-transform duration-300 group-hover:scale-110" />
              <h3 className="mt-6 text-2xl font-serif text-[#26231f]">Write Your Story</h3>
              <p className="mt-3 leading-7 text-[#5d584f]">
                Unleash your creativity and share your voice with a global
                community of readers and writers.
              </p>
            </article>
            <article className="group rounded-[28px] border border-black/8 bg-white p-8 shadow-[0_16px_40px_rgba(0,0,0,0.05)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_24px_50px_rgba(0,0,0,0.1)]">
              <FiBook className="h-12 w-12 text-[#3a3a3a] transition-transform duration-300 group-hover:scale-110" />
              <h3 className="mt-6 text-2xl font-serif text-[#26231f]">Discover New Worlds</h3>
              <p className="mt-3 leading-7 text-[#5d584f]">
                Dive into a universe of stories across all genres. Your next
                favorite book is just a click away.
              </p>
            </article>
            <article className="group rounded-[28px] border border-black/8 bg-white p-8 shadow-[0_16px_40px_rgba(0,0,0,0.05)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_24px_50px_rgba(0,0,0,0.1)]">
              <FiBookmark className="h-12 w-12 text-[#3a3a3a] transition-transform duration-300 group-hover:scale-110" />
              <h3 className="mt-6 text-2xl font-serif text-[#26231f]">Connect & Grow</h3>
              <p className="mt-3 leading-7 text-[#5d584f]">
                Connect with fellow story lovers, get feedback on your work, and
                build your audience.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
