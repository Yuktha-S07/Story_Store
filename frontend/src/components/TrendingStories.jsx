import React, { useState, useEffect, useMemo, useContext } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { buildStoryCoverAlt, buildStoryCoverUrl, buildStoryFallbackUrl } from '../utils/storyCover';

const fallbackStories = [
  {
    _id: 'featured-1',
    title: 'Tempting the Moonlight',
    genre: 'Romance',
    description: 'A quiet confession blooms in the middle of a sleepless night.',
    cover_image_url: '/Romance.jpg',
  },
  {
    _id: 'featured-2',
    title: 'The Last Ember',
    genre: 'Fantasy',
    description: 'A forgotten kingdom wakes up when the final fire is lit.',
    cover_image_url: '/Fantasy.jpg',
  },
  {
    _id: 'featured-3',
    title: 'After the Storm',
    genre: 'New Adult',
    description: 'Two people meet again after the version of them that broke apart.',
    cover_image_url: '/New Adult.jpg',
  },
  {
    _id: 'featured-4',
    title: 'Wild Hearted',
    genre: 'Werewolf',
    description: 'The pack is watching, and the choice is no longer simple.',
    cover_image_url: '/Werewolf.jpg',
  },
  {
    _id: 'featured-5',
    title: 'Midnight Letters',
    genre: 'Short Story',
    description: 'A stack of unsent letters changes the course of one winter.',
    cover_image_url: '/ShortStory.jpg',
  },
  {
    _id: 'featured-6',
    title: 'The Glass Crown',
    genre: 'Fantasy',
    description: 'A fragile crown hides the power to rewrite an empire.',
    cover_image_url: '/Fantasy.jpg',
  },
  {
    _id: 'featured-7',
    title: 'Second Chances',
    genre: 'New Adult',
    description: 'Two old sparks reconnect after years of silence.',
    cover_image_url: '/New Adult.jpg',
  },
  {
    _id: 'featured-8',
    title: 'Beyond the Bite',
    genre: 'Werewolf',
    description: 'The rules of the pack break when loyalty meets desire.',
    cover_image_url: '/Werewolf.jpg',
  },
  {
    _id: 'featured-9',
    title: 'Silent Ink',
    genre: 'Short Story',
    description: 'A quiet note left inside a book changes one life at the edge of winter.',
    cover_image_url: '/ShortStory.jpg',
  },
  {
    _id: 'featured-10',
    title: 'After the Last Page',
    genre: 'Novels',
    description: 'A writer discovers their unfinished draft is already being read by someone else.',
    cover_image_url: '/Novels.jpg',
  },
  {
    _id: 'featured-11',
    title: 'Moonlit Signals',
    genre: 'Fantasy',
    description: 'A hidden signal in the moonlight leads two rivals to the same secret.',
    cover_image_url: '/Fantasy.jpg',
  },
  {
    _id: 'featured-12',
    title: 'The Quiet Signal',
    genre: 'New Adult',
    description: 'A message meant for no one changes everything for the person who finds it.',
    cover_image_url: '/New Adult.jpg',
  },
  {
    _id: 'featured-13',
    title: 'Glass and Ash',
    genre: 'Fantasy',
    description: 'A broken charm, a burned promise, and a kingdom that won’t stay hidden.',
    cover_image_url: '/Fantasy.jpg',
  },
  {
    _id: 'featured-14',
    title: 'Midnight Draft',
    genre: 'Novels',
    description: 'A late-night edit starts writing lines the author never typed.',
    cover_image_url: '/Novels.jpg',
  },
  {
    _id: 'featured-15',
    title: 'Ashes Between Us',
    genre: 'Romance',
    description: 'Two people rebuild what was lost after a city-wide blackout.',
    cover_image_url: '/Romance.jpg',
  },
  {
    _id: 'featured-16',
    title: 'Echoes in the Veil',
    genre: 'Fantasy',
    description: 'A forgotten voice answers back from behind a sealed doorway.',
    cover_image_url: '/Fantasy.jpg',
  },
  {
    _id: 'featured-17',
    title: 'Pages of Storm',
    genre: 'Short Story',
    description: 'One stormy night gives a reader the ending they have been waiting for.',
    cover_image_url: '/ShortStory.jpg',
  },
];

