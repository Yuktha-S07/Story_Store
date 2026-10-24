import React from 'react';
import { Link } from 'react-router-dom';
import { EXISTING_GENRES } from '../utils/genres'

const genres = EXISTING_GENRES.map(name => ({
  name,
  image: name === 'Short Story' ? '/ShortStory.jpg' : `/${name}.jpg`,
}))

const Genres = () => {
  return (
    <section className="bg-[#f7f2ed] py-8 sm:py-12 md:py-16 dark:bg-[#1a1520]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8d7d68] dark:text-[#c6afd1]">Curated</p>
            <h2 className="font-serif text-3xl tracking-tight text-[#1f1b1a] sm:text-4xl md:text-5xl dark:text-[#f1e8f4]">Genres</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-5">
          {genres.map((genre) => (
            <Link
              key={genre.name}
              to={`/stories?genre=${genre.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="group relative rounded-[18px] border border-[#e9dfd5] bg-white p-2.5 shadow-[0_16px_30px_rgba(21,16,12,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_38px_rgba(21,16,12,0.08)] sm:rounded-[24px] sm:p-3.5 dark:border-[#4b3b5d] dark:bg-[#261e30] dark:shadow-[0_16px_30px_rgba(0,0,0,0.3)] dark:hover:bg-[#332740]"
            >
              <div className="mb-2.5 overflow-hidden rounded-[14px] bg-[#f0ece6] sm:mb-3 sm:rounded-[18px]">
                <img
                  src={genre.image}
                  alt={genre.name}
                  className="h-24 w-full object-cover transition duration-300 group-hover:scale-[1.05] sm:h-28"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-sm font-medium text-[#201d1a] dark:text-[#f0e8f4] md:text-lg">{genre.name}</span>
                <span className="hidden text-[10px] uppercase tracking-[0.22em] text-[#8a7d6d] sm:inline dark:text-[#c4add0]">Read</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Genres;
