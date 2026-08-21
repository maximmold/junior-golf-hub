import { Tournament, Course, RegistrationStatus, TourType, EventDuration, Player } from '../types/tournament';
import { COURSES } from '../data/courses';

export interface IngestResult {
  success: boolean;
  importedTournaments: Tournament[];
  updatedCount: number;
  addedCount: number;
  errors: string[];
  warnings: string[];
}

/**
 * Match a course name from free text against known courses database
 */
export function findMatchingCourse(query: string): Course {
  const q = query.toLowerCase().trim();
  
  // Direct ID match
  if (COURSES[q]) return COURSES[q];

  // Search by name keywords
  for (const course of Object.values(COURSES)) {
    const cName = course.name.toLowerCase();
    if (cName.includes(q) || q.includes(course.city.toLowerCase()) || q.includes(course.id)) {
      return course;
    }
  }

  // Fallback default (Charleston Muni)
  return {
    id: `custom-course-${Date.now()}`,
    name: query || 'Custom Golf Course',
    address: 'Charleston, SC',
    city: 'Charleston',
    state: 'SC',
    zip: '29401',
    lat: 32.7765,
    lng: -79.9311,
    facilityType: 'Public'
  };
}

/**
 * Parses raw CSV text into tournament objects and updates player registrations
 */
