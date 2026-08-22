import fs from 'fs';
import https from 'https';

const SCJGA_SCHEDULE_URL = 'https://scjga.bluegolf.com/bluegolf/scjga26/schedule/upcoming.htm?display=champ';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

export async function scrapeSCJGASchedule(url = SCJGA_SCHEDULE_URL) {
  console.log(`🌐 Fetching SCJGA schedule from: ${url}`);
  const html = await fetchUrl(url);

  const tournaments = [];
  // Regex to match register links and their rich data attributes
  const regLinkRegex = /<a[^>]*class="[^"]*bg-register-link[^"]*"[^>]*data-handle="([^"]*)"[^>]*data-ename="([^"]*)"[^>]*data-date="([^"]*)"[^>]*data-regend="([^"]*)"[^>]*data-regstartdt="([^"]*)"[^>]*data-regenddt="([^"]*)"[^>]*data-regendformat="([^"]*)"[^>]*data-regfee="([^"]*)"[^>]*data-course="([^"]*)"[^>]*data-eurl="([^"]*)"/g;

  let match;
  while ((match = regLinkRegex.exec(html)) !== null) {
    const [
      _,
      handle,
      name,
      date,
      regEndIso,
      regStartRaw,
      regEndRaw,
      regEndFormatted,
      entryFee,
      course,
      eventUrl
    ] = match;

    tournaments.push({
      handle,
      name: name.replace(/&amp;/g, '&'),
      course: course.replace(/&amp;/g, '&'),
      eventDate: date,
      registrationDeadline: regEndIso, // YYYY-MM-DD
      registrationOpens: regStartRaw,
      registrationClosesExact: regEndRaw,
      registrationDeadlineFormatted: regEndFormatted,
      entryFee: entryFee.replace('$', ''),
      eventUrl
    });
  }

  // Also match rows that might not have a register button yet (info only)
  const infoRowRegex = /<tr class="vevent"[^>]*id="([^"]*)"[\s\S]*?<td class="dtstart[^"]*"><span>([^<]*)<\/span>[\s\S]*?<span class="summary font-weight-bold"><a href="([^"]*)"[^>]*>([^<]*)<\/a><\/span>[\s\S]*?View ([^<]*) Profile/g;
  
  let infoMatch;
  while ((infoMatch = infoRowRegex.exec(html)) !== null) {
    const [_, id, date, eventUrl, name, course] = infoMatch;
    const existing = tournaments.find((t) => t.name.toLowerCase() === name.trim().toLowerCase());
    if (!existing) {
      tournaments.push({
        handle: id,
        name: name.trim(),
        course: course.trim(),
        eventDate: date.trim(),
        registrationDeadline: null,
        entryFee: null,
        eventUrl: `https://scjga.bluegolf.com${eventUrl}`
      });
    }
  }

  console.log(`✅ Successfully extracted ${tournaments.length} SCJGA tournaments with deadlines.`);
  return tournaments;
}

// Run standalone if executed directly
if (process.argv[1]?.endsWith('scrape-scjga.js')) {
  scrapeSCJGASchedule().then((results) => {
    console.log('\n--- EXTRACTED TOURNAMENTS & REGISTRATION DEADLINES ---');
    console.table(results.map(t => ({
      Name: t.name.substring(0, 35),
      Date: t.eventDate,
      Course: t.course.substring(0, 25),
      'Registration Deadline': t.registrationDeadline || 'TBD',
      'Entry Fee': t.entryFee ? `$${t.entryFee}` : 'TBD'
    })));
  });
}
