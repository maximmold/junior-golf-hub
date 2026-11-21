import { Tournament, Player } from '../types/tournament';
import { COURSES } from './courses';

export const DEFAULT_PLAYERS: Player[] = [
  {
    id: 'player-owen',
    name: 'Owen Moldenhauer',
    uskidsDivision: 'Boys 13-14',
    scjgaDivision: 'Boys 13-14 / 13-19',
    yardage: '5,200-5,800 yds (18-holes)',
    warmupMinutes: 65, // 1h 5m arrival and warm-up buffer
    color: '#10b981', // Emerald
    avatarEmoji: '🏌️‍♂️',
    isDefault: true,
  }
];

export const SEED_TOURNAMENTS: Tournament[] = [
  // =========================================================================
  // CURRENT & UPCOMING EVENTS (Nov 21, 2026 and later)
  // Past events (Aug-Nov 20, 2026) removed to keep the schedule current
  // =========================================================================
  {
    id: 'scjga-2026-11-21-22-players-champ',
    name: '29th Annual Players Championship',
    tour: 'SCJGA',
    tourSeries: 'Major Championship',
    courseId: 'hartsville-cc',
    course: COURSES['hartsville-cc'],
    startDate: '2026-11-21',
    endDate: '2026-11-22',
    duration: '2-Day',
    registrationOpenDate: '2026-09-24',
    registrationDeadline: '2026-11-05',
    registrationUrl: 'https://scjga.bluegolf.com/bluegolf/scjga26/event/scjga2628/index.htm',
    playerRegistrations: { 'player-owen': 'open' },
    yardageOrFormat: '36-Hole Major Championship',
    notes: 'Celebrating 30 years of the Players Championship. CONFLICT: Family PR trip Nov 22-26.',
    season: 'Fall',
    isMajor: true
  },
  {
    id: 'scjga-2026-11-21-ccsc',
    name: 'CCSC One Day',
    tour: 'SCJGA',
    tourSeries: 'One-Day Series',
    courseId: 'cc-south-carolina',
    course: COURSES['cc-south-carolina'],
    startDate: '2026-11-21',
    endDate: '2026-11-21',
    duration: '1-Day',
    registrationOpenDate: '2026-10-10',
    registrationDeadline: '2026-11-07',
    registrationUrl: 'https://scjga.bluegolf.com/bluegolf/scjga26/event/scjga26118/index.htm',
    playerRegistrations: { 'player-owen': 'open' },
    yardageOrFormat: '18-Hole Stroke Play (Florence)',
    season: 'Fall'
  },
  {
    id: 'scjga-2026-11-21-22-diamondback',
    name: 'Players Series @ Diamondback Golf Club',
    tour: 'SCJGA',
    tourSeries: 'Players Series',
    courseId: 'diamondback',
    course: COURSES['diamondback'],
    startDate: '2026-11-21',
    endDate: '2026-11-22',
    duration: '2-Day',
    registrationOpenDate: '2026-09-28',
    registrationDeadline: '2026-11-13',
    registrationUrl: 'https://scjga.bluegolf.com/bluegolf/scjga26/event/scjga26111/index.htm',
    playerRegistrations: { 'player-owen': 'open' },
    yardageOrFormat: '36-Hole Stroke Play',
    notes: 'Loris SC.',
    season: 'Fall',
    isMajor: true
  },

  // =========================================================================
  // 3. HJGT TOURNAMENT
  // =========================================================================
  {
    id: 'hjgt-2026-11-14-15-unc-finley',
    name: 'HJGT College Prep @ UNC Finley',
    tour: 'OTHER',
    tourSeries: 'HJGT',
    courseId: 'unc-finley',
    course: COURSES['unc-finley'],
    startDate: '2026-11-14',
    endDate: '2026-11-15',
    duration: '2-Day',
    playerRegistrations: { 'player-owen': 'skipped' },
    yardageOrFormat: 'College Prep - 36 Holes',
    notes: 'Skipped - conflicts with Southern Oaks Players Series. Chapel Hill NC.',
    season: 'Fall'
  },

  // =========================================================================
  // 4. DECEMBER SCJGA TOURNAMENTS
  // =========================================================================
  {
    id: 'scjga-2026-12-05-06-hootie-all-stars',
    name: 'Cuthbert-Todd (Hootie) All Stars Championship',
    tour: 'SCJGA',
    tourSeries: 'Major Championship',
    courseId: 'palmetto-dunes-arthur-hills',
    course: COURSES['palmetto-dunes-arthur-hills'],
    startDate: '2026-12-05',
    endDate: '2026-12-06',
    duration: '2-Day',
    entryFee: 180,
    registrationOpenDate: '2026-10-01',
    registrationDeadline: '2026-11-23',
    registrationUrl: 'https://scjga.bluegolf.com/bluegolf/scjga26/event/scjga26123/index.htm',
    playerRegistrations: { 'player-owen': 'contingent' },
    yardageOrFormat: '18-holer boys/girls divisions',
    notes: 'Registered, approval pending. Acceptance is by Hootie ranking after the deadline. Palmetto Dunes Arthur Hills Course, Hilton Head Island.',
    season: 'Winter',
    isMajor: true
  },
  {
    id: 'scjga-2026-12-12-13-rose-hill',
    name: 'Players Series @ Rose Hill',
    tour: 'SCJGA',
    tourSeries: 'Players Series',
    courseId: 'rose-hill',
    course: COURSES['rose-hill'],
    startDate: '2026-12-12',
    endDate: '2026-12-13',
    duration: '2-Day',
    entryFee: 180,
    registrationOpenDate: '2026-10-13',
    registrationDeadline: '2026-11-23',
    registrationUrl: 'https://scjga.bluegolf.com/bluegolf/scjga26/event/scjga269/index.htm',
    playerRegistrations: { 'player-owen': 'contingent' },
    yardageOrFormat: '36-Hole Stroke Play - Boys 13-18',
    notes: 'Registered, approval pending. Field 84. Bluffton SC.',
    season: 'Winter',
    isMajor: true
  },
  {
    id: 'scjga-2026-12-21-22-ford-picard',
    name: '33rd Ford-Picard Christmas Classic',
    tour: 'SCJGA',
    tourSeries: 'Major Championship',
    courseId: 'wild-dunes',
    course: COURSES['wild-dunes'],
    startDate: '2026-12-21',
    endDate: '2026-12-22',
    duration: '2-Day',
    entryFee: 400,
    registrationOpenDate: '2026-10-19',
    registrationDeadline: '2026-12-02',
    registrationUrl: 'https://scjga.bluegolf.com/bluegolf/scjga26/event/scjga2629/index.htm',
    playerRegistrations: { 'player-owen': 'considering' },
    yardageOrFormat: 'Team event day 1 (two-person captain\'s choice), individual stroke play day 2',
    notes: 'Likely skip. Team fee $400, field 56 teams. Wild Dunes GC, Isle of Palms.',
    season: 'Winter',
    isMajor: true
  },
  {
    id: 'uskg-2026-12-22-westcott',
    name: 'U.S. Kids Golf - Westcott Plantation',
    tour: 'USKG',
    tourSeries: 'Charleston Winter Local Tour',
    courseId: 'westcott-plantation',
    course: COURSES['westcott-plantation'],
    startDate: '2026-12-22',
    endDate: '2026-12-22',
    duration: '1-Day',
    registrationUrl: 'https://tournaments.uskidsgolf.com/tournaments/local/find-local-tour/470090/charleston',
    playerRegistrations: {
      'player-owen': 'considering',
    },
    yardageOrFormat: 'TENTATIVE - Age Group Yardages',
    notes: 'TENTATIVE schedule per USKG. Signup dates TBA.',
    season: 'Winter',
    isTourChampionship: false
  },
  {
    id: 'scjga-2027-01-17-18-bobby-d',
    name: 'Bobby D. Junior Classic',
    tour: 'SCJGA',
    tourSeries: 'Major Championship',
    courseId: 'crowfield',
    course: COURSES['crowfield'],
    startDate: '2027-01-17',
    endDate: '2027-01-18',
    duration: '2-Day',
    entryFee: 225,
    registrationOpenDate: '2026-11-23',
    registrationDeadline: '2027-01-04',
    registrationUrl: 'https://scjga.bluegolf.com/bluegolf/scjga27/event/scjga275/index.htm',
    playerRegistrations: { 'player-owen': 'planned' },
    yardageOrFormat: '36-Hole Championship - Ages 13-19',
    notes: 'Trying to register; signup opens Nov 23 5 PM ET. Exemptions plus HCF December update fill the field. Crowfield GC, Goose Creek.',
    season: 'Winter',
    isMajor: true
  },

  // =========================================================================
  // 5. FALL 2027 SCJGA TOURNAMENTS
  // =========================================================================
  {
    id: 'scjga-2027-09-11-12-orange-jacket',
    name: '19th Harvey Brock Orange Jacket Classic',
    tour: 'SCJGA',
    tourSeries: 'Major Championship',
    courseId: 'boscobel',
    course: COURSES['boscobel'],
    startDate: '2027-09-11',
    endDate: '2027-09-12',
    duration: '2-Day',
    entryFee: 200,
    registrationOpenDate: '2027-07-16',
    registrationDeadline: '2027-08-23',
    registrationUrl: 'https://scjga.bluegolf.com/bluegolf/scjga27/event/scjga2723/index.htm',
    playerRegistrations: { 'player-owen': 'considering' },
    yardageOrFormat: '36-Hole Major Championship',
    notes: 'Boscobel G&CC, Pendleton SC.',
    season: 'Fall',
    isMajor: true
  },
  {
    id: 'scjga-2027-11-05-fall-qualifier',
    name: 'Fall Challenge Qualifier',
    tour: 'SCJGA',
    tourSeries: 'One-Day Series',
    courseId: 'cheraw-state-park',
    course: COURSES['cheraw-state-park'],
    startDate: '2027-11-05',
    endDate: '2027-11-05',
    duration: '1-Day',
    entryFee: 50,
    registrationOpenDate: '2027-09-03',
    registrationDeadline: '2027-10-18',
    registrationUrl: 'https://scjga.bluegolf.com/bluegolf/scjga27/event/scjga2728/index.htm',
    playerRegistrations: { 'player-owen': 'considering' },
    yardageOrFormat: 'Qualifier - Boys',
    notes: 'First 45 entrants.',
    season: 'Fall'
  },
  {
    id: 'scjga-2027-11-06-07-cheraw-challenge',
    name: '32nd Cheraw Fall Challenge - Boys',
    tour: 'SCJGA',
    tourSeries: 'Major Championship',
    courseId: 'cheraw-state-park',
    course: COURSES['cheraw-state-park'],
    startDate: '2027-11-06',
    endDate: '2027-11-07',
    duration: '2-Day',
    entryFee: 200,
    registrationOpenDate: '2027-09-03',
    registrationDeadline: '2027-10-18',
    registrationUrl: 'https://scjga.bluegolf.com/bluegolf/scjga27/event/scjga2729/index.htm',
    playerRegistrations: { 'player-owen': 'considering' },
    yardageOrFormat: '36-Hole Fall Challenge',
    season: 'Fall',
    isMajor: true
  },
  {
    id: 'scjga-2027-11-13-14-southern-oaks',
    name: 'Players Series @ Southern Oaks',
    tour: 'SCJGA',
    tourSeries: 'Players Series',
    courseId: 'southern-oaks',
    course: COURSES['southern-oaks'],
    startDate: '2027-11-13',
    endDate: '2027-11-14',
    duration: '2-Day',
    entryFee: 180,
    registrationOpenDate: '2027-09-17',
    registrationDeadline: '2027-11-01',
    registrationUrl: 'https://scjga.bluegolf.com/bluegolf/scjga27/event/scjga2717/index.htm',
    playerRegistrations: { 'player-owen': 'considering' },
    yardageOrFormat: '36-Hole Stroke Play',
    notes: 'Field 84. Easley SC.',
    season: 'Fall',
    isMajor: true
  }
];