export function parseCSV(
  csvText: string,
  existingTournaments: Tournament[],
  players: Player[]
): IngestResult {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (lines.length < 2) {
    return {
      success: false,
      importedTournaments: existingTournaments,
      updatedCount: 0,
      addedCount: 0,
      errors: ['File is empty or missing headers.'],
      warnings: []
    };
  }

  // Helper to split CSV row handling quoted commas
  const parseRow = (row: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ''));
    return result;
  };

  const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  
  // Identify column indices
  const getCol = (possibleNames: string[]) => {
    return headers.findIndex(h => possibleNames.some(p => h.includes(p)));
  };

  const nameIdx = getCol(['name', 'tournament', 'event', 'title']);
  const courseIdx = getCol(['course', 'venue', 'club', 'location']);
  const startIdx = getCol(['start', 'date', 'tournamentdate']);
  const endIdx = getCol(['end', 'enddate']);
  const tourIdx = getCol(['tour', 'organization', 'org', 'league']);
  const durationIdx = getCol(['duration', 'days', 'type', 'format']);
  const statusIdx = getCol(['status', 'registration', 'signedup', 'registered']);
  const playerIdx = getCol(['player', 'golfer', 'child', 'name']);
  const feeIdx = getCol(['fee', 'cost', 'price', 'entry']);
  const notesIdx = getCol(['note', 'notes', 'comment', 'description']);

  if (nameIdx === -1 && courseIdx === -1 && startIdx === -1) {
    return {
      success: false,
      importedTournaments: existingTournaments,
      updatedCount: 0,
      addedCount: 0,
      errors: ['Could not detect Tournament Name, Course, or Date columns in CSV header.'],
      warnings: []
    };
  }

  const defaultPlayerId = players.find(p => p.isDefault)?.id || players[0]?.id || 'p1';
  const tournamentsMap = new Map<string, Tournament>();
  
  // Seed with existing
  existingTournaments.forEach(t => tournamentsMap.set(t.id, { ...t, playerRegistrations: { ...t.playerRegistrations } }));

  let addedCount = 0;
  let updatedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    if (row.length === 0 || (row.length === 1 && !row[0])) continue;

    const rawName = nameIdx !== -1 ? row[nameIdx] : '';
    const rawCourse = courseIdx !== -1 ? row[courseIdx] : '';
    const rawDate = startIdx !== -1 ? row[startIdx] : '';
    const rawEndDate = endIdx !== -1 ? row[endIdx] : rawDate;
    const rawTour = tourIdx !== -1 ? row[tourIdx]?.toUpperCase() : '';
    const rawDuration = durationIdx !== -1 ? row[durationIdx] : '';
    const rawStatus = statusIdx !== -1 ? row[statusIdx]?.toLowerCase() : 'registered';
    const rawPlayerName = playerIdx !== -1 ? row[playerIdx] : '';
    const rawFee = feeIdx !== -1 ? parseFloat(row[feeIdx].replace(/[^0-9.]/g, '')) : undefined;
    const rawNotes = notesIdx !== -1 ? row[notesIdx] : '';

    if (!rawName && !rawCourse) {
      warnings.push(`Row ${i + 1} skipped: Missing both tournament name and course.`);
      continue;
    }

    // Determine tour
    let tour: TourType = 'USKG';
    if (rawTour.includes('SCJGA') || rawName.toUpperCase().includes('SCJGA')) {
      tour = 'SCJGA';
    } else if (rawTour.includes('USK') || rawName.toUpperCase().includes('U.S. KIDS') || rawName.toUpperCase().includes('US KIDS')) {
      tour = 'USKG';
    } else if (rawTour.includes('OTHER')) {
      tour = 'OTHER';
    }

    // Determine duration
    let duration: EventDuration = '1-Day';
    if (rawDuration.includes('2') || rawDuration.toLowerCase().includes('two') || (rawDate && rawEndDate && rawDate !== rawEndDate)) {
      duration = '2-Day';
    }

    // Determine normalized status
    let status: RegistrationStatus = 'registered';
    if (rawStatus.includes('conting') || rawStatus.includes('tentat') || rawStatus.includes('tbd') || rawStatus.includes('qualif')) {
      status = 'contingent';
    } else if (rawStatus.includes('consid') || rawStatus.includes('maybe') || rawStatus.includes('plan')) {
      status = 'considering';
    } else if (rawStatus.includes('wait')) {
      status = 'waitlist';
    } else if (rawStatus.includes('not') || rawStatus.includes('no') || rawStatus.includes('unreg')) {
      status = 'not_registered';
    } else if (rawStatus.includes('open')) {
      status = 'open';
    } else if (rawStatus.includes('reg') || rawStatus.includes('yes') || rawStatus.includes('signed') || rawStatus === '1' || rawStatus === 'true') {
      status = 'registered';
    }

    // Find targeted player
    let targetPlayerId = defaultPlayerId;
    if (rawPlayerName) {
      const match = players.find(p => p.name.toLowerCase().includes(rawPlayerName.toLowerCase()));
      if (match) targetPlayerId = match.id;
    }

    // Match or create course
    const course = findMatchingCourse(rawCourse || rawName);

    // Format valid date (YYYY-MM-DD)
    let formattedStartDate = rawDate;
    if (rawDate && !/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      const parsedDate = new Date(rawDate);
      if (!isNaN(parsedDate.getTime())) {
        formattedStartDate = parsedDate.toISOString().split('T')[0];
      } else {
        formattedStartDate = new Date().toISOString().split('T')[0];
      }
    }
    if (!formattedStartDate) {
      formattedStartDate = new Date().toISOString().split('T')[0];
    }

    let formattedEndDate = rawEndDate || formattedStartDate;
    if (formattedEndDate && !/^\d{4}-\d{2}-\d{2}$/.test(formattedEndDate)) {
      const parsedEnd = new Date(formattedEndDate);
      if (!isNaN(parsedEnd.getTime())) {
        formattedEndDate = parsedEnd.toISOString().split('T')[0];
      } else {
        formattedEndDate = formattedStartDate;
      }
    }

    // Check if tournament already exists by date & course or name
    let existingMatch: Tournament | undefined;
    for (const t of tournamentsMap.values()) {
      if (
        (t.startDate === formattedStartDate && (t.courseId === course.id || t.name.toLowerCase() === rawName.toLowerCase())) ||
        (rawName && t.name.toLowerCase() === rawName.toLowerCase() && t.startDate === formattedStartDate)
      ) {
        existingMatch = t;
        break;
      }
    }

    if (existingMatch) {
      // Update registration status
      existingMatch.playerRegistrations[targetPlayerId] = status;
      if (rawNotes) existingMatch.notes = rawNotes;
      if (rawFee) existingMatch.entryFee = rawFee;
      updatedCount++;
    } else {
      // Create new tournament
      const newId = `imported-${Date.now()}-${i}`;
      const newTournament: Tournament = {
        id: newId,
        name: rawName || `${tour === 'USKG' ? 'U.S. Kids Golf' : 'SCJGA'} Event at ${course.name}`,
        tour,
        tourSeries: tour === 'USKG' ? 'Charleston Local Tour' : duration === '2-Day' ? 'Players Series' : 'One-Day Series',
        courseId: course.id,
        course,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        duration,
        entryFee: rawFee || (duration === '2-Day' ? 140 : 65),
        playerRegistrations: {
          [targetPlayerId]: status,
        },
        notes: rawNotes,
      };
      tournamentsMap.set(newId, newTournament);
      addedCount++;
    }
  }

  return {
    success: true,
    importedTournaments: Array.from(tournamentsMap.values()),
    updatedCount,
    addedCount,
    errors: [],
    warnings
  };
}

