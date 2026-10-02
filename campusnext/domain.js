// Pure domain rules shared by the UI and the browser test harness.
export const DEMO_DAY = '2026-10-03';
export function availablePerk(perk) {
  return perk?.status === 'Provided' && perk.verified === true &&
    ['Available', 'Unknown'].includes(perk.availability) && perk.type !== 'Competition prize';
}
export function filterOpportunities(events, filters, saved = []) {
  return events.filter(e => e.published &&
    (!filters.saved || saved.includes(e.id)) &&
    (!filters.query || `${e.title} ${e.shortTitle} ${e.club} ${e.category}`.toLowerCase().includes(filters.query.toLowerCase())) &&
    (!filters.category || filters.category === 'All opportunities' || e.category === filters.category) &&
    (!filters.food || availablePerk(e.food)) && (!filters.goodies || availablePerk(e.goodies)));
}
export function addCredit(credits, task, day = DEMO_DAY) {
  if (!task.qualifying || task.status !== 'completed' || credits.some(c => c.taskId === task.id)) return credits;
  return [...credits, {taskId: task.id, day}];
}
export function streakSummary(credits, through = DEMO_DAY) {
  const days = new Set(credits.map(c => c.day).filter(d => d <= through));
  const ordered = [...days].sort();
  if (!ordered.length) return {current: 0, longest: 0, freeze: 1, frozen: [], credited: false};
  let current = 0, longest = 0, freeze = 1, lastWeek = '', frozen = [];
  const date = new Date(ordered[0] + 'T12:00:00Z');
  while (date.toISOString().slice(0, 10) <= through) {
    const key = date.toISOString().slice(0, 10);
    const monday = new Date(date);
    monday.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
    const week = monday.toISOString().slice(0, 10);
    if (week !== lastWeek) { freeze = 1; lastWeek = week; }
    if (days.has(key)) { current++; longest = Math.max(longest, current); }
    else if (key < through && current) {
      if (freeze) { freeze--; frozen.push(key); } else current = 0;
    }
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return {current, longest, freeze, frozen, credited: days.has(through)};
}
export function acceptPlan(tasks, event) {
  if (tasks.some(t => t.eventId === event.id)) return tasks;
  return [...tasks,
    {id: event.id + '-research', eventId: event.id, title: 'Review requirements & choose your idea', due: event.deadline, status: 'upcoming', qualifying: true, owner: 'You', dependency: null, evidence: false},
    {id: event.id + '-draft', eventId: event.id, title: 'Prepare your submission draft', due: event.deadline, status: 'upcoming', qualifying: true, owner: 'You', dependency: event.id + '-research', evidence: true}
  ];
}
export function isBlocked(task, tasks) { return !!task.dependency && tasks.find(t => t.id === task.dependency)?.status !== 'completed'; }
export function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
