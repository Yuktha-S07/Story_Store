import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import api from '../services/api';
import StoryCard from '../components/StoryCard';
import BackButton from '../components/BackButton';
import GenreFilterDropdown from '../components/GenreFilterDropdown';
import { AuthContext } from '../context/AuthContext';
import { EXISTING_GENRES } from '../utils/genres';
import { getGenreTheme, normalizeGenre } from '../utils/genreTheme';

const COMPLETION_FILTERS = [
  {
    value: 'all',
    label: 'All',
    dot: 'bg-[#7d879c]',
    active:
      'border-[#c3d8f2] bg-[#e6effb] text-[#3f6b9c] shadow-[0_8px_20px_rgba(77,134,196,0.28)] dark:border-[#234265] dark:bg-[#16283f] dark:text-[#9dc4ea]!',
    idle:
      'text-[#5d584f] hover:bg-[#eef4fb] hover:text-[#3f6b9c] dark:text-[#cfc3d5]! dark:hover:bg-[#1b2c40] dark:hover:text-[#9dc4ea]!',
    chip:
      'border-[#c3d8f2] bg-[#e6effb] text-[#3f6b9c] dark:border-[#234265] dark:bg-[#16283f] dark:text-[#9dc4ea]',
  },
  {
    value: 'ongoing',
    label: 'Ongoing',
    dot: 'bg-[#d99a3c]',
    active:
      'border-[#f2d4a4] bg-[#fff0d8] text-[#9b6728] shadow-[0_8px_20px_rgba(217,154,60,0.28)] dark:border-[#6a5330] dark:bg-[#3a2f1d] dark:text-[#f2cf9b]!',
    idle:
      'text-[#5d584f] hover:bg-[#fff6e6] hover:text-[#9b6728] dark:text-[#cfc3d5]! dark:hover:bg-[#3a2f1d] dark:hover:text-[#f2cf9b]!',
    chip:
      'border-[#f2d4a4] bg-[#fff0d8] text-[#9b6728] dark:border-[#6a5330] dark:bg-[#3a2f1d] dark:text-[#f2cf9b]',
  },
  {
    value: 'completed',
    label: 'Completed',
    dot: 'bg-[#397356]',
    active:
      'border-[#bce3cd] bg-[#e1f2e8] text-[#397356] shadow-[0_8px_20px_rgba(57,115,86,0.28)] dark:border-[#31594f] dark:bg-[#1d3830] dark:text-[#9bd4bb]!',
    idle:
      'text-[#5d584f] hover:bg-[#eaf7ef] hover:text-[#397356] dark:text-[#cfc3d5]! dark:hover:bg-[#1d3830] dark:hover:text-[#9bd4bb]!',
    chip:
      'border-[#bce3cd] bg-[#e1f2e8] text-[#397356] dark:border-[#31594f] dark:bg-[#1d3830] dark:text-[#9bd4bb]',
  },
];

const FILTER_LABEL_CLASS =
  'text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#a08a7b] dark:text-[#cba99c]';

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
].map((story, index) => ({ ...story, is_completed: index % 2 === 1 }));

