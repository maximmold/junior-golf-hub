import { Tournament, Player } from '../types/tournament';

/**
 * Formats a Date to iCal timestamp format: YYYYMMDDTHHmmssZ
 */
function formatICalDate(dateStr: string, isAllDay: boolean = true): string {
  const clean = dateStr.replace(/-/g, '');
  if (isAllDay) {
    return clean;
  }
  return `${clean}T120000Z`;
}

/**
 * Generate .ics calendar content for a single or multiple tournaments
 */
export function generateICalendar(
  tournaments: Tournament[],
  players: Player[]
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Charleston Junior Golf Hub//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Junior Golf Tournaments',
    'X-WR-TIMEZONE:America/New_York',
  ];

  tournaments.forEach((t) => {
    // Find registered, contingent, and considering players
    const registeredPlayers = players
      .filter((p) => t.playerRegistrations[p.id] === 'registered')
      .map((p) => p.name);

    const contingentPlayers = players
      .filter((p) => t.playerRegistrations[p.id] === 'contingent')
      .map((p) => p.name);

    const consideringPlayers = players
      .filter((p) => t.playerRegistrations[p.id] === 'considering')
      .map((p) => p.name);

    let summary = `⛳ ${t.name}`;
    if (registeredPlayers.length > 0) {
      summary = `⛳ [Registered: ${registeredPlayers.join(', ')}] ${t.name}`;
    } else if (contingentPlayers.length > 0) {
      summary = `⛳ [Contingent: ${contingentPlayers.join(', ')}] ${t.name}`;
    } else if (consideringPlayers.length > 0) {
      summary = `⛳ [Considering: ${consideringPlayers.join(', ')}] ${t.name}`;
    }

    const location = `${t.course.name}, ${t.course.address}, ${t.course.city}, ${t.course.state} ${t.course.zip}`;
    const dtStart = formatICalDate(t.startDate);
    
    // For iCal multi-day all-day events, DTEND is exclusive (day after)
    const endDateObj = new Date(t.endDate);
    endDateObj.setDate(endDateObj.getDate() + 1);
    const dtEnd = endDateObj.toISOString().split('T')[0].replace(/-/g, '');

    const description = [
      `Tour: ${t.tour === 'USKG' ? 'U.S. Kids Golf (Charleston Local Tour)' : 'SCJGA'}`,
      `Duration: ${t.duration}`,
      `Course: ${t.course.name} (${t.course.city}, SC)`,
      t.entryFee ? `Entry Fee: $${t.entryFee}` : '',
      t.yardageOrFormat ? `Format: ${t.yardageOrFormat}` : '',
      t.notes ? `Notes: ${t.notes}` : '',
      t.registrationUrl ? `Registration: ${t.registrationUrl}` : '',
    ].filter(Boolean).join('\\n');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:golf-tournament-${t.id}@charlestonjuniorgolf.com`);
    lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
    lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
    lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
    lines.push(`SUMMARY:${summary}`);
    lines.push(`LOCATION:${location}`);
    lines.push(`DESCRIPTION:${description}`);
    if (t.registrationUrl) {
      lines.push(`URL:${t.registrationUrl}`);
    }
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Triggers file download in browser
 */
export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
