/* Run with:  node tests.js   (or open tests.html in a browser) */
(function (root) {
  const HM = root.HM || require('./core.js');
  let pass = 0, fail = 0; const out = [];
  const eq = (name, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want); ok ? pass++ : fail++; out.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  (got ${JSON.stringify(got)}, wanted ${JSON.stringify(want)})`}`); };

  eq('sleep 22:00 -> 06:30 = 510 min', HM.sleepMinutes('22:00', '06:30'), 510);
  eq('sleep crossing midnight 23:45 -> 00:15 = 30 min', HM.sleepMinutes('23:45', '00:15'), 30);
  eq('sleep same day 01:00 -> 07:00 = 360', HM.sleepMinutes('01:00', '07:00'), 360);
  eq('identical times are invalid', HM.sleepMinutes('08:00', '08:00'), null);
  eq('bad time is invalid', HM.sleepMinutes('25:00', '06:00'), null);
  eq('crossesMidnight true', HM.crossesMidnight('22:00', '06:00'), true);
  eq('crossesMidnight false', HM.crossesMidnight('01:00', '06:00'), false);
  eq('fmtDur 510', HM.fmtDur(510), '8 h 30 min');
  eq('fmtDur 480', HM.fmtDur(480), '8 h');
  eq('fmtDur 45', HM.fmtDur(45), '45 min');
  eq('avg ignores nulls', HM.avg([1000, null, 2000]), 1500);
  eq('avg of nothing is null (no invented data)', HM.avg([null, null]), null);
  eq('pct clamps at 100', HM.pct(3000, 1500), 100);
  eq('pct normal', HM.pct(750, 1500), 50);
  eq('pct with zero goal', HM.pct(5, 0), 0);
  eq('addDays across month end', HM.addDays('2026-10-31', 1), '2026-11-01');
  eq('addDays across year end', HM.addDays('2026-12-31', 1), '2027-01-01');
  eq('validKey rejects 2026-02-30', HM.validKey('2026-02-30'), false);
  eq('validKey accepts leap day', HM.validKey('2028-02-29'), true);
  eq('rangeKeys inclusive', HM.rangeKeys('2026-10-10', '2026-10-12'), ['2026-10-10', '2026-10-11', '2026-10-12']);
  eq('rangeKeys reversed is empty', HM.rangeKeys('2026-10-12', '2026-10-10'), []);
  eq('streak current (today logged)', HM.streaks(new Set(['2026-10-10', '2026-10-11', '2026-10-12']), '2026-10-12'), { current: 3, longest: 3 });
  eq('streak stays alive if only yesterday logged', HM.streaks(new Set(['2026-10-10', '2026-10-11']), '2026-10-12'), { current: 2, longest: 2 });
  eq('streak broken by a gap', HM.streaks(new Set(['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-10']), '2026-10-12'), { current: 0, longest: 3 });
  eq('streak empty', HM.streaks(new Set(), '2026-10-12'), { current: 0, longest: 0 });
  eq('esc blocks HTML', HM.esc('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
  eq('csv defuses formulas', HM.csvCell('=SUM(A1)'), "'=SUM(A1)");
  eq('csv quotes commas and quotes', HM.csvCell('a,"b"'), '"a,""b"""');
  const rec = { '2026-10-12': { date: '2026-10-12', waterEntries: [{ id: 'a', ml: 250, createdAt: 0 }], sleepEntries: [], activityEntries: [{ id: 'b', type: 'walking', minutes: 30, notes: 'with dog', createdAt: 0 }], habitsCompleted: ['breakfast'], moodEntries: [], fruitVeg: 2 } };
  eq('csv row count (header + water + activity + habit + fruit_veg)', HM.toCSV(rec).split('\r\n').length, 5);

  out.push(`\n${pass} passed, ${fail} failed`);
  if (typeof document !== 'undefined') { const pre = document.createElement('pre'); pre.textContent = out.join('\n'); document.body.appendChild(pre); }
  else { console.log(out.join('\n')); if (fail) process.exit(1); }
})(typeof window !== 'undefined' ? window : globalThis);