/**
 * Parses JSON format
 */
export function parseJSON(
  jsonText: string,
  existingTournaments: Tournament[],
  _players: Player[]
): IngestResult {
  try {
    const parsed = JSON.parse(jsonText);
    const items = Array.isArray(parsed) ? parsed : parsed.tournaments || [parsed];
    
    const tournamentsMap = new Map<string, Tournament>();
    existingTournaments.forEach(t => tournamentsMap.set(t.id, { ...t, playerRegistrations: { ...t.playerRegistrations } }));

    let addedCount = 0;
    let updatedCount = 0;

    for (const item of items) {
      if (!item.name && !item.course) continue;
      
      const course = typeof item.course === 'object' ? item.course : findMatchingCourse(item.course || item.name);
      const id = item.id || `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      
      const tournament: Tournament = {
        id,
        name: item.name,
        tour: item.tour || 'USKG',
        tourSeries: item.tourSeries || 'Charleston Local Tour',
        courseId: course.id,
        course,
        startDate: item.startDate || new Date().toISOString().split('T')[0],
        endDate: item.endDate || item.startDate || new Date().toISOString().split('T')[0],
        duration: item.duration || (item.startDate !== item.endDate ? '2-Day' : '1-Day'),
        entryFee: item.entryFee,
        registrationUrl: item.registrationUrl,
        playerRegistrations: item.playerRegistrations || { 'p1': 'registered' },
        notes: item.notes,
        isMajor: item.isMajor,
        isTourChampionship: item.isTourChampionship,
        season: item.season
      };

      if (tournamentsMap.has(id)) {
        tournamentsMap.set(id, { ...tournamentsMap.get(id)!, ...tournament });
        updatedCount++;
      } else {
        tournamentsMap.set(id, tournament);
        addedCount++;
      }
    }

    return {
      success: true,
      importedTournaments: Array.from(tournamentsMap.values()),
      updatedCount,
      addedCount,
      errors: [],
      warnings: []
    };
  } catch (err: any) {
    return {
      success: false,
      importedTournaments: existingTournaments,
      updatedCount: 0,
      addedCount: 0,
      errors: [`Invalid JSON format: ${err.message}`],
      warnings: []
    };
  }
}

/**
 * Generate a ready-to-use CSV template string for download
 */
export function generateSampleCSV(players: Player[]): string {
  const p1 = players[0]?.name || 'Leo Moldenhauer';
  return `Tournament Name,Tour,Course,Start Date,End Date,Duration,Registration Status,Player Name,Entry Fee,Notes
"U.S. Kids Golf Charleston Fall Opener",USKG,"Charleston Municipal Golf Course",2026-08-23,2026-08-23,1-Day,registered,"${p1}",65,"Tee times start at 1:00 PM"
"SCJGA Lowcountry One-Day Series",SCJGA,"The Links at Stono Ferry",2026-08-29,2026-08-29,1-Day,registered,"${p1}",55,"SCJGA points event"
"U.S. Kids Golf Event #2 - Berkeley",USKG,"Berkeley Country Club",2026-09-06,2026-09-06,1-Day,registered,"${p1}",65,"Age group yardages"
"SCJGA Mid-State 2-Day Junior Classic",SCJGA,"Columbia Country Club",2026-09-12,2026-09-13,2-Day,considering,"${p1}",140,"36-Hole Major ranking event"
"U.S. Kids Golf Tour Championship",USKG,"Crowfield Golf Club",2026-11-14,2026-11-15,2-Day,registered,"${p1}",135,"Double Priority Status Points"
`;
}
