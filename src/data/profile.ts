// Personal copy and links live here so updates don't require layout changes.
export const profile = {
  name: 'Oluwatosin Oseni',
  shortName: 'Tosin',
  email: 'tosineoseni@gmail.com',
  github: 'https://github.com/oseni99',
  linkedin: 'https://www.linkedin.com/in/oluwatosin-oseni',
  leetcode: 'https://leetcode.com/u/oluwatosin001/',
  psn: 'clever_ted',
  intro: 'I’m a software geek. I love building things of my own and teaching others what I learn.',
  about: 'A little corner of the internet for what I’m doing, what I’ve made, and everything in between.',
  lately: [
    'Learning about designing systems.',
    'Fixing bugs in my side projects.',
    'Learning about distributed systems.',
  ],
  experience: [
    { role: 'SWE', company: 'Salesforce', icon: '/icons/salesforce.svg', date: '2026' },
    { role: 'TPM', company: 'Microsoft', icon: '/icons/microsoft.svg', date: '2025' },
    { role: 'TA', company: 'Talladega College', icon: '/icons/talladega.png', date: '2024' },
  ],
  hackathons: [
    {
      name: 'Apple x Propel',

      won: '$17,500 prize',
      photos: [
        { src: '/images/propel-mesh-award.webp', alt: 'Tosin holding the Team Mesh award check at the Propel Future of Tech Innovation Challenge.' },
        { src: '/images/propel-mesh-team.webp', alt: 'Team Mesh and organizers holding the award check at the Propel challenge.' },
      ],
    },
    { name: 'HBCU Battle of the Brains', won: '$20,000 prize' },
    { name: '2025 Mastercard x AUC Data Challenge', won: '$5,800 prize', url: 'https://datascience.aucenter.edu/annual-data-challenge-2025/' },
    { name: 'American Airlines Hackathon', won: '50,000 miles' },
  ],
  // Project links are taken directly from the supplied résumé.
  projects: [
    { name: 'MakeItGreen', description: 'An asynchronous code execution system.', url: 'https://makeitgreen.dev' },
    { name: 'Dispatch AI', description: 'A voice AI platform for call triage and dispatch.', url: 'https://github.com/oseni99/dispatchai' },
    { name: 'Leetcode GitHub Sync', description: 'A small extension that keeps coding practice in sync.', url: 'https://github.com/oseni99/LeetcodeGitHubSync' },
  ],
};
