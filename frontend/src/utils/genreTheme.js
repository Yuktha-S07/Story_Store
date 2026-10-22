export const normalizeGenre = (value = '') =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-');

/**
 * Colour palettes used for the discovery filters.
 * Every palette keeps the same shape so the UI can swap them in freely:
 *  - dot      : the small colour swatch used next to a genre label
 *  - light    : border / background / text colours for the light theme
 *  - dark     : dark theme counterpart
 *  - hover    : hover tint for the light and dark theme
 */
const PALETTES = {
  romance: {
    dot: 'bg-[#e2708f]',
    light: 'border-[#f6ccd8] bg-[#ffeef2] text-[#a34460]',
    dark: 'dark:border-[#6b3a4e] dark:bg-[#3a2430] dark:text-[#f4b8cb]!',
    hover: 'hover:bg-[#ffe1ea] dark:hover:bg-[#472a39]',
  },
  werewolf: {
    dot: 'bg-[#7b6bd6]',
    light: 'border-[#d3cef3] bg-[#eeecfc] text-[#4f4494]',
    dark: 'dark:border-[#3f3a63] dark:bg-[#26243f] dark:text-[#bcb6ec]!',
    hover: 'hover:bg-[#e5e1fa] dark:hover:bg-[#332f52]',
  },
  fantasy: {
    dot: 'bg-[#3f9a7a]',
    light: 'border-[#b9e2d3] bg-[#e2f4ee] text-[#2f7059]',
    dark: 'dark:border-[#245046] dark:bg-[#16302a] dark:text-[#8fd7bd]!',
    hover: 'hover:bg-[#d6efe5] dark:hover:bg-[#1e3f36]',
  },
  fanfiction: {
    dot: 'bg-[#a878f0]',
    light: 'border-[#dcc9f7] bg-[#f1e8fd] text-[#6b46a3]',
    dark: 'dark:border-[#44316a] dark:bg-[#2a1f42] dark:text-[#cbb2f2]!',
    hover: 'hover:bg-[#e8dbfb] dark:hover:bg-[#372951]',
  },
  comic: {
    dot: 'bg-[#e08a3c]',
    light: 'border-[#f6d7ab] bg-[#fff0dc] text-[#96601c]',
    dark: 'dark:border-[#5c4322] dark:bg-[#3a2a14] dark:text-[#f0c185]!',
    hover: 'hover:bg-[#ffe8c6] dark:hover:bg-[#4a361b]',
  },
  novels: {
    dot: 'bg-[#4d86c4]',
    light: 'border-[#c3d8f2] bg-[#e6effb] text-[#3f6b9c]',
    dark: 'dark:border-[#234265] dark:bg-[#16283f] dark:text-[#9dc4ea]!',
    hover: 'hover:bg-[#dae8fa] dark:hover:bg-[#1e3450]',
  },
  'new-adult': {
    dot: 'bg-[#e2704f]',
    light: 'border-[#f7c9bb] bg-[#ffeae4] text-[#a3503a]',
    dark: 'dark:border-[#5d382b] dark:bg-[#3a231c] dark:text-[#f3b39f]!',
    hover: 'hover:bg-[#ffdfd5] dark:hover:bg-[#4a2d23]',
  },
  'short-story': {
    dot: 'bg-[#8bb94f]',
    light: 'border-[#d3e9b2] bg-[#eef7dd] text-[#57792c]',
    dark: 'dark:border-[#3a4d26] dark:bg-[#23301a] dark:text-[#c2e090]!',
    hover: 'hover:bg-[#e4f2c9] dark:hover:bg-[#2e3f22]',
  },
};

const DEFAULT_PALETTE = {
  dot: 'bg-[#d96f52]',
  light: 'border-[#f0d0c4] bg-[#fff1eb] text-[#9a514b]',
  dark: 'dark:border-[#6a3f51] dark:bg-[#3a2733] dark:text-[#f2b9ab]!',
  hover: 'hover:bg-[#ffe3da] dark:hover:bg-[#4a2f3c]',
};

/** Extra palettes cycled through for user created genres. */
const CUSTOM_PALETTES = [
  {
    dot: 'bg-[#3fa8a0]',
    light: 'border-[#b6e2de] bg-[#e0f5f3] text-[#2b7a74]',
    dark: 'dark:border-[#245a57] dark:bg-[#153330] dark:text-[#8fdcd6]!',
    hover: 'hover:bg-[#d2efec] dark:hover:bg-[#1d4541]',
  },
  {
    dot: 'bg-[#d4a53c]',
    light: 'border-[#f0dfae] bg-[#fdf5e0] text-[#8d6a1c]',
    dark: 'dark:border-[#5e4a20] dark:bg-[#382c14] dark:text-[#f0d18a]!',
    hover: 'hover:bg-[#faeed0] dark:hover:bg-[#47371b]',
  },
  {
    dot: 'bg-[#5b8fd4]',
    light: 'border-[#c6d8f2] bg-[#e9f0fb] text-[#3c639f]',
    dark: 'dark:border-[#264066] dark:bg-[#18283f] dark:text-[#a6c5ee]!',
    hover: 'hover:bg-[#dbe7fa] dark:hover:bg-[#213553]',
  },
  {
    dot: 'bg-[#c96fa5]',
    light: 'border-[#f0c9e0] bg-[#fbeaf4] text-[#9c4477]',
    dark: 'dark:border-[#5f3350] dark:bg-[#38202f] dark:text-[#efb0d5]!',
    hover: 'hover:bg-[#f7dcec] dark:hover:bg-[#46283a]',
  },
];

/** Neutral palette used by the "all genres" option. */
export const ALL_GENRES_THEME = {
  key: 'all',
  dot: 'bg-[linear-gradient(135deg,#e2708f_0%,#8bb94f_50%,#4d86c4_100%)]',
  light: 'border-[#e6ded6] bg-white text-[#4b4450]',
  dark: 'dark:border-[#4b3b5d] dark:bg-[#241e2b] dark:text-[#e7dcef]!',
  hover: 'hover:bg-[#fdf3ee] dark:hover:bg-[#332740]',
};

function hashString(value = '') {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Returns the colour theme for a genre. Known genres keep their own palette,
 * user created genres get a stable palette picked from the custom set.
 */
export function getGenreTheme(genre) {
  const key = normalizeGenre(genre);
  const palette = PALETTES[key] || CUSTOM_PALETTES[hashString(key) % CUSTOM_PALETTES.length];

  return {
    key,
    dot: palette.dot,
    /** Colours for non interactive elements such as badges. */
    chip: `${palette.light} ${palette.dark}`,
    /** Colours for interactive elements such as buttons. */
    button: `${palette.light} ${palette.dark} ${palette.hover}`,
  };
}

/** Theme for the "all genres" option. */
export function getAllGenresTheme() {
  return {
    key: ALL_GENRES_THEME.key,
    dot: ALL_GENRES_THEME.dot,
    chip: `${ALL_GENRES_THEME.light} ${ALL_GENRES_THEME.dark}`,
    button: `${ALL_GENRES_THEME.light} ${ALL_GENRES_THEME.dark} ${ALL_GENRES_THEME.hover}`,
  };
}
