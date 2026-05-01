import type { Impression, CalendarEvent, Goal } from '@/types';

export const MOCK_USER_ID = 'user_01';
export const MOCK_USER_ID_2 = 'user_02';

export const SEED_IMPRESSIONS: Impression[] = [
  {
    id: 'imp_01',
    authorId: MOCK_USER_ID,
    placeName: 'Café Procope',
    description:
      'One of the oldest cafés in Paris. The espresso was dense and rich, served in a tiny cup that felt almost ceremonial. The walls lined with vintage portraits make it feel like stepping back in time.',
    rating: 5,
    images: [
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    ],
    location: {
      latitude: 48.852872,
      longitude: 2.340172,
      address: '13 Rue de l\'Ancienne Comédie, 75006 Paris',
    },
    createdAt: '2026-04-18T14:32:00.000Z',
    updatedAt: '2026-04-18T14:32:00.000Z',
  },
  {
    id: 'imp_02',
    authorId: MOCK_USER_ID_2,
    placeName: 'Parc des Buttes-Chaumont',
    description:
      'Surprisingly hilly for Paris. Rented a paddleboat on the lake and circled the rocky island. The belvedere at the top offers one of the best 360° views of the city that tourists rarely find.',
    rating: 4,
    images: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    ],
    location: {
      latitude: 48.879908,
      longitude: 2.382432,
      address: 'Parc des Buttes-Chaumont, 75019 Paris',
    },
    createdAt: '2026-04-20T10:15:00.000Z',
    updatedAt: '2026-04-20T10:15:00.000Z',
  },
  {
    id: 'imp_03',
    authorId: MOCK_USER_ID,
    placeName: 'Marché d\'Aligre',
    description:
      'Chaotic, loud, and wonderful. The outdoor market spills into the indoor halles. Grabbed a wedge of aged comté and fresh radishes. The flea section next door had a 1970s Le Creuset pot for €8.',
    rating: 5,
    images: [
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800',
    ],
    location: {
      latitude: 48.849512,
      longitude: 2.373801,
      address: 'Place d\'Aligre, 75012 Paris',
    },
    createdAt: '2026-04-25T08:45:00.000Z',
    updatedAt: '2026-04-25T08:45:00.000Z',
  },
  {
    id: 'imp_04',
    authorId: MOCK_USER_ID_2,
    placeName: 'Musée de la Chasse et de la Nature',
    description:
      'Oddly bewitching. Half natural history museum, half contemporary art gallery. The rooms dedicated to different animals blend taxidermy with modern installations. The fox room was unforgettable.',
    rating: 4,
    images: [
      'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800',
    ],
    location: {
      latitude: 48.857897,
      longitude: 2.351534,
      address: '62 Rue des Archives, 75003 Paris',
    },
    createdAt: '2026-04-27T15:00:00.000Z',
    updatedAt: '2026-04-27T15:00:00.000Z',
  },
  {
    id: 'imp_05',
    authorId: MOCK_USER_ID,
    placeName: 'Boulangerie Utopie',
    description:
      'The croissants here have a distinct lamination visible from the outside — deeply caramelized, shattery layers. Waited 20 minutes in line. Worth every second.',
    rating: 5,
    images: [
      'https://images.unsplash.com/photo-1568471173242-461f0a730452?w=800',
    ],
    location: {
      latitude: 48.864021,
      longitude: 2.367409,
      address: '20 Rue Jean-Pierre Timbaud, 75011 Paris',
    },
    createdAt: '2026-04-29T09:10:00.000Z',
    updatedAt: '2026-04-29T09:10:00.000Z',
  },
];

export const SEED_EVENTS: CalendarEvent[] = [
  {
    id: 'evt_01',
    authorId: MOCK_USER_ID,
    title: 'Dinner at Septime',
    description: 'Reservation for 2 at 8pm. Dress smart casual.',
    date: '2026-05-03',
    time: '20:00',
    createdAt: '2026-04-28T10:00:00.000Z',
  },
  {
    id: 'evt_02',
    authorId: MOCK_USER_ID_2,
    title: 'Canal Saint-Martin walk',
    description: 'Morning walk along the canal, stop at Ten Belles for coffee.',
    date: '2026-05-05',
    time: '10:00',
    createdAt: '2026-04-29T12:00:00.000Z',
  },
  {
    id: 'evt_03',
    authorId: MOCK_USER_ID,
    title: 'Versailles day trip',
    description: 'Take the RER C from Austerlitz. Buy tickets online.',
    date: '2026-05-10',
    time: null,
    createdAt: '2026-04-30T09:00:00.000Z',
  },
  {
    id: 'evt_04',
    authorId: MOCK_USER_ID_2,
    title: 'Cooking class at La Cuisine Paris',
    description: 'French pastry fundamentals, 3 hours.',
    date: '2026-05-08',
    time: '14:00',
    createdAt: '2026-04-30T14:00:00.000Z',
  },
];

export const SEED_GOALS: Goal[] = [
  {
    id: 'goal_01',
    authorId: MOCK_USER_ID,
    title: 'Visit 3 new arrondissements',
    description: 'Explore neighborhoods we haven\'t been to yet.',
    period: 'weekly',
    periodLabel: 'Week of Apr 28',
    status: 'in_progress',
    statusReason: null,
    createdAt: '2026-04-28T08:00:00.000Z',
    updatedAt: '2026-04-30T10:00:00.000Z',
  },
  {
    id: 'goal_02',
    authorId: MOCK_USER_ID_2,
    title: 'Find the best croissant',
    description: 'Visit at least 5 boulangeries and rate each one.',
    period: 'weekly',
    periodLabel: 'Week of Apr 28',
    status: 'finished',
    statusReason: null,
    createdAt: '2026-04-28T08:00:00.000Z',
    updatedAt: '2026-04-30T11:00:00.000Z',
  },
  {
    id: 'goal_03',
    authorId: MOCK_USER_ID,
    title: 'Log 15 impressions this month',
    description: 'One per day minimum.',
    period: 'monthly',
    periodLabel: 'April 2026',
    status: 'blocked',
    statusReason: 'We got sick for a week — only managed 5.',
    createdAt: '2026-04-01T08:00:00.000Z',
    updatedAt: '2026-04-22T09:00:00.000Z',
  },
  {
    id: 'goal_04',
    authorId: MOCK_USER_ID_2,
    title: 'Learn 20 French phrases',
    description: 'Practical phrases for daily life.',
    period: 'monthly',
    periodLabel: 'April 2026',
    status: 'in_progress',
    statusReason: null,
    createdAt: '2026-04-01T08:00:00.000Z',
    updatedAt: '2026-04-25T15:00:00.000Z',
  },
  {
    id: 'goal_05',
    authorId: MOCK_USER_ID,
    title: 'Take a weekend day-trip outside Paris',
    description: 'Consider Reims, Épernay, or Fontainebleau.',
    period: 'monthly',
    periodLabel: 'May 2026',
    status: 'pending',
    statusReason: null,
    createdAt: '2026-05-01T08:00:00.000Z',
    updatedAt: '2026-05-01T08:00:00.000Z',
  },
  {
    id: 'goal_06',
    authorId: MOCK_USER_ID_2,
    title: 'Attend a live jazz set',
    description: 'Caveau de la Huchette or New Morning.',
    period: 'monthly',
    periodLabel: 'May 2026',
    status: 'pending',
    statusReason: null,
    createdAt: '2026-05-01T08:00:00.000Z',
    updatedAt: '2026-05-01T08:00:00.000Z',
  },
];