const StoriesPage = () => {
  const [stories, setStories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token } = useContext(AuthContext);

  const normalizedSelectedGenre = normalizeGenre(searchParams.get('genre') || '');
  const completionParam = searchParams.get('completion') || 'all';
  const completionFilter = COMPLETION_FILTERS.some((option) => option.value === completionParam)
    ? completionParam
    : 'all';
  const activeFilterCount = (normalizedSelectedGenre ? 1 : 0) + (completionFilter !== 'all' ? 1 : 0);

  const genreOptions = useMemo(() => {
    const map = new Map();
    EXISTING_GENRES.forEach((name) => map.set(normalizeGenre(name), name));
    stories.forEach((story) => {
      const label = (story.genre || '').trim();
      if (label) map.set(normalizeGenre(label), label);
    });
    return Array.from(map, ([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [stories]);

  const selectedGenreLabel =
    genreOptions.find((option) => option.value === normalizedSelectedGenre)?.label ||
    (searchParams.get('genre') || '').replace(/-/g, ' ');

  const selectedGenreTheme = useMemo(() => getGenreTheme(selectedGenreLabel), [selectedGenreLabel]);
  const completionTheme =
    COMPLETION_FILTERS.find((option) => option.value === completionFilter) || COMPLETION_FILTERS[0];

  const updateFilters = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    const buildQuery = () => {
      const params = new URLSearchParams({ status: 'published', limit: '100' });
      if (completionFilter === 'completed') params.set('is_completed', 'true');
      else if (completionFilter === 'ongoing') params.set('is_completed', 'false');
      return params.toString();
    };

    const fetchStories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/stories?${buildQuery()}`);
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
  }, [user, token, completionFilter]);

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
      const completionMatches =
        completionFilter === 'all' ||
        (completionFilter === 'completed' ? Boolean(story.is_completed) : !story.is_completed);

      return searchMatches && genreMatches && completionMatches;
    });
  }, [stories, searchTerm, normalizedSelectedGenre, completionFilter]);

  return (
    <div className="min-h-screen bg-[#fbfaf7] dark:bg-[#16131b]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mb-5 flex justify-start sm:mb-6">
          <BackButton />
        </div>
        <div className="mb-8 text-center sm:mb-12">
          <h1 className="font-serif text-3xl font-bold text-[#26231f] sm:text-4xl dark:text-gray-100">Discover Stories</h1>
          <p className="mt-2 text-base text-[#5d584f] sm:text-lg dark:text-gray-400">A universe of stories awaits you here.</p>
          <div className="mt-6 max-w-md mx-auto">
            <div className="relative">
              <FiSearch
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c2a893] dark:text-[#a98fb4]"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search by title or genre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-black/10 bg-white py-3 pl-11 pr-4 text-[#3a3a3a] shadow-sm outline-none transition focus:border-[#d96f52] focus:shadow-[0_10px_28px_rgba(217,111,82,0.18)] dark:border-[#5b4b64] dark:bg-[#241e2b] dark:text-[#f4edf7] dark:placeholder:text-[#afa3b7] dark:focus:border-[#e8a08d] dark:focus:shadow-[0_10px_28px_rgba(232,160,141,0.18)]"
              />
            </div>
          </div>

          <div className="relative z-40 mx-auto mt-5 max-w-4xl rounded-[20px] border border-[#e9dfd5] bg-white/80 p-3.5 text-left shadow-[0_18px_45px_rgba(79,53,46,0.10)] backdrop-blur sm:mt-7 sm:rounded-[28px] sm:p-5 dark:border-[#3b3047] dark:bg-[#211a29]/80 dark:shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:flex-wrap lg:items-end lg:gap-6">
              <div className="flex w-full flex-col gap-2 sm:w-auto">
                <span className={FILTER_LABEL_CLASS}>Genre</span>
                <div className="w-full sm:w-auto">
                  <GenreFilterDropdown
                    options={genreOptions}
                    value={normalizedSelectedGenre}
                    onChange={(nextGenre) => updateFilters({ genre: nextGenre })}
                  />
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto lg:ml-0 xl:ml-12">
                <span className={FILTER_LABEL_CLASS}>Status</span>
                <div className="w-full overflow-x-auto sm:w-auto">
                  <div className="inline-flex w-full items-center gap-1.5 rounded-full border border-black/10 bg-[#fbfaf7] p-1.5 shadow-sm sm:w-auto dark:border-[#5b4b64] dark:bg-[#181320]">
                    {COMPLETION_FILTERS.map((option) => {
                      const active = completionFilter === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateFilters({ completion: option.value === 'all' ? '' : option.value })}
                          aria-pressed={active}
                          className={`inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent px-3 py-1.5 text-xs font-semibold transition hover:-translate-y-0.5 sm:flex-none sm:px-4 sm:text-sm ${active ? option.active : option.idle}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${option.dot}`} aria-hidden="true" />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => updateFilters({ genre: '', completion: '' })}
                  className="inline-flex w-full items-center justify-center gap-1.5 self-start rounded-full border border-[#f0c9c9] bg-[#fff1f1] px-4 py-2.5 text-sm font-semibold text-[#a3404f] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#ffe4e4] hover:shadow-md sm:w-auto lg:ml-auto dark:border-[#6b3a44] dark:bg-[#3a222a] dark:text-[#f3b3bb]! dark:hover:bg-[#4a2a34]"
                >
                  <FiX className="h-4 w-4" aria-hidden="true" />
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e9dfd5] bg-white px-4 py-1.5 font-semibold text-[#5d584f] shadow-sm dark:border-[#4b3b5d] dark:bg-[#241e2b] dark:text-[#e7dcef]">
                Showing {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
              </span>

              {normalizedSelectedGenre && (
                <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-semibold shadow-sm ${selectedGenreTheme.chip}`}>
                  <span className={`h-2 w-2 rounded-full ${selectedGenreTheme.dot}`} aria-hidden="true" />
                  {selectedGenreLabel}
                </span>
              )}

              {completionFilter !== 'all' && (
                <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-semibold shadow-sm ${completionTheme.chip}`}>
                  <span className={`h-2 w-2 rounded-full ${completionTheme.dot}`} aria-hidden="true" />
                  {completionTheme.label}
                </span>
              )}
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-[#5d584f] dark:text-gray-400">Loading stories...</p>
          </div>
        )}

        {error && (
            <div className="mb-6 rounded-lg border border-amber-300 bg-amber-100 p-4 text-amber-700 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
            {error}
          </div>
        )}

        {!loading && stories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#5d584f] dark:text-[#cfc3d5]">No stories found. Check back soon!</p>
          </div>
        )}

        <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredStories.map((story) => (
            <StoryCard key={story._id || story.id} story={story} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoriesPage;
