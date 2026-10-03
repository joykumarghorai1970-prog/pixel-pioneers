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

export function mergeNotionOpportunities(events, changes, incoming, complete = true) {
  const next = events.map(e => ({...e})), notices = [...changes];
  const seen = new Set();
  for (const event of incoming) {
    const index = next.findIndex(e => e.notionPageId === event.notionPageId || e.id === event.id);
    const previous = next[index];
    const updated = {...event, id: previous?.id || event.id, unavailable: false};
    seen.add(updated.id);
    if (previous && previous.deadline !== updated.deadline) {
      const changeId = `notion-${event.notionPageId}-${event.notionRevision}-${updated.deadline}`;
      if (!notices.some(c => c.id === changeId)) notices.push({id: changeId, eventId: updated.id,
        previous: previous.deadline, updated: updated.deadline, status: 'pending'});
    }
    if (index < 0) next.push(updated); else next[index] = updated;
  }
  // Retain references used by saved plans; missing remote records leave discovery.
  if (complete) for (const event of next) {
    if (event.sourceMode === 'notion' && !seen.has(event.id)) {event.published = false; event.unavailable = true;}
  }
  return {events: next, changes: notices};
}

export function validateCredentials(email, password) {
  const trimmedEmail = String(email || '').trim().toLowerCase();
  const trimmedPassword = String(password || '').trim();
  if (!trimmedEmail) return {valid: false, error: 'Email address is required.'};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) return {valid: false, error: 'Please enter a valid institutional email address.'};
  if (!trimmedPassword) return {valid: false, error: 'Password is required.'};
  if (trimmedPassword.length < 4) return {valid: false, error: 'Password must be at least 4 characters long.'};
  return {valid: true, email: trimmedEmail, password: trimmedPassword};
}

export function classifyRole(selectedRole, email = '') {
  const normalized = String(email).toLowerCase();
  if (selectedRole === 'coordinator' || normalized.includes('coordinator') || normalized.includes('admin')) {
    return 'coordinator';
  }
  return 'student';
}

export function formatUserProfile(role, email = '', existingProfile = {}) {
  const base = {...existingProfile};
  if (role === 'coordinator') {
    return {
      ...base,
      fullName: 'Dr. Smriti Rao',
      name: 'Smriti',
      course: 'Campus Coordinator · Dean of Student Affairs'
    };
  }
  const cleanEmail = String(email).toLowerCase();
  if (cleanEmail.startsWith('aarav') || !cleanEmail) {
    return {
      ...base,
      fullName: base.fullName || 'Aarav Sharma',
      name: base.name || 'Aarav',
      course: base.course || 'Computer Science · 3rd year'
    };
  }
  const prefix = cleanEmail.split('@')[0];
  const capitalized = prefix.charAt(0).toUpperCase() + prefix.slice(1);
  return {
    ...base,
    fullName: `${capitalized} (Student)`,
    name: capitalized,
    course: base.course || 'Undergraduate Student'
  };
}

export function isRouteAllowed(role, route) {
  if (!route) return true;
  const path = route.split('/')[0];
  if (path === 'coordinator') {
    if (route === 'coordinator/settings') return true; // Settings is accessible for diagnostic check
    return role === 'coordinator';
  }
  return true;
}

export function sanitizeState(raw, defaultState = null) {
  if (!raw || typeof raw !== 'object') return defaultState;
  return {
    ...defaultState,
    ...raw,
    authenticated: Boolean(raw.authenticated),
    onboardingComplete: raw.onboardingComplete !== undefined ? Boolean(raw.onboardingComplete) : true,
    role: raw.role === 'coordinator' ? 'coordinator' : 'student',
    profile: typeof raw.profile === 'object' && raw.profile !== null ? {...defaultState?.profile, ...raw.profile} : defaultState?.profile,
    events: Array.isArray(raw.events) ? raw.events : (defaultState?.events || []),
    saved: Array.isArray(raw.saved) ? raw.saved : (defaultState?.saved || []),
    tasks: Array.isArray(raw.tasks) ? raw.tasks : (defaultState?.tasks || []),
    credits: Array.isArray(raw.credits) ? raw.credits : (defaultState?.credits || []),
    invitations: Array.isArray(raw.invitations) ? raw.invitations : (defaultState?.invitations || []),
    people: Array.isArray(raw.people) ? raw.people : (defaultState?.people || []),
    changes: Array.isArray(raw.changes) ? raw.changes : (defaultState?.changes || []),
    outcomes: Array.isArray(raw.outcomes) ? raw.outcomes : (defaultState?.outcomes || []),
    drafts: Array.isArray(raw.drafts) ? raw.drafts : (defaultState?.drafts || []),
    activity: Array.isArray(raw.activity) ? raw.activity : (defaultState?.activity || [])
  };
}

