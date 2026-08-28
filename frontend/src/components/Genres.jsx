import React from 'react';
import { Link } from 'react-router-dom';

const genres = [
  { name: 'Romance', image: '/Romance.jpg' },
  { name: 'Werewolf', image: '/Werewolf.jpg' },
  { name: 'Fantasy', image: '/Fantasy.jpg' },
  { name: 'Fanfiction', image: '/Fanfiction.jpg' },
  { name: 'Comic', image: '/Comic.jpg' },
  { name: 'Novels', image: '/Novels.jpg' },
  { name: 'New Adult', image: '/New Adult.jpg' },
  { name: 'Short Story', image: '/ShortStory.jpg' },
];

const Genres = () => {
  return (
    <section className="bg-[#f7f2ed] py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8d7d68]">Curated</p>
            <h2 className="font-serif text-4xl tracking-tight text-[#1f1b1a] md:text-5xl">Genres</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {genres.map((genre) => (
            <Link
              key={genre.name}
              to={`/stories?genre=${genre.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="group relative rounded-[24px] border border-[#e9dfd5] bg-white p-3.5 shadow-[0_16px_30px_rgba(21,16,12,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_38px_rgba(21,16,12,0.08)]"
            >
              <div className="mb-3 overflow-hidden rounded-[18px] bg-[#f0ece6]">
                <img
                  src={genre.image}
                  alt={genre.name}
                  className="h-28 w-full object-cover transition duration-300 group-hover:scale-[1.05]"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-medium text-[#201d1a] md:text-lg">{genre.name}</span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-[#8a7d6d]">Read</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Genres;
