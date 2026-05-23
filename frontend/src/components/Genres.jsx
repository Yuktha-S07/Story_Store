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
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <h2 className="mb-6 font-serif text-4xl text-[#26231f]">Genres</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {genres.map((genre) => (
            <Link
              key={genre.name}
              to={`/stories?genre=${genre.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="flex items-center space-x-4 rounded-lg bg-gray-100 p-4 transition hover:bg-gray-200"
            >
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-[#f0ebe2]">
                <img
                  src={genre.image}
                  alt={genre.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-semibold text-[#26231f]">{genre.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Genres;
