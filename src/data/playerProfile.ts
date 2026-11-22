/**
 * Owen Moldenhauer's Golf Profile & Accomplishments
 * Static data for profile page display
 */

export interface ProfileHeader {
  name: string;
  location: string;
  school: string;
  classYear: string;
  handicapIndex: string;
  handicapAsOf: string;
}

export interface Honor {
  id: string;
  title: string;
  details?: string;
}

export interface TopFinish {
  id: string;
  placement: string;
  event: string;
  date: string;
  score: string;
  note?: string;
}

export interface TournamentResult {
  id: string;
  event: string;
  date: string;
  finish: string;
  score: string;
}

export interface StatsCard {
  bestRounds: number[];
  hcfRanking: string;
  scoringAverage: string;
  eventsPlayed: number;
}

export const PROFILE_HEADER: ProfileHeader = {
  name: 'Owen Moldenhauer',
  location: 'Mt. Pleasant, SC',
  school: 'Wando High School',
  classYear: 'Class of 2030',
  handicapIndex: '1.1',
  handicapAsOf: 'Oct 2026'
};

export const HONORS: Honor[] = [
  {
    id: 'all-region-2026',
    title: '2026 Class 5A Region 7 All-Region Team',
    details: 'Wando High School'
  },
  {
    id: 'varsity-8th-grade',
    title: 'Varsity as an 8th grader (spring 2026)',
    details: 'SCHSL 5A-D1 State Championship at Shaftesbury Glen, T36, 77-81=158; Wando finished 6th as a team'
  },
  {
    id: 'op36-level5',
    title: 'Operation 36: passed Level 5 by shooting 36',
    details: 'Apr 4, 2025'
  },
  {
    id: 'op36-graduated',
    title: 'Operation 36: passed Level 6 and graduated the program',
    details: 'Oct 2025'
  },
  {
    id: 'uskg-fall-2026',
    title: 'US Kids Golf Charleston Local Tour Fall 2026 Boys 13-14',
    details: '2nd in season standings, Level 7 Priority Status (valid Mar 2027-Feb 2028)'
  },
  {
    id: 'uskg-fall-2025',
    title: 'US Kids Golf Charleston Local Tour Fall 2025',
    details: '3rd, Level 6'
  }
];

export const TOP_FINISHES: TopFinish[] = [
  {
    id: 'lake-city',
    placement: '3rd',
    event: 'SCJGA Lake City One Day',
    date: 'Jun 1, 2026',
    score: '71',
    note: 'best round'
  },
  {
    id: 'myrtle-beach',
    placement: '3rd',
    event: 'SCJGA Myrtle Beach National One Day',
    date: 'Jun 15, 2026',
    score: '73'
  },
  {
    id: 'santee-aug',
    placement: 'T9',
    event: 'SCJGA Santee One Day',
    date: 'Aug 8, 2026',
    score: '75'
  },
  {
    id: 'edgewater',
    placement: '11th',
    event: 'SCJGA Edgewater One Day',
    date: 'Nov 8, 2026',
    score: '77'
  }
];

export const SCJGA_2026_RESULTS: TournamentResult[] = [
  {
    id: 'edgewater-nov',
    event: 'Edgewater One Day',
    date: 'Nov 8',
    finish: '11th',
    score: '77'
  },
  {
    id: 'timberlake',
    event: 'Timberlake',
    date: 'Oct 3-4',
    finish: 'T34',
    score: '80-81=161'
  },
  {
    id: 'darlington',
    event: 'Darlington Players Series',
    date: 'Sep 19-20',
    finish: 'T28',
    score: '79-79=158'
  },
  {
    id: 'santee-aug',
    event: 'Santee One Day',
    date: 'Aug 8',
    finish: 'T9',
    score: '75'
  },
  {
    id: 'berkeley',
    event: 'Berkeley',
    date: 'Jul 13',
    finish: 'T16',
    score: '78'
  },
  {
    id: 'myrtle-beach',
    event: 'Myrtle Beach National',
    date: 'Jun 15',
    finish: '3rd',
    score: '73'
  },
  {
    id: 'scga-qualifier',
    event: 'SCGA Junior Championship Qualifier #2 (Santee National)',
    date: 'Jun 8',
    finish: 'T13',
    score: '75'
  },
  {
    id: 'lake-city',
    event: 'Lake City',
    date: 'Jun 1',
    finish: '3rd',
    score: '71'
  },
  {
    id: 'carolina-springs',
    event: 'Carolina Springs',
    date: 'Mar 8',
    finish: 'T17',
    score: '79'
  }
];

export const WANDO_HS_2026_RESULTS: TournamentResult[] = [
  {
    id: 'patriot',
    event: 'Patriot Invitational',
    date: 'Spring 2026',
    finish: 'T33',
    score: '81'
  },
  {
    id: 'swampfox',
    event: 'Swampfox',
    date: 'Spring 2026',
    finish: 'T19',
    score: '81'
  },
  {
    id: 'state-championship',
    event: 'SCHSL 5A-D1 State Championship',
    date: 'Spring 2026',
    finish: 'T36',
    score: '77-81'
  }
];

export const STATS: StatsCard = {
  bestRounds: [71, 73, 75, 75],
  hcfRanking: '225th',
  scoringAverage: '80.33',
  eventsPlayed: 20
};

export const SOURCES_NOTE = 'Sources: SCJGA results, US Kids Golf, SCHSL, Operation 36';
