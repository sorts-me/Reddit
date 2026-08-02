export interface TraitWeights {
  coding?: number;
  ai_ml?: number;
  design?: number;
  robotics?: number;
  public_speaking?: number;
  music?: number;
  dance?: number;
  drama?: number;
  photography?: number;
  e_sports?: number;
  gaming?: number;
  community_service?: number;
  entrepreneurship?: number;
  finance?: number;
  sports?: number;
}

export interface Club {
  id: number;
  name: string;
  category: 'Technical' | 'Cultural' | 'Sports' | 'Academic' | 'Social';
  description: string;
  traits: TraitWeights;
  commitment_hours: number;
  website?: string;
}

export interface Option {
  id: number;
  text: string;
  traits?: TraitWeights;
  commitment?: number;
}

export interface Question {
  id: number;
  code: string;
  text: string;
  options: Option[];
}

export interface Event {
  id: number;
  name: string;
  organizer: string;
  category: string;
  summary: string;
  description: string;
  prizes: string;
  registration_deadline: string;
  event_date: string;
  team_rules: string;
  registration_link: string;
}

export const CLUBS_DATA: Club[] = [
  {
    id: 1,
    name: 'Enigma • Computer Science & Competitive Coding',
    category: 'Technical',
    description: 'Premier coding club focused on algorithms, hackathons, open source, and web development.',
    traits: { coding: 1.0, ai_ml: 0.8, design: 0.5 },
    commitment_hours: 4,
    website: 'https://enigma.sorts.me',
  },
  {
    id: 2,
    name: 'RoboTech • Robotics & Hardware Innovation',
    category: 'Technical',
    description: 'Hands-on robotics, IoT, embedded systems, microcontrollers, and autonomous bots.',
    traits: { robotics: 1.0, coding: 0.7, ai_ml: 0.6 },
    commitment_hours: 6,
  },
  {
    id: 3,
    name: 'Orators Guild • Debating & Public Speaking',
    category: 'Academic',
    description: 'Model UN, parliamentary debates, public speaking workshops, and advocacy.',
    traits: { public_speaking: 1.0, community_service: 0.5 },
    commitment_hours: 3,
  },
  {
    id: 4,
    name: 'Groove House • Music & Band Society',
    category: 'Cultural',
    description: 'Live musical jams, acoustic sessions, vocal training, and annual battle of the bands.',
    traits: { music: 1.0, drama: 0.4 },
    commitment_hours: 4,
  },
  {
    id: 5,
    name: 'PixelCraft • Design, Film & Photography',
    category: 'Cultural',
    description: 'Digital art, UI/UX design, videography, photo walks, and media coverage.',
    traits: { design: 1.0, photography: 0.9 },
    commitment_hours: 3,
  },
  {
    id: 6,
    name: 'Nexus • E-Sports & Gaming Guild',
    category: 'Sports',
    description: 'Competitive e-sports tournaments, casual gaming sessions, and LAN parties.',
    traits: { gaming: 1.0, e_sports: 1.0, coding: 0.3 },
    commitment_hours: 3,
  },
  {
    id: 7,
    name: 'E-Cell • Entrepreneurship & Venture Incubator',
    category: 'Academic',
    description: 'Startup pitch competitions, founder talks, venture capital networking, and business models.',
    traits: { entrepreneurship: 1.0, finance: 0.8, public_speaking: 0.6 },
    commitment_hours: 5,
  },
  {
    id: 8,
    name: 'Rotaract Youth • Community Impact & Volunteering',
    category: 'Social',
    description: 'Social welfare drives, blood donation camps, education initiatives, and sustainability.',
    traits: { community_service: 1.0, public_speaking: 0.5 },
    commitment_hours: 2,
  },
];

export const QUESTIONS_DATA: Question[] = [
  {
    id: 1,
    code: 'primary_interest',
    text: 'What domain gets you most excited on campus?',
    options: [
      { id: 101, text: 'Building Software, Apps & AI Models', traits: { coding: 0.9, ai_ml: 0.8, design: 0.4 }, commitment: 4 },
      { id: 102, text: 'Robotics, Hardware & Electronics Innovation', traits: { robotics: 1.0, coding: 0.6 }, commitment: 6 },
      { id: 103, text: 'Debating, Public Speaking & Leadership', traits: { public_speaking: 1.0, community_service: 0.4 }, commitment: 3 },
      { id: 104, text: 'Music, Live Performances & Jamming', traits: { music: 1.0, drama: 0.5 }, commitment: 4 },
      { id: 105, text: 'Photography, UI/UX & Graphic Design', traits: { design: 1.0, photography: 0.9 }, commitment: 3 },
      { id: 106, text: 'E-Sports, Competitive Gaming & LANs', traits: { e_sports: 1.0, gaming: 1.0 }, commitment: 3 },
      { id: 107, text: 'Startups, Venture Capital & Business Pitching', traits: { entrepreneurship: 1.0, finance: 0.8 }, commitment: 5 },
      { id: 108, text: 'Social Service, Volunteering & Community Work', traits: { community_service: 1.0 }, commitment: 2 },
    ],
  },
  {
    id: 2,
    code: 'work_style',
    text: 'How do you prefer to collaborate on projects?',
    options: [
      { id: 201, text: 'Intensive Hackathons & Technical Sprints', traits: { coding: 0.5, robotics: 0.4, ai_ml: 0.5 } },
      { id: 202, text: 'Creative Workshops & Studio Jams', traits: { music: 0.5, design: 0.6, photography: 0.5 } },
      { id: 203, text: 'Team Competitions & Tournaments', traits: { e_sports: 0.6, public_speaking: 0.5, entrepreneurship: 0.4 } },
      { id: 204, text: 'Community Impact Drives & Fieldwork', traits: { community_service: 0.6 } },
    ],
  },
  {
    id: 3,
    code: 'commitment_level',
    text: 'How much time can you comfortably dedicate per week?',
    options: [
      { id: 301, text: 'Light (1-2 hours per week)', commitment: 2 },
      { id: 302, text: 'Moderate (3-4 hours per week)', commitment: 4 },
      { id: 303, text: 'High (5+ hours per week - Dedicated)', commitment: 6 },
    ],
  },
];

export const EVENTS_DATA: Event[] = [
  {
    id: 1,
    name: 'Smart India Hackathon 2026',
    organizer: 'Enigma & Ministry of Education',
    category: 'Hackathon',
    summary: '36-hour national hardware & software hackathon with cash prizes.',
    description: 'Solve real-world problem statements across AI, Smart Vehicles, Fintech, and Clean Tech.',
    prizes: '₹1,00,000 Total Cash Prize Pool',
    registration_deadline: '2026-09-15',
    event_date: '2026-10-01',
    team_rules: 'Teams of 3 to 6 students.',
    registration_link: 'https://sih.sorts.me',
  },
  {
    id: 2,
    name: 'Battle of the Bands 2026',
    organizer: 'Groove House',
    category: 'Cultural',
    summary: 'Annual inter-college musical band competition and live concert.',
    description: 'Showcase acoustic, rock, or fusion band performances live on main campus stage.',
    prizes: '₹50,000 Cash Prize + Studio Recording Time',
    registration_deadline: '2026-09-20',
    event_date: '2026-10-10',
    team_rules: 'Bands of 3 to 8 members.',
    registration_link: 'https://music.sorts.me',
  },
];
