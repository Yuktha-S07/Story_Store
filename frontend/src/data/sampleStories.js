const sampleStories = {
  'sample-1': {
    _id: 'sample-1',
    title: 'The Winter Archive',
    description: 'A hidden library beneath the snow reveals the truth behind a missing heir.',
    genre: 'Fantasy',
    status: 'published',
    author: { username: 'storyhouse' },
    cover_image_url: '/Fantasy.jpg',
    tags: [],
    chapters: [
      {
        _id: 'sample-1-ch1',
        title: 'Chapter 1: The Door Under Snow',
        chapter_number: 1,
        created_at: '2026-05-01T09:00:00.000Z',
        content: `Mara Vale had spent six winters mapping the same frozen hill, always stopping at the old cedar tree.

On the seventh winter, the earth gave way beneath her boots and revealed a brass door sealed with ash-blue runes.

Inside was the Winter Archive, a library that remembered every promise ever broken in the kingdom.

At its center waited a blank ledger with her family crest pressed into the cover.`,
      },
      {
        _id: 'sample-1-ch2',
        title: 'Chapter 2: The Missing Name',
        chapter_number: 2,
        created_at: '2026-05-03T09:00:00.000Z',
        content: `The archivist, a gray-eyed woman named Elowen, explained that the ledger only opened for heirs who were never meant to inherit.

Mara found her brother's name crossed out in silver ink, and beneath it, a path leading to a city no map admitted existed.

When she touched the page, a message appeared: Find the child who was taken, or the archive will freeze the throne forever.`,
      },
    ],
  },
  'sample-2': {
    _id: 'sample-2',
    title: 'Paper Hearts',
    description: 'Two strangers keep finding each other in the same city until timing stops feeling accidental.',
    genre: 'Romance',
    status: 'published',
    author: { username: 'moonlitpen' },
    cover_image_url: '/Romance.jpg',
    tags: [],
    chapters: [
      {
        _id: 'sample-2-ch1',
        title: 'Chapter 1: The Coffee Receipt',
        chapter_number: 1,
        created_at: '2026-05-02T09:00:00.000Z',
        content: `Jules never planned to keep the receipt from the corner café, but the stranger who left it behind had written a phone number on the back in blue ink.

She found him again three days later at the tram stop, reading the same book she had dropped in the café line.

He laughed when she mentioned the receipt, said he had been hoping the universe was less subtle than it looked.`,
      },
      {
        _id: 'sample-2-ch2',
        title: 'Chapter 2: One More Block',
        chapter_number: 2,
        created_at: '2026-05-04T09:00:00.000Z',
        content: `They walked two blocks too far because neither of them wanted the evening to end at the station lights.

Jules learned his name was Adrian, that he repaired old cameras, and that he had once been in love with a city that no longer remembered him.

When he asked if she believed in timing, she told him she only believed in the people who kept showing up.`,
      },
    ],
  },
  'sample-3': {
    _id: 'sample-3',
    title: 'Howling at Dusk',
    description: 'A reluctant wolf heir refuses the pack call and uncovers a hidden treaty with hunters.',
    genre: 'Werewolf',
    status: 'published',
    author: { username: 'wildquill' },
    cover_image_url: '/Werewolf.jpg',
    tags: [],
    chapters: [
      {
        _id: 'sample-3-ch1',
        title: 'Chapter 1: The Pack Call',
        chapter_number: 1,
        created_at: '2026-05-01T09:00:00.000Z',
        content: `When the pack called for Asher to kneel, he stayed standing in the red dust of the ridge.

His mother had warned him that the alpha's blessing was a leash, not a gift, and the moonlight across the valley proved her right.

A hunt marker burned in the grass behind him, left there by someone who wanted a message more than a fight.`,
      },
      {
        _id: 'sample-3-ch2',
        title: 'Chapter 2: The Borrowed Fang',
        chapter_number: 2,
        created_at: '2026-05-03T09:00:00.000Z',
        content: `Deep in the pines, he met Sera, an exile with a scar across her throat and an old clan sigil stitched into her coat.

She told him the pack elders had been hiding a treaty with the hunters, one that traded wolves for peace.

Asher realized the war had already started, just quietly, in rooms no one was allowed to enter.`,
      },
    ],
  },
  'sample-4': {
    _id: 'sample-4',
    title: 'Frames of Us',
    description: 'A comic artist redraws the past and discovers some panels refuse to stay on the page.',
    genre: 'Comic',
    status: 'published',
    author: { username: 'inkverse' },
    cover_image_url: '/Comic.jpg',
    tags: [],
    chapters: [
      {
        _id: 'sample-4-ch1',
        title: 'Chapter 1: The Last Blank Panel',
        chapter_number: 1,
        created_at: '2026-05-02T09:00:00.000Z',
        content: `Every night, Nia left one panel blank in her sketchbook so the page could breathe.

On the night the rain started, the blank square filled itself with a drawing of her childhood apartment, down to the cracked mirror by the door.

In the reflection, her younger brother was standing where he had vanished ten years ago.`,
      },
      {
        _id: 'sample-4-ch2',
        title: 'Chapter 2: Speech Bubbles',
        chapter_number: 2,
        created_at: '2026-05-04T09:00:00.000Z',
        content: `The speech bubbles began appearing above real people, and most of them said the things nobody dared speak aloud.

Nia followed the bubbles to an abandoned studio where an unfinished comic strip lay stacked in boxes under a dust sheet.

The final page showed her holding the same sketchbook.`,
      },
    ],
  },
  'sample-5': {
    _id: 'sample-5',
    title: 'Ink and Thunder',
    description: 'A novelist discovers the ending is writing back and the manuscript is no longer obeying.',
    genre: 'Novels',
    status: 'published',
    author: { username: 'storyforge' },
    cover_image_url: '/Novels.jpg',
    tags: [],
    chapters: [
      {
        _id: 'sample-5-ch1',
        title: 'Chapter 1: The Sentence That Changed',
        chapter_number: 1,
        created_at: '2026-05-01T09:00:00.000Z',
        content: `Vivian had rewritten the opening line twelve times when the thirteenth version appeared on the screen by itself.

It named her by the nickname only one person in the world still used, and it ended with a line she had never typed: don't look behind you when it rains.

Thunder rolled across the apartment windows, and every file in the project folder renamed itself.`,
      },
      {
        _id: 'sample-5-ch2',
        title: 'Chapter 2: Margins in Red',
        chapter_number: 2,
        created_at: '2026-05-03T09:00:00.000Z',
        content: `By midnight, Vivian found red annotations in the margins of her printout, each one pointing out a mistake that had not existed yesterday.

The notes described a missing chapter, a missing character, and a missing promise she had once made to her brother.

When she turned to the final page, the thunder outside answered with three sharp knocks at the door.`,
      },
    ],
  },
  'sample-6': {
    _id: 'sample-6',
    title: 'The Quiet Chapter',
    description: 'A small-town romance grows through handwritten notes, rainstorms, and quiet courage.',
    genre: 'New Adult',
    status: 'published',
    author: { username: 'linenpages' },
    cover_image_url: '/New Adult.jpg',
    tags: [],
    chapters: [
      {
        _id: 'sample-6-ch1',
        title: 'Chapter 1: A Note in the Locker',
        chapter_number: 1,
        created_at: '2026-05-02T09:00:00.000Z',
        content: `Lena found the note in her locker between algebra worksheets and a forgotten scarf.

It said, If you need someone to sit with at lunch, I know a good corner by the window.

The handwriting belonged to Caleb, the mechanic's son who repaired bikes behind the diner and never looked directly at anyone for too long.`,
      },
      {
        _id: 'sample-6-ch2',
        title: 'Chapter 2: The Rain Shelter',
        chapter_number: 2,
        created_at: '2026-05-04T09:00:00.000Z',
        content: `They met again under the pharmacy awning when the rain came down hard enough to turn Main Street into a river.

Caleb offered half his umbrella and a story about the first engine he ever fixed.

Lena told him about the library where she hid when home felt too loud.`,
      },
    ],
  },
  'sample-7': {
    _id: 'sample-7',
    title: 'Short Story Club',
    description: 'A collection of sharp, memorable scenes that land quickly and linger long after the last line.',
    genre: 'Short Story',
    status: 'published',
    author: { username: 'brieflybooked' },
    cover_image_url: '/ShortStory.jpg',
    tags: [],
    chapters: [
      {
        _id: 'sample-7-ch1',
        title: 'Chapter 1: The Last Seat',
        chapter_number: 1,
        created_at: '2026-05-01T09:00:00.000Z',
        content: `The bus always saved the last seat for the woman in the yellow coat, even though the driver insisted he never saw her board.

On the morning the route changed, she left a postcard behind that showed the city as it had looked fifty years earlier.

The card had only one line written on the back: thank you for remembering me when the streets could not.`,
      },
      {
        _id: 'sample-7-ch2',
        title: 'Chapter 2: A Small Orchard',
        chapter_number: 2,
        created_at: '2026-05-03T09:00:00.000Z',
        content: `In the orchard behind the house, the pears ripened in the shape of tiny lanterns.

A boy who had not spoken in months whispered to one of them and heard a voice answer from the branches.

It told him that some stories are planted, not told, and that the ones worth keeping usually start underground.`,
      },
    ],
  },
  'sample-8': {
    _id: 'sample-8',
    title: 'Fanfic After Midnight',
    description: 'A devoted reader writes an alternate ending that starts becoming canon after midnight.',
    genre: 'Fanfiction',
    status: 'published',
    author: { username: 'chapterdream' },
    cover_image_url: '/Fanfiction.jpg',
    tags: [],
    chapters: [
      {
        _id: 'sample-8-ch1',
        title: 'Chapter 1: Tag the Archive',
        chapter_number: 1,
        created_at: '2026-05-02T09:00:00.000Z',
        content: `At 12:04 a.m., Rowan posted the first chapter of the fix-it fic no one had asked for but everyone secretly needed.

It gave the villain a softer backstory, the hero an honest apology, and the side character a chance to live past the final battle.

By sunrise, readers were leaving comments that sounded less like fandom and more like prophecy.`,
      },
      {
        _id: 'sample-8-ch2',
        title: 'Chapter 2: Canon Drift',
        chapter_number: 2,
        created_at: '2026-05-04T09:00:00.000Z',
        content: `The next update changed a detail Rowan had not written.

A hallway that existed only in the source material appeared in the comments thread, and a character who should have stayed fictional sent a message asking why their ending had changed.

Rowan stared at the screen and realized the story had started to answer back.`,
      },
    ],
  },
}

export function getSampleStory(id) {
  return sampleStories[id] || null
}

export function getSampleChapter(chapterId) {
  return Object.values(sampleStories).flatMap((story) => story.chapters || []).find((chapter) => String(chapter._id) === String(chapterId)) || null
}

export default sampleStories
