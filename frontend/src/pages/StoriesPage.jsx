import React, { useContext, useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import StoryCard from '../components/StoryCard';
import { AuthContext } from '../context/AuthContext';

const fallbackStories = [
  {
    _id: 'sample-1',
    title: 'The Winter Archive',
    description: 'A hidden library beneath the snow reveals the truth behind a missing heir.',
    genre: 'Fantasy',
    status: 'published',
    author: { username: 'storyhouse' },
    cover_image_url: '/Fantasy.jpg',
  },
  {
    _id: 'sample-2',
    title: 'Paper Hearts',
    description: 'Two strangers keep finding each other in the same city until timing stops feeling accidental.',
    genre: 'Romance',
    status: 'published',
    author: { username: 'moonlitpen' },
    cover_image_url: '/Romance.jpg',
  },
  {
    _id: 'sample-3',
    title: 'Howling at Dusk',
    description: 'A reluctant wolf heir refuses the pack call and uncovers a hidden treaty with hunters.',
    genre: 'Werewolf',
    status: 'published',
    author: { username: 'wildquill' },
    cover_image_url: '/Werewolf.jpg',
  },
  {
    _id: 'sample-4',
    title: 'Frames of Us',
    description: 'A comic artist redraws the past and discovers some panels refuse to stay on the page.',
    genre: 'Comic',
    status: 'published',
    author: { username: 'inkverse' },
    cover_image_url: '/Comic.jpg',
  },
  {
    _id: 'sample-5',
    title: 'Ink and Thunder',
    description: 'A novelist discovers the ending is writing back and the manuscript is no longer obeying.',
    genre: 'Novels',
    status: 'published',
    author: { username: 'storyforge' },
    cover_image_url: '/Novels.jpg',
  },
  {
    _id: 'sample-6',
    title: 'The Quiet Chapter',
    description: 'A small-town romance grows through handwritten notes, rainstorms, and quiet courage.',
    genre: 'New Adult',
    status: 'published',
    author: { username: 'linenpages' },
    cover_image_url: '/New Adult.jpg',
  },
  {
    _id: 'sample-7',
    title: 'Short Story Club',
    description: 'A collection of sharp, memorable scenes that land quickly and linger long after the last line.',
    genre: 'Short Story',
    status: 'published',
    author: { username: 'brieflybooked' },
    cover_image_url: '/ShortStory.jpg',
  },
  {
    _id: 'sample-8',
    title: 'Fanfic After Midnight',
    description: 'A devoted reader writes an alternate ending that starts becoming canon after midnight.',
    genre: 'Fanfiction',
    status: 'published',
    author: { username: 'chapterdream' },
    cover_image_url: '/Fanfiction.jpg',
  },
];

const StoriesPage = () => {
  const [stories, setStories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { user, token } = useContext(AuthContext);

  const normalizeGenre = (value = '') => value.toLowerCase().trim().replace(/[\s_]+/g, '-');
  const selectedGenre = new URLSearchParams(location.search).get('genre') || '';
  const selectedGenreLabel = selectedGenre.replace(/-/g, ' ');
  const normalizedSelectedGenre = normalizeGenre(selectedGenreLabel);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/api/stories?status=published&limit=100');
        const items = Array.isArray(response.data) ? response.data : [];
        const mergedStories = [...items];
        fallbackStories.forEach((story) => {
          const alreadyIncluded = mergedStories.some((item) => String(item._id || item.id) === String(story._id));
          if (!alreadyIncluded) {
            mergedStories.push(story);
          }
        });
        setStories(mergedStories);
      } catch (error) {
        console.error('Error fetching stories:', error);
        setError('Failed to load stories. Showing sample stories instead.');
        setStories(fallbackStories);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();

    const handleUpdated = () => fetchStories();
    window.addEventListener('story-store:story-updated', handleUpdated)
    return () => window.removeEventListener('story-store:story-updated', handleUpdated)
  }, [user, token]);

  const filteredStories = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    return stories.filter((story) => {
      const title = (story.title || '').toLowerCase();
      const genre = normalizeGenre(story.genre || '');
      const searchMatches =
        normalizedSearch.length === 0 ||
        title.includes(normalizedSearch) ||
        (story.genre || '').toLowerCase().includes(normalizedSearch);
      const genreMatches = !normalizedSelectedGenre || genre === normalizedSelectedGenre;

      return searchMatches && genreMatches;
    });
  }, [stories, searchTerm, normalizedSelectedGenre]);

  return (
    <div className="bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-[#26231f]">Discover Stories</h1>
          <p className="mt-2 text-lg text-[#5d584f]">Explore a universe of stories from writers around the world.</p>
          {normalizedSelectedGenre && (
            <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-[#d9d2c6] bg-white px-4 py-2 text-sm text-[#5d584f] shadow-sm">
              <span>Filtering by {selectedGenreLabel}</span>
              <Link to="/stories" className="font-semibold text-[#26231f] underline underline-offset-4">
                Clear filter
              </Link>
            </div>
          )}
          <div className="mt-6 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search by title or genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-full border border-black/10 bg-[#fbfaf7] text-[#3a3a3a] outline-none transition focus:border-[#3a3a3a]"
            />
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-[#5d584f]">Loading stories...</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-amber-100 border border-amber-300 text-amber-700 rounded-lg">
            {error}
          </div>
        )}

        {!loading && stories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#5d584f]">No stories found. Check back soon!</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 items-stretch md:grid-cols-2 xl:grid-cols-3">
          {filteredStories.map((story) => (
            <StoryCard key={story._id || story.id} story={story} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoriesPage;