const TrendingStories = () => {
  const { user } = useContext(AuthContext);
  const { notify } = useNotification();
  const [stories, setStories] = useState([]);
  const [saved, setSaved] = useState({});

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await api.get('/api/stories?status=published&limit=7');
        const items = Array.isArray(response.data) ? response.data : [];
        const MAX = 7
        // Merge API results with fallback stories so the rail is always populated
        const merged = [...items]
        for (const fb of fallbackStories) {
          if (merged.length >= MAX) break
          const exists = merged.some(s => String(s._id || s.id) === String(fb._id))
          if (!exists) merged.push(fb)
        }
        setStories(merged.length > 0 ? merged : fallbackStories)
      } catch (error) {
        console.error('Error fetching trending stories:', error);
        setStories(fallbackStories);
      }
    };

    fetchStories();
  }, [user]);

  const visibleStories = useMemo(() => stories.slice(0, 15), [stories]);

  const handleSave = async (storyId) => {
    if (!user) {
      notify('Please log in to save bookmarks.', 'info')
      return;
    }

    try {
      // fetch story to get chapters
      const res = await api.get(`/api/stories/${storyId}`);
      const story = res.data;
      const chapterId = story?.chapters?.[0]?._id || story?.chapters?.[0]?.id;
      if (!chapterId) {
        notify('No chapter is available to bookmark yet.', 'error')
        return;
      }
      await api.post(`/api/stories/${storyId}/chapters/${chapterId}/bookmark`);
      setSaved(prev => ({ ...prev, [storyId]: true }));
      notify('Bookmark saved.', 'success')
    } catch (err) {
      console.error(err);
      notify('Failed to save bookmark.', 'error')
    }
  };

  return (
    <section className="bg-transparent py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#8a7c68]">Trending now</p>
            <h2 className="mt-2 font-serif text-4xl text-[#26231f]">Stories worth your time</h2>
          </div>
          <Link to="/stories" className="hidden text-sm font-semibold text-[#5d584f] underline underline-offset-4 md:inline-flex">
            Browse all stories
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-3">
          {visibleStories.map((story) => {
            const storyId = story._id || story.id;
            const coverImage = buildStoryCoverUrl(story);
            const coverAlt = buildStoryCoverAlt(story);
            return (
              <div key={storyId} className="group w-[156px] flex-shrink-0">
                <div className="flex h-[318px] flex-col overflow-hidden rounded-[22px] shadow-[0_14px_30px_rgba(0,0,0,0.08)] transition duration-300 group-hover:-translate-y-1" style={{ backgroundColor: '#FBF9F1' }}>
                  <div className="aspect-[2/3] overflow-hidden">
                    <img
                      src={coverImage}
                      alt={coverAlt}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = buildStoryFallbackUrl(story) }}
                      className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7c68]">{story.genre || 'Featured'}</p>
                    <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-5 text-[#26231f]">{story.title}</h3>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#5d584f]">
                      {story.description || 'Open the story to start reading.'}
                    </p>
                    <div className="mt-auto flex items-center gap-2 pt-3">
                      <Link to={storyId ? `/stories/${storyId}` : '/stories'} className="rounded-md bg-[#BDA6CE] px-2.5 py-1 text-xs font-semibold text-[#072935] transition hover:bg-[#aa93b6]">Read</Link>
                      <button
                        onClick={() => handleSave(storyId)}
                        className="rounded-md bg-[#DC9B9B] px-2.5 py-1 text-xs font-semibold text-[#3a2626] transition hover:bg-[#c68585]"
                      >
                        {saved[storyId] ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrendingStories;
