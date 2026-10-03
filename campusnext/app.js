import {seedState} from './data.js';
import {DEMO_DAY, filterOpportunities, availablePerk, addCredit, streakSummary, acceptPlan, isBlocked, mergeNotionOpportunities, escapeHTML as h, validateCredentials, classifyRole, formatUserProfile, isRouteAllowed, sanitizeState} from './domain.js';

const KEY = 'campusnext-design-v1';
let state;
try { state = sanitizeState(JSON.parse(localStorage.getItem(KEY)), seedState()); } catch { state = seedState(); }
if(state.authenticated === undefined) state.authenticated = false;
let loginForm = {role:'student', email:'aarav@campus.edu', password:'campus2026', remember:true, showPassword:false, error:''};
let onboarding = {step:1, role:'student', interests:[], skills:'', availability:'4–8 hours / week', discoverable:false, shareStreak:false};
let filters = {query:'', category:'All opportunities', saved:false, food:false, goodies:false};
let taskTab = 'Upcoming';
let notion = {checking:true, connected:false, configured:false};
const app = document.querySelector('#app');
const dialog = document.querySelector('#dialog');
const paths = {
 home:'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
 compass:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM16 8l-3 5-5 3 3-5Z',
 check:'m5 12 4 4L19 6', tasks:'M9 5h11M9 12h11M9 19h11M3 5h1M3 12h1M3 19h1',
 people:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
 user:'M20 21v-2a7 7 0 0 0-14 0v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
 search:'m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z', bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
 arrow:'M5 12h14m-5-5 5 5-5 5', chevron:'m9 5 7 7-7 7', calendar:'M8 2v4m8-4v4M3 10h18M4 4h16v17H4Z',
 flame:'M12 2c2 7 7 7 7 13a7 7 0 0 1-14 0c0-3 2-6 4-8 0 4 1 5 2 5s3-3 1-10Z',
 snow:'M12 2v20M3 7l18 10M3 17 21 7m-12-3 3 3 3-3m-6 16 3-3 3 3',
 bookmark:'M6 3h12v18l-6-4-6 4Z', food:'M4 3v6a3 3 0 0 0 6 0V3M7 3v18M18 3c-4 3-4 10 1 10V3v18',
 gift:'M3 8h18v4H3Zm2 4v9h14v-9M12 8v13M12 8C3 8 5 0 9 3l3 5c9 0 7-8 3-5Z',
 verified:'m12 2 3 2 4 1 1 4 2 3-2 3-1 4-4 1-3 2-3-2-4-1-1-4-2-3 2-3 1-4 4-1Zm-4 10 3 3 5-6',
 spark:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z',
 book:'M3 3h6l3 3 3-3h6v16h-6l-3 3-3-3H3Zm9 3v16', close:'m6 6 12 12M6 18 18 6',
 clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2', info:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 11v6M12 7h.01',
 settings:'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',
 upload:'M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6', trophy:'M8 3h8v8a4 4 0 0 1-8 0ZM8 5H3v3a5 5 0 0 0 5 5m8-8h5v3a5 5 0 0 1-5 5M12 15v6m-4 0h8',
 campus:'m2 9 10-6 10 6-10 6Zm4 3v6l6 3 6-3v-6M22 9v8', logout:'M9 5H3v14h6m5-14 7 7-7 7M8 12h13',
 mail:'M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 2 9 6 9-6',
 lock:'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zm-12 0V7a5 5 0 0 1 10 0v4',
 eye:'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
 eyeOff:'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22',
 shield:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.spark}"/></svg>`;
const date = d => d ? new Date(d.slice(0,10)+'T12:00:00Z').toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : 'Not announced';
const eventById = id => state.events.find(e=>e.id===id);
const button = (label, action, id='', cls='btn') => `<button class="${cls}" data-action="${action}" data-id="${h(id)}">${label}</button>`;
const go = (label, route, cls='text-link') => `<a class="${cls}" href="#${route}">${label}</a>`;
function persist(message) {
 try { localStorage.setItem(KEY,JSON.stringify(state)); if(message) toast(message); }
 catch { toast('Storage is unavailable. Changes will last for this session only.'); }
}
async function refreshNotionStatus() {
 if(notion.syncing || notion.writing)return;
 const lastSyncedAt=state.notionLastSyncedAt||notion.syncedAt||null;
 try { notion = {...await fetch('/api/notion/status').then(r => r.json()), checking:false, syncedAt:lastSyncedAt}; }
 catch { notion = {checking:false, connected:false, configured:false, reason:'Notion status is unavailable.', syncedAt:lastSyncedAt}; }
 render();
}
async function syncNotionOpportunities(quiet=false) {
 if(notion.syncing || notion.writing)return;
 notion.syncing=true;
 notion.syncError='';
 render();
 try {
   const response = await fetch('/api/notion/opportunities');
   const payload = await response.json();
   if (!response.ok) throw new Error(payload.error || 'Notion sync failed.');
   if(!Array.isArray(payload.events))throw new Error('Notion returned an invalid opportunities list.');
   Object.assign(state,mergeNotionOpportunities(state.events,state.changes,payload.events));
   state.notionLastSyncedAt = payload.syncedAt;
   notion.syncedAt = payload.syncedAt;
   notion.syncError='';
   persist(quiet?'':'Opportunities synced from Notion.');
 } catch (error) { notion.syncError=error.message; if(!quiet)toast(error.message); }
 finally { notion.syncing=false; render(); }
}
async function saveNotionOpportunity(event, deadline) {
 if(notion.writing || notion.syncing)throw new Error('Wait for the current Notion operation to finish.');
 notion.writing=true;
 try {
  const response=await fetch('/api/notion/opportunities'+(deadline!==undefined?'/'+encodeURIComponent(event.notionPageId):''),{
   method:deadline!==undefined?'PATCH':'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify(deadline!==undefined?{deadline,expectedRevision:event.notionRevision}:event)
  });
  const payload=await response.json();
  if(!response.ok)throw new Error(payload.error||'Notion save failed.');
  if(!payload.event?.notionPageId)throw new Error('Notion did not acknowledge the save. Sync before retrying.');
  Object.assign(state,mergeNotionOpportunities(state.events,state.changes,[payload.event],false));
  notion.syncError='';
  persist('Saved in Notion.');
  return payload.event;
 } catch(error){notion.syncError=error.message;throw error;}
 finally {notion.writing=false;}
}
const notionLink = e => /^[a-f\d-]{36}$/i.test(e.notionPageId||'')?`<a class="text-link" target="_blank" rel="noopener noreferrer" href="https://www.notion.so/${e.notionPageId.replace(/-/g,'')}">Open in Notion ↗</a>`:'';
function connectionSettings() {
 return `${heading('Connection health','Manage the connection to your campus events in Notion.')}
 <section class="panel padded"><span class="tag ${notion.connected?'':'orange'}">${notion.checking?'Checking Notion…':notion.connected?'Notion connected':'Notion not connected'}</span>
 <h2 class="spacing">${notion.connected?'Your campus database is connected.':'Connect your campus database.'}</h2>
 <p class="body-copy">${notion.connected?'Changes from Notion sync every minute while this tab is active. Personal plans and local demo records stay in this browser.':'Run the CampusNext Node server with your Notion connection settings. Open the setup guide in the project README for the steps.'}</p>
 <div class="info-row"><span>Data source</span><strong>${h(notion.dataSource?.title||'Not configured')}</strong></div>
 <div class="info-row"><span>Last successful sync</span><strong>${h(notion.syncedAt?new Date(notion.syncedAt).toLocaleString('en-IN'):'Never')}</strong></div>
 ${notion.reason&&!notion.connected?`<p class="form-error">${h(notion.reason)}</p>`:''}
 ${notion.connected&&!notion.canPublish?`<p class="form-error">Reading is available. To publish from CampusNext, add the schema fields: ${h(notion.missingFields?.join(', '))}.</p>`:''}
 ${notion.syncError?`<p class="form-error" role="alert">${h(notion.syncError)}</p>`:''}
 <div class="inline-actions spacing">${button('Check connection','check-notion')}${notion.connected?button(notion.syncing?'Syncing…':'Sync opportunities from Notion','sync-notion','','btn primary'):''}</div>
 <p class="label-note">Publish reviewed opportunities from the coordinator workspace. To edit descriptions, eligibility, requirements or perks, use “Open in Notion”. The Published checkbox controls discovery.</p></section>`;
}
function notionStatusBadge() {
 const stamp=notion.syncedAt?new Date(notion.syncedAt).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'numeric',minute:'2-digit'}):'Never';
 const phase=notion.checking?'checking':notion.syncing?'syncing':notion.syncError?'error':notion.connected?(notion.syncedAt?'synced':'ready'):'offline';
 const label=phase==='checking'?'Checking Notion…':phase==='syncing'?'Syncing Notion…':phase==='error'?'Notion sync failed':phase==='offline'?'Notion not connected':notion.syncedAt?`Last synced ${stamp}`:'Notion ready · Never synced';
 const detail=notion.syncError||notion.reason||(notion.connected?`${notion.dataSource?.title||'Notion workspace'} · ${notion.syncedAt?`Last successful sync ${stamp}`:'No successful sync yet'}`:'Open connection health for setup details.');
 return `<a class="notion-sync-badge ${phase}" href="#coordinator/settings" title="${h(detail)}" aria-label="Notion sync status: ${h(label)}. ${h(detail)}"><span class="notion-sync-dot" aria-hidden="true"></span><span class="notion-sync-text">${h(label)}</span></a>`;
}
function toast(message) { const el=document.querySelector('#toast'); el.className='toast'; el.textContent=message; clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>el.textContent='',4500); }
function modal(title, content) { dialog.innerHTML=`<div class="dialog-header"><h2 id="dialog-title">${title}</h2>${button(icon('close'),'close','','icon-button')}</div><div class="dialog-body">${content}</div>`; dialog.querySelector('[data-action="close"]').setAttribute('aria-label','Close dialog'); if(!dialog.open)dialog.showModal(); }
function empty(title,copy,link='explore',label='Explore opportunities') {return `<div class="empty">${icon('compass')}<h3>${title}</h3><p>${copy}</p>${go(label,link,'btn primary')}</div>`;}
function heading(title,copy,action='') {return `<div class="page-heading"><div><h1>${title}</h1><p>${copy}</p></div>${action}</div>`;}
function source(e) {return `<div class="source-note">${icon('verified')} ${h(e.source)}<br>Updated ${h(e.updated)} · ${e.sourceMode==='notion'?'Notion source':'Sample source'} ${button('View source','source',e.id,'text-link')} ${notionLink(e)}</div>`;}

function loginView() {
  const isCoord = loginForm.role === 'coordinator';
  return `<main id="main" tabindex="-1" class="login-shell">
    <div class="login-orb login-orb-1" aria-hidden="true"></div>
    <div class="login-orb login-orb-2" aria-hidden="true"></div>
    <div class="login-orb login-orb-3" aria-hidden="true"></div>

    <div class="login-card-wrapper">
      <section class="login-showcase">
        <div>
          <div class="login-brand-group">
            <div class="login-brand-mark">
              <svg width="24" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18V6h4l6 8V6h4v12h-4L9 10v8Z" fill="currentColor"/></svg>
            </div>
            <div class="login-brand-title">campusnext<span>.</span></div>
          </div>

          <div class="login-showcase-content">
            <div class="login-showcase-badge">
              <span class="badge-pulse"></span>
              <span>Campus Network · Active</span>
            </div>
            <h2>Your campus, your people, your next step.</h2>
            <p class="lead">Turn scattered notices into achievable milestones. Track streaks, form teams, and unlock verified opportunities.</p>

            <div class="login-features">
              <div class="login-feature-item">
                <div class="login-feature-icon">${icon('flame')}</div>
                <div class="login-feature-text">
                  <strong>Daily Momentum &amp; Streaks</strong>
                  <span>One qualifying daily task keeps your campus streak going.</span>
                </div>
              </div>
              <div class="login-feature-item">
                <div class="login-feature-icon">${icon('verified')}</div>
                <div class="login-feature-text">
                  <strong>Notion Connected Sync</strong>
                  <span>Live sync with official campus announcement databases.</span>
                </div>
              </div>
              <div class="login-feature-item">
                <div class="login-feature-icon">${icon('people')}</div>
                <div class="login-feature-text">
                  <strong>Collaborative Team Discovery</strong>
                  <span>Find peers matching your skill needs and build together.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="login-showcase-footer">
          ${icon('campus')}
          <span>Single Sign-On enabled for registered students &amp; staff</span>
        </div>
      </section>

      <section class="login-panel">
        <div class="login-header">
          <h1>Welcome back</h1>
          <p>Sign in to your campus account to continue</p>
        </div>

        <div class="login-demo-section">
          <div class="login-demo-label">
            <span>Quick Demo Accounts</span>
            <span class="login-demo-badge">Instant Login</span>
          </div>
          <div class="login-demo-grid">
            <button type="button" class="demo-role-btn ${!isCoord?'active':''}" data-action="login-select-role" data-id="student" id="login-demo-student">
              <span class="demo-role-avatar">🧑‍💻</span>
              <div class="demo-role-info">
                <strong>Student</strong>
                <small>Aarav Sharma · CS</small>
              </div>
            </button>
            <button type="button" class="demo-role-btn ${isCoord?'active':''}" data-action="login-select-role" data-id="coordinator" id="login-demo-coordinator">
              <span class="demo-role-avatar">🗂️</span>
              <div class="demo-role-info">
                <strong>Coordinator</strong>
                <small>Dr. Smriti Rao · Admin</small>
              </div>
            </button>
          </div>
        </div>

        <div class="login-divider">or enter credentials</div>

        <form id="login-form" class="login-form">
          <div class="login-field">
            <label for="login-email">Campus email address</label>
            <div class="login-input-wrap">
              <span class="field-icon">${icon('mail')}</span>
              <input type="email" id="login-email" name="email" class="login-input" required autocomplete="email" placeholder="you@campus.edu" value="${h(loginForm.email)}">
            </div>
          </div>

          <div class="login-field">
            <label for="login-password">Password</label>
            <div class="login-input-wrap">
              <span class="field-icon">${icon('lock')}</span>
              <input type="${loginForm.showPassword ? 'text' : 'password'}" id="login-password" name="password" class="login-input" required autocomplete="current-password" placeholder="••••••••" value="${h(loginForm.password)}">
              <button type="button" class="login-pw-toggle" data-action="login-toggle-pw" aria-label="${loginForm.showPassword ? 'Hide password' : 'Show password'}">
                ${icon(loginForm.showPassword ? 'eyeOff' : 'eye')}
              </button>
            </div>
          </div>

          <div class="login-options-row">
            <label class="login-remember">
              <input type="checkbox" id="login-remember" name="remember" ${loginForm.remember ? 'checked' : ''}>
              <span>Keep me signed in</span>
            </label>
            <button type="button" class="login-forgot-link" data-action="login-forgot">Forgot password?</button>
          </div>

          <button type="submit" class="login-btn-primary" id="login-submit">
            <span>Sign in as ${isCoord ? 'Coordinator' : 'Student'}</span>
            ${icon('arrow')}
          </button>

          <button type="button" class="login-btn-sso" data-action="login-sso" id="login-sso">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.33 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>
            <span>Sign in with Institutional Google / SSO</span>
          </button>
        </form>

        ${loginForm.error ? `<div class="login-alert error" role="alert">${h(loginForm.error)}</div>` : ''}

        <div class="login-footer">
          <span>New to CampusNext?</span>
          <button type="button" class="login-signup-link" data-action="login-signup">Create student account</button>
        </div>
      </section>
    </div>
  </main>`;
}

const interestOptions = ['💻 Tech & Coding','🎨 Design & Arts','🚀 Entrepreneurship','🏆 Sports & Fitness','🎵 Music & Culture','🌱 Social Impact','📊 Data & Research','🤝 Volunteering','📸 Photography','🎬 Film & Media'];
function onboardingView() {
 const brand='<div class="onboarding-brand"><span class="onboarding-mark">CN</span><strong>CampusNext</strong></div>';
 if(onboarding.step===1) return `<main id="main" tabindex="-1" class="onboarding-shell"><section class="onboarding-card onboarding-welcome">${brand}<div class="welcome-cap" aria-hidden="true">🎓</div><h1>Welcome to CampusNext</h1><p class="onboarding-intro">Your campus companion that turns announcements into<br class="desktop-break"> achievable experiences.</p><div class="onboarding-field-label">I am a...</div><div class="role-options"><button class="role-option ${onboarding.role==='student'?'selected':''}" data-action="onboarding-role" data-id="student" aria-pressed="${onboarding.role==='student'}"><span class="role-emoji" aria-hidden="true">🧑‍💻</span><strong>Student</strong><small>Discover, save &amp; prepare</small></button><button class="role-option ${onboarding.role==='coordinator'?'selected':''}" data-action="onboarding-role" data-id="coordinator" aria-pressed="${onboarding.role==='coordinator'}"><span class="role-emoji" aria-hidden="true">🗂️</span><strong>Coordinator</strong><small>Publish &amp; monitor</small></button></div>${button('Get started '+icon('arrow'),'onboarding-next','','btn primary onboarding-primary')}<div class="login-footer" style="margin-top:24px;"><span>Already have an account?</span> <button type="button" class="login-signup-link" data-action="go-login">Sign in</button></div></section></main>`;
 if(onboarding.step===2) return `<main id="main" tabindex="-1" class="onboarding-shell"><section class="onboarding-card onboarding-step-card">${brand}<div class="step-label">STEP 2 OF 3</div><h1>What are you into?</h1><p class="onboarding-intro">We’ll use this to find opportunities that match you. You<br class="desktop-break"> can change these anytime.</p><div class="interest-list" aria-label="Choose your interests">${interestOptions.map(label=>`<button class="interest-chip ${onboarding.interests.includes(label)?'selected':''}" data-action="onboarding-interest" data-id="${h(label)}" aria-pressed="${onboarding.interests.includes(label)}">${h(label)}</button>`).join('')}</div><div class="onboarding-actions">${button('Skip','onboarding-skip-interests','','btn')}${button('Continue '+icon('arrow'),'onboarding-next','','btn primary')}</div><div class="login-footer"><span>Already have an account?</span> <button type="button" class="login-signup-link" data-action="go-login">Sign in</button></div></section></main>`;
 return `<main id="main" tabindex="-1" class="onboarding-shell"><section class="onboarding-card onboarding-step-card">${brand}<div class="step-label">STEP 3 OF 3</div><h1>Skills &amp; Availability</h1><p class="onboarding-intro">Help teammates find you. These are optional and you<br class="desktop-break"> control who sees them.</p><div class="onboarding-form"><label class="onboarding-label" for="onboarding-skills">Declared skills <span>optional</span></label><input id="onboarding-skills" class="onboarding-input" type="text" placeholder="e.g. React, Python, UI Design, Video Editing" value="${h(onboarding.skills)}"><div class="onboarding-label availability-label">Weekly prep time available <span>optional</span></div><div class="availability-options">${[['1–3 hours / week','1–3 hrs/week'],['4–8 hours / week','4–8 hrs/week'],['8+ hours / week','8+ hrs/week']].map(([value,label])=>`<label><input type="radio" name="onboarding-availability" value="${value}" ${onboarding.availability===value?'checked':''}> ${label}</label>`).join('')}</div><div class="onboarding-switch-row"><div><strong>Teammate discovery</strong><p>Allow other students to find and invite you as a collaborator.</p></div><button class="onboarding-switch ${onboarding.discoverable?'on':''}" role="switch" aria-checked="${onboarding.discoverable}" aria-label="Allow teammate discovery" data-action="onboarding-toggle" data-id="discoverable"><span></span></button></div><div class="onboarding-switch-row"><div><strong>Share streak status</strong><p>Let your buddy see your activity status.</p></div><button class="onboarding-switch ${onboarding.shareStreak?'on':''}" role="switch" aria-checked="${onboarding.shareStreak}" aria-label="Share streak status" data-action="onboarding-toggle" data-id="shareStreak"><span></span></button></div></div><div class="onboarding-actions">${button('Skip','onboarding-finish-skip','','btn')}${button('Enter CampusNext 🎉','onboarding-finish','','btn primary')}</div><div class="login-footer"><span>Already have an account?</span> <button type="button" class="login-signup-link" data-action="go-login">Sign in</button></div></section></main>`;
}
function finishOnboarding(skipOptional=false) {
 const skills=app.querySelector('#onboarding-skills')?.value ?? onboarding.skills;
 const selectedAvailability=app.querySelector('[name="onboarding-availability"]:checked')?.value;
 state.role=onboarding.role;
 state.onboardingComplete=true;
 state.authenticated=true;
 state.profile={...state.profile, interests:onboarding.interests.map(label=>label.replace(/^\p{Emoji_Presentation}\s*/u,'')), skills:skipOptional?'':skills, availability:skipOptional?'':selectedAvailability||onboarding.availability, discoverable:skipOptional?false:onboarding.discoverable, shareStreak:skipOptional?false:onboarding.shareStreak};
 persist();
 location.hash=state.role==='coordinator'?'coordinator/overview':'today';
 render();
}
function rerenderOnboardingFocus(action,id='') {
 render();
 const target=[...app.querySelectorAll(`[data-action="${action}"]`)].find(el=>el.dataset.id===id);
 (target||app.querySelector('#main'))?.focus();
}

function art(type='hero') {
 if(type==='hero') return `<svg class="hero-art" viewBox="0 0 300 270" aria-hidden="true"><ellipse cx="166" cy="245" rx="119" ry="16" fill="#cfdfd0"/><path d="M212 232V144m0 35c-46-1-49-39-49-39 44-4 49 39 49 39m0 20c39-2 50-39 50-39-45-1-50 39-50 39" fill="#8aab86" stroke="#60816b" stroke-width="3"/><path d="M199 224h30l-5 23h-20Z" fill="#a6b698"/><g transform="translate(51 51) rotate(-9 75 85)"><rect x="0" y="0" width="138" height="179" rx="12" fill="#fffefa" stroke="#c4d4c3" stroke-width="2"/><rect x="17" y="19" width="54" height="8" rx="4" fill="#b5cdb6"/><rect x="17" y="39" width="103" height="6" rx="3" fill="#e2e8dd"/><rect x="17" y="54" width="78" height="6" rx="3" fill="#e2e8dd"/><g fill="#e6efe4" stroke="#a5bda4"><rect x="18" y="82" width="16" height="16" rx="4"/><rect x="18" y="113" width="16" height="16" rx="4"/><rect x="18" y="144" width="16" height="16" rx="4"/></g><g fill="none" stroke="#54836b" stroke-width="2.5"><path d="m22 89 4 4 6-7m-10 34 4 4 6-7"/></g><g stroke="#c5d3c1" stroke-width="6" stroke-linecap="round"><path d="M47 90h65M47 121h52M47 152h61"/></g></g><g transform="translate(171 35) rotate(12)"><rect width="91" height="71" rx="11" fill="#0f766e"/><path d="m27 35 12 12 25-25" stroke="#f1f9ee" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g><path d="m37 34 3-9 3 9 9 3-9 3-3 9-3-9-9-3Zm221 90 2-7 2 7 7 2-7 2-2 7-2-7-7-2Z" fill="#bc9f5e"/><circle cx="30" cy="188" r="5" fill="#b6c5a3"/></svg>`;
 const drawings={hack:'<path d="m35 65-25 23 25 23m62-46 25 23-25 23M79 48l-23 80" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="68" cy="88" r="63" fill="none" stroke="currentColor" opacity=".12"/>',design:'<rect x="35" y="30" width="74" height="92" rx="9" fill="currentColor" opacity=".2" transform="rotate(20 70 80)"/><path d="m25 112 23-66 58 36Z" fill="currentColor" opacity=".7"/><circle cx="94" cy="45" r="23" fill="#fff" opacity=".75"/><circle cx="94" cy="45" r="12" fill="currentColor" opacity=".4"/>',pitch:'<path d="m45 111 6-41c9-18 26-34 46-41 4 24-2 46-15 62Z" fill="currentColor" opacity=".65"/><circle cx="78" cy="58" r="10" fill="#f3e7d4"/><path d="m45 83-24 20 25 1m21 1-1 25 19-26M42 116l-15 16" stroke="currentColor" stroke-width="6" fill="none"/>',open:'<circle cx="39" cy="43" r="13" fill="currentColor" opacity=".7"/><circle cx="102" cy="73" r="13" fill="currentColor" opacity=".7"/><circle cx="39" cy="120" r="13" fill="currentColor" opacity=".7"/><path d="M39 56v51m0-22c40 0 63 5 63-12" fill="none" stroke="currentColor" stroke-width="6"/>'};
 return `<svg class="cover-art" viewBox="0 0 145 150" aria-hidden="true">${drawings[type]||drawings.open}</svg>`;
}
function cover(e,detail=false) {return `<div class="event-cover cover-${h(e.cover)} ${detail?'detail-cover':''}"><span class="cover-type">${h(e.category)}</span><div class="cover-title">${h(e.tagline)}</div>${art(e.cover)}${!detail?`<button class="cover-save icon-button ${state.saved.includes(e.id)?'saved':''}" data-action="save" data-id="${e.id}" aria-label="${state.saved.includes(e.id)?'Unsave':'Save'} ${h(e.shortTitle)}" aria-pressed="${state.saved.includes(e.id)}">${icon('bookmark')}</button>`:''}</div>`;}
function perkLabel(perk,kind) {return `<span class="tag ${kind==='goodies'?'purple':''}">${icon(kind==='food'?'food':'gift')}${h(perk.status==='Provided'?perk.details:kind==='food'?'Food '+perk.status.toLowerCase():'Goodies '+perk.status.toLowerCase())}${perk.status==='Provided'&&!perk.verified?' · Needs verification':''}</span>`;}
function eventCard(e) {return `<article class="event-card">${cover(e)}<div class="event-body"><div class="event-club">${icon('verified')}${h(e.club)}</div><h3>${go(h(e.shortTitle),'event/'+e.id,'card-title')}</h3><div class="event-meta">${icon('calendar')}${date(e.date)}<span class="dot">·</span>Apply by ${date(e.deadline)}</div><div class="perk-tags">${perkLabel(e.food,'food')}${perkLabel(e.goodies,'goodies')}</div><p class="event-condition">${h([e.food.condition,e.goodies.condition].filter(Boolean).join(' · ') || 'Perk details are not yet announced.')}</p><div class="event-footer"><span class="event-reason">${icon('spark')}${h(e.category==='Hackathon'?'Picked for your interests':e.category==='Workshop'?'Room to learn something new':'Make your next move')}</span>${go('View details '+icon('arrow'),'event/'+e.id)}</div></div></article>`;}
function weekDots() {const s=streakSummary(state.credits);return `<div class="week-dots">${['M','T','W','T','F','S','S'].map((d,i)=>{const key=i<3?'2026-09-'+(28+i):'2026-10-0'+(i-2); const credited=state.credits.some(c=>c.day===key),frozen=s.frozen.includes(key);return `<div class="day-dot ${credited?'credited':frozen?'frozen':key===DEMO_DAY?'today':''}" title="${key}: ${credited?'Credited':frozen?'Frozen':key===DEMO_DAY?'Action needed':'Upcoming'}"><b>${credited?icon('check'):frozen?icon('snow'):i===5?'3':'·'}</b>${d}<span class="sr-only">${credited?' credited':frozen?' frozen':''}</span></div>`;}).join('')}</div>`;}
function streakCard() {const s=streakSummary(state.credits);return `<section class="panel streak-card"><div class="section-kicker">${icon('flame')} A little progress, every day</div><div class="streak-value"><strong>${s.current}</strong><span>day streak</span></div><p>${s.credited?"Today's action counted. Nicely done.":'One small step keeps your momentum going.'}</p>${weekDots()}<div class="streak-foot"><span>${icon('snow')} ${s.freeze} weekly freeze left</span>${go('Your streak '+icon('arrow'),'streaks')}</div></section>`;}
function taskRow(t,full=false) {const blocked=isBlocked(t,state.tasks);return `<div class="action-row"><button class="action-check ${t.status==='completed'?'done':''}" aria-label="Open task: ${h(t.title)}" data-action="task" data-id="${t.id}">${t.status==='completed'?icon('check'):''}</button><div class="action-content"><h3>${button(h(t.title),'task',t.id,'task-title')}</h3><p>${h(eventById(t.eventId)?.shortTitle)} · ${h(t.owner)}${blocked?' · Finish prerequisite first':''}</p></div><span class="tag ${t.status==='completed'?'':blocked?'gray':t.due===DEMO_DAY?'orange':'blue'}">${t.status==='completed'?'Completed':t.status==='review'?'Awaiting approval':blocked?'Blocked':t.due===DEMO_DAY?'Due today':date(t.due)}</span>${full?button('View task','task',t.id,'btn small-btn'):icon('chevron')}</div>`;}
function today() {const pending=state.tasks.filter(t=>t.status!=='completed');return `${heading(`Make today count, ${h(state.profile.name)} <span class="greeting-sun">☼</span>`,'Your campus, your people, your next step.',`<span class="date-label">${icon('calendar')} Saturday, 3 October 2026</span>`)}<div class="dashboard-top"><section class="hero"><div class="hero-copy"><div class="eyebrow">A little curiosity goes a long way</div><h2>Your next big thing<br>could start on campus.</h2><p>Find opportunities that feel like you. Meet your people. Build something that matters.</p>${go('Explore opportunities '+icon('arrow'),'explore','btn primary')}</div>${art()}</section>${streakCard()}</div><div class="dashboard-middle"><section><div class="section-heading"><h2>Your next steps <span class="number">${pending.length}</span></h2>${go('All tasks '+icon('arrow'),'tasks')}</div><div class="panel actions-panel">${pending.slice(0,3).map(t=>taskRow(t)).join('')||'<div class="padded small">You’re all caught up. Make room for something new.</div>'}</div>${state.changes.filter(c=>c.status==='pending').map(c=>`<div class="change-banner">${icon('info')}<span><strong>A deadline moved.</strong> ${h(eventById(c.eventId).shortTitle)} now closes ${date(c.updated)}.</span>${button('Review change '+icon('arrow'),'change',c.id)}</div>`).join('')}</section><section><div class="section-heading"><h2>Ahead this week</h2>${icon('calendar')}</div><div class="panel week-card"><div class="week-calendar">${['M','T','W','T','F','S','S'].map((d,i)=>`<div class="calendar-day ${i===5?'selected':''}"><span>${d}</span><b>${i<3?28+i:i-2}</b><i></i></div>`).join('')}</div>${state.tasks.filter(t=>t.status!=='completed').slice(0,2).map(t=>`<a class="agenda-row" href="#event/${t.eventId}"><div class="agenda-date">OCT<b>${Number(t.due.slice(-2))}</b></div><div><h3>${h(t.title)}</h3><p>${h(eventById(t.eventId)?.shortTitle)}</p></div><span class="tiny-dot"></span></a>`).join('')}</div></section></div><section class="dashboard-opportunities"><div class="section-heading"><h2>A few things you might love</h2>${go('Explore all '+icon('arrow'),'explore')}</div><div class="opportunity-grid">${state.events.filter(e=>e.published).slice(0,3).map(eventCard).join('')}</div></section>`;}
function explore() {const events=filterOpportunities(state.events,filters,state.saved);return `${heading('Find your next thing.','Opportunities to learn, build, and belong. All in one place.')}<div class="tabs">${button('For you','explore-tab','all','tab '+(!filters.saved?'active':''))}${button('Saved opportunities · '+state.saved.length,'explore-tab','saved','tab '+(filters.saved?'active':''))}</div><div class="filters"><label class="search-wrap">${icon('search')}<input class="search-field" id="explore-query" aria-label="Search opportunities" placeholder="Search events, clubs, or a little inspiration…" value="${h(filters.query)}"></label><select id="category-filter" aria-label="Category">${['All opportunities',...new Set(state.events.map(e=>e.category))].map(c=>`<option ${filters.category===c?'selected':''}>${h(c)}</option>`).join('')}</select>${button(icon('food')+' Food','filter','food','filter-toggle '+(filters.food?'selected':''))}${button(icon('gift')+' Goodies','filter','goodies','filter-toggle '+(filters.goodies?'selected':''))}${filters.food||filters.goodies||filters.query||filters.category!=='All opportunities'?button('Clear filters','clear-filters','','text-link'):''}</div><p class="results-label" role="status">${events.length} opportunities ${filters.food&&filters.goodies?'· Must include both verified food and goodies':''}</p><div class="opportunity-grid explore-grid">${events.map(eventCard).join('')||empty('Nothing here just yet.','No opportunities match these filters. Try clearing one to explore more.','explore','Back to Explore')}</div>`;}
function detail(id) {const e=eventById(id);if(!e)return empty('Opportunity not found','Return to discovery to choose another opportunity.');const saved=state.saved.includes(id);const planned=state.tasks.some(t=>t.eventId===id);return `${go('← Back to Explore','explore')} ${heading(h(e.shortTitle),h(e.club)+' · '+h(e.category))}<div class="two-columns"><div>${cover(e,true)}<section class="panel padded"><h2>${h(e.title)}</h2><p class="body-copy">${h(e.description)}</p><h3>Who can join?</h3><p class="body-copy">${h(e.eligibility)}</p><h3>Your readiness checklist</h3><p class="label-note">Published requirements are facts. Your readiness is self-reported.</p>${e.requirements.map((r,i)=>`<div class="readiness-row">${icon('tasks')}<span>${h(r)}</span><select aria-label="Readiness: ${h(r)}" data-readiness="${id}:${i}" ${!saved?'disabled':''}>${['Unknown','Missing','Complete'].map(s=>`<option ${(state.readiness?.[id+':'+i]||'Unknown')===s?'selected':''}>${s}</option>`).join('')}</select></div>`).join('')}${source(e)}</section><section class="panel padded spacing"><h2>The little extras</h2><div class="perk-tags">${perkLabel(e.food,'food')}${perkLabel(e.goodies,'goodies')}</div>${[e.food,e.goodies].map(p=>`<p class="body-copy">${h(p.condition||p.status)}${p.status==='Provided'?' · '+h(p.availability==='Unknown'?'Stock not confirmed':p.availability)+' · '+(p.verified?'Organizer verified (sample)':'Needs verification'):''}</p>`).join('')}</section></div><aside class="stack detail-aside"><section class="panel padded"><h3>Your opportunity at a glance</h3><div class="info-row"><span>Event date</span><strong>${date(e.date)}</strong></div><div class="info-row"><span>Apply by</span><strong>${date(e.deadline)}</strong></div><div class="info-row"><span>Where</span><strong>${h(e.venue)}</strong></div><div class="info-row"><span>Team need</span><strong>${h(e.teamNeed)}</strong></div><div class="spacing">${saved?button(planned?'View preparation plan':'Review suggested plan','plan',id,'btn primary full'):button(icon('bookmark')+' Save opportunity','save',id,'btn primary full')}</div><p class="label-note">${saved?'Saved to your local demo profile.':'Saving starts your readiness checklist.'} Saving does not register you.</p><button class="btn full" disabled>Registration link not supplied</button>${saved?button('Record an outcome','outcome',id,'text-link'):''}</section><section class="panel padded"><div class="pill-icon">${icon('people')}</div><h3 class="spacing">Better with your people.</h3><p class="body-copy">Find collaborators with the skills your idea needs.</p>${go('Find teammates '+icon('arrow'),'teams','btn full')}</section></aside></div>`;}
function tasks() {let list=state.tasks.filter(t=>taskTab==='Completed'?t.status==='completed':taskTab==='Blocked'?isBlocked(t,state.tasks):t.status!=='completed'&&!isBlocked(t,state.tasks));return `${heading('Small steps. Real progress.','Your accepted work, with a clear next action.')}<div class="tabs">${['Upcoming','Blocked','Completed'].map(t=>button(t,'task-tab',t,'tab '+(taskTab===t?'active':''))).join('')}</div><div class="panel task-list">${list.map(t=>taskRow(t,true)).join('')||empty('A little breathing room.','No '+taskTab.toLowerCase()+' tasks to show. Save an opportunity to review its preparation plan.')}</div>`;}
function teams() {const accepted=state.invitations.filter(i=>i.status==='accepted');return `${heading('Good things are built together.','Find a missing skill, a fresh perspective, or your next teammate.')}<div class="two-columns"><div class="stack"><section class="panel padded"><h2>Your team · Hack the Campus</h2><p class="body-copy">${accepted.length?'Your accepted collaborators. Shared work starts with a conversation.':'No accepted team yet. Respond to an invitation or find a collaborator below.'}</p>${accepted.map(i=>`<div class="invitation-row"><span class="avatar lavender">${h(i.initials)}</span><div><h3>${h(i.name)}</h3><p>${h(i.role)} · Accepted member</p></div>${button('Leave team','leave',i.id,'text-link')}</div>`).join('')}</section><section><div class="section-heading"><h2>Find your people</h2><span class="small muted">Opted-in profiles</span></div><div class="opportunity-grid people-grid">${state.people.map(p=>`<article class="panel team-card"><span class="avatar ${p.color}">${p.initials}</span><h3>${p.name}</h3><p>${p.role}</p><div class="skills">Declared · ${p.skills}</div><p>${icon('clock')} ${p.availability}</p>${button(state.invitations.some(i=>i.personId===p.id&&i.status==='pending')?'Invitation pending':'Invite to team','invite',p.id,'btn')}</article>`).join('')}</div></section></div><aside class="panel padded"><h2>Invitations</h2>${state.invitations.filter(i=>i.status==='pending').map(i=>`<div class="invitation-row"><span class="avatar lavender">${h(i.initials)}</span><div><h3>${h(i.name)}</h3><p>${h(i.role)} · ${h(eventById(i.eventId)?.shortTitle)}</p><p>${i.direction==='incoming'?'Invited you to collaborate':'Waiting for their acceptance'}</p><div class="inline-actions spacing">${i.direction==='incoming'?button('Accept','accept-invite',i.id,'btn primary small-btn')+button('Decline','decline-invite',i.id,'btn small-btn'):button('Cancel invitation','decline-invite',i.id,'text-link')}</div></div></div>`).join('')||'<p class="body-copy">No pending invitations.</p>'}</aside></div>`;}
function streaks() {const s=streakSummary(state.credits);return `${heading('Keep showing up.','Meaningful contributions. A little momentum. One day at a time.')}<div class="two-columns"><section class="panel padded"><div class="section-kicker">${icon('flame')} YOUR CAMPUS STREAK</div><div class="big-streak">${s.current}<span class="small muted"> days</span></div><p class="body-copy">${s.credited?"Today's qualifying action counted.":'Complete a qualifying preparation task to count today.'} Longest streak: ${s.longest} days.</p>${weekDots()}<div class="info-row"><span>Weekly freeze</span><strong>${s.freeze} remaining · refreshes Monday</strong></div><h3 class="spacing">Milestones along the way</h3><div class="badge-grid">${[3,7,14,30].map(n=>`<div class="badge-item ${s.longest>=n?'unlocked':''}">${icon('trophy')}<strong>${n} days</strong><p>${s.longest>=n?'Unlocked':'Keep going'}</p></div>`).join('')}</div><p class="body-copy spacing">One credit per campus day. One automatic freeze per Monday–Sunday week. A frozen day preserves your count without adding a day. A second missed day breaks the streak.</p><p class="small muted">Campus timezone: Asia/Kolkata · Demo clock: 3 October 2026</p></section><aside class="stack"><section class="panel padded"><div class="pill-icon lavender">${icon('people')}</div><h2 class="spacing">A little accountability.</h2>${state.buddy?.accepted?`<p class="body-copy">You + ${h(state.buddy.name)}</p><div class="streak-value"><strong>${state.buddy.count+(s.credited&&state.buddy.creditedToday?1:0)}</strong><span>buddy days</span></div><div class="info-row"><span>You</span><strong>${s.credited?'Action counted':'Action needed'}</strong></div><div class="info-row"><span>${h(state.buddy.name)}</span><strong>${state.buddy.creditedToday?'Action counted':'Not yet today'}</strong></div><p class="label-note">Both buddies must contribute on the same campus day. Private task details stay private.</p>${button('Simulate buddy contribution','buddy-demo','','btn full')}${button('End buddy relationship','end-buddy','','text-link')}`:`<p class="body-copy">Invite a buddy. Your pair streak starts only after mutual acceptance.</p>${state.buddy?.pending?'<span class="tag">Buddy invitation pending</span>':button('Invite a buddy','invite-buddy','','btn primary')}`}</section><section class="panel padded"><h3>What counts?</h3><p class="body-copy">Designated preparation tasks, accepted project milestones, and confirmed attendance. Saving or browsing does not earn credit.</p>${go('Take your next step '+icon('arrow'),'tasks')}</section></aside></div>`;}
function profile() {return `${heading('Make CampusNext yours.','A few details help us point you toward the right opportunities.')}<div class="profile-grid"><form id="profile-form" class="panel padded"><h2>Your profile</h2><p class="body-copy">Your interests can change. So can these.</p><label class="field">Full name<input name="fullName" required value="${h(state.profile.fullName)}"></label><label class="field">Course & year<input name="course" value="${h(state.profile.course)}"></label><label class="field">Interests, separated by commas<input name="interests" value="${h(state.profile.interests.join(', '))}"></label><label class="field">Declared skills<input name="skills" value="${h(state.profile.skills)}"></label><label class="field">Available preparation time<input name="availability" value="${h(state.profile.availability)}"></label>${[['discoverable','Help teammates find me','Share declared skills and availability with collaborator discovery.'],['shareStreak','Share my streak','Let accepted collaborators see my streak status.'],['reminders','Optional reminders','Show reminders for upcoming accepted tasks.']].map(([key,title,copy])=>`<label class="switch-row"><span><strong>${title}</strong><p>${copy}</p></span><input class="switch" type="checkbox" name="${key}" ${state.profile[key]?'checked':''}></label>`).join('')}<button class="btn primary spacing">Save preferences</button></form><div class="stack"><section class="panel padded"><h2>Your workspace</h2><p class="body-copy">Explore both sides of CampusNext with the demo role switch.</p>${button((state.role==='coordinator'?'Switch to student ':'Switch to coordinator ')+icon('arrow'),'role',state.role==='coordinator'?'student':'coordinator','btn full')}<p class="label-note">Prototype role switching is for demonstration. It is not authentication.</p></section><section class="panel padded"><h2>Account &amp; Session</h2><p class="body-copy">Signed in as <strong>${h(state.profile.fullName)}</strong> (${state.role==='coordinator'?'Coordinator':'Student'}).</p>${button('Sign out of CampusNext','logout','','btn full')}</section><section class="panel padded"><h2>Your activity</h2>${state.outcomes.map(o=>`<div class="info-row"><span>${h(eventById(o.eventId)?.shortTitle)}</span><strong>${h(o.status)}</strong></div>`).join('')||'<p class="body-copy">Your recorded outcomes will appear here.</p>'}${go('View streak history '+icon('arrow'),'streaks')}</section><section class="panel padded"><h3>Start fresh</h3><p class="body-copy">Reset this browser’s prototype to its sample dataset.</p>${button('Reset demo','reset','','btn')}</section></div></div>`;}
function coordinator(page) {
 if(page==='settings')return connectionSettings();
 if(page==='review')return `${heading('From announcement to opportunity.','Keep the source close. Review the facts. Then publish.',button(icon('upload')+' Import announcement','import','','btn primary'))}<div class="panel padded"><h2>Review queue</h2>${state.drafts.map(d=>`<div class="info-row"><span>${h(d.title||'Untitled announcement')}</span>${button('Continue review','review-draft',d.id,'btn small-btn')}</div>`).join('')||'<p class="body-copy">Your review queue is clear. Import a campus announcement to get started.</p>'}</div>`;
 if(page==='participation')return `${heading('Participation, with proof.','Keep student reports and coordinator confirmations separate.')}<div class="stack">${state.tasks.filter(t=>t.status==='review').map(t=>`<section class="panel padded"><h3>${h(t.title)}</h3><p class="body-copy">Task evidence: ${h(t.submission)}</p>${button('Approve contribution','approve-task',t.id,'btn primary')}</section>`).join('')}${state.outcomes.map(o=>`<section class="panel padded"><span class="tag">${h(o.status)}</span><h3 class="spacing">${h(eventById(o.eventId)?.shortTitle)}</h3><p class="body-copy">Claim: ${h(o.claim)}<br>Evidence: ${h(o.evidence)}<br>Lessons: ${h(o.lessons)}</p>${o.status!=='Confirmed'?button('Confirm evidence','confirm-outcome',o.id,'btn primary'):''}</section>`).join('')||empty('No participation reports yet.','Student-submitted evidence will appear here for review.','coordinator/opportunities','View opportunities')}</div>`;
 if(page==='teams')return `${heading('Campus teams','Accepted membership and pending invitations stay separate.')}${teams().split('<div class="two-columns">')[1]?'<div class="panel padded"><h2>Hack the Campus</h2>'+state.invitations.map(i=>`<div class="info-row"><span>${h(i.name)}</span><strong>${h(i.status)}</strong></div>`).join('')+'</div>':''}`;
 const metrics=[['Saved opportunities',state.saved.length,'In this demo profile'],['Self-reported registered',state.outcomes.filter(o=>o.claim==='Registered'&&o.status!=='Confirmed').length,'Awaiting verification'],['Confirmed registered',state.outcomes.filter(o=>o.claim==='Registered'&&o.status==='Confirmed').length,'Coordinator verified'],['Confirmed attended',state.outcomes.filter(o=>o.claim==='Attended'&&o.status==='Confirmed').length,'Coordinator verified']];
 return `${heading(page==='opportunities'?'Your campus, in motion.':'A clearer picture of your campus.',page==='opportunities'?'Manage published opportunities and review source changes.':'Review what needs attention and help students take the next step.',button(icon('upload')+' Import announcement','import','','btn primary'))}${page!=='opportunities'?`<div class="metrics">${metrics.map(([label,value,note])=>`<section class="panel metric"><p>${label}</p><strong>${value}</strong><small>${note}</small></section>`).join('')}</div>`:''}<div class="status-banner">${icon('info')} ${notion.connected?'Notion connected · Server-side authorized data source':'Demo workspace · Changes are saved in this browser. Notion is not connected.'}</div><section class="panel"><div class="padded section-heading"><h2>Published opportunities</h2><span class="tag">${state.events.length} records</span></div><div class="table-wrap"><table><thead><tr><th>Opportunity</th><th>Deadline</th><th>Status</th><th>Action</th></tr></thead><tbody>${state.events.map(e=>`<tr><td><strong>${h(e.shortTitle)}</strong><p>${h(e.club)}</p></td><td>${e.deadline?date(e.deadline):'Not announced'}</td><td><span class="tag">${e.unavailable?'Unavailable in Notion':e.sourceMode==='notion'?(e.published?'Synced with Notion':'Notion draft'):'Published locally'}</span></td><td>${button('Review / update','edit-event',e.id,'text-link')} ${notionLink(e)} ${e.sourceMode!=='notion'&&notion.canPublish?button('Publish to Notion','publish-notion',e.id,'text-link'):''}</td></tr>`).join('')}</tbody></table></div></section>`;
}

function render() {
 const route=location.hash.slice(1)||'';
 if(route==='login' || state.authenticated===false){
  app.innerHTML=loginView();
  document.title='Sign In · CampusNext';
  return;
 }
 if(state.onboardingComplete!==true){
  app.innerHTML=onboardingView();
  document.title='Welcome to CampusNext';
  return;
 }
 if(!isRouteAllowed(state.role, route)){
  toast('Coordinator privileges required. Switched to your student workspace.');
  location.hash='today';
  return;
 }
 const [page,id]=route.split('/'); const coord=state.role==='coordinator';
 const nav=coord?[['coordinator/overview','Overview','home'],['coordinator/review','Review queue','tasks'],['coordinator/opportunities','Opportunities','compass'],['coordinator/teams','Teams','people'],['coordinator/participation','Participation','verified'],['coordinator/settings','Settings','settings']]:[['today','Today','home'],['explore','Explore','compass'],['tasks','Tasks','tasks'],['teams','Teams','people'],['profile','Profile','user']];
 const current=nav.find(n=>n[0]===route)?.[1]||(page==='event'?'Opportunity':page==='streaks'?'Campus streaks':'Today');
 let content=page==='coordinator'&&(coord||id==='settings')?coordinator(id):page==='today'?today():page==='explore'?explore():page==='event'?detail(id):page==='tasks'?tasks():page==='teams'?teams():page==='streaks'?streaks():page==='profile'?profile():today();
 const navHTML=cls=>nav.map(([r,label,ic])=>`<a class="${cls} ${route===r?'active':''}" href="#${r}" ${route===r?'aria-current="page"':''} aria-label="${label}">${icon(ic)}<span>${label}</span>${cls==='nav-link'&&r==='tasks'?`<span class="count">${state.tasks.filter(t=>t.status!=='completed').length}</span>`:''}</a>`).join('');
 app.innerHTML=`<aside class="sidebar"><a class="brand" href="#today"><span class="brand-mark"><svg width="23" height="25" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18V6h4l6 8V6h4v12h-4L9 10v8Z" fill="currentColor"/></svg></span><span>campusnext<span class="brand-dot">.</span></span></a><div class="campus-label">${icon('campus')} YOUR CAMPUS. CONNECTED.</div><p class="nav-label">${coord?'COORDINATOR WORKSPACE':'YOUR WORKSPACE'}</p><nav class="nav" aria-label="Main navigation">${navHTML('nav-link')}</nav>${!coord?`<div class="nav-divider"></div>${go(icon('flame')+'<span>Campus streaks</span>','streaks','nav-link '+(page==='streaks'?'active':''))}`:''}<div class="sidebar-bottom"><div class="campus-note">${icon('spark')}<strong> A campus full of possibilities.</strong><p>Your next chapter starts with one small step.</p>${go('Find yours '+icon('arrow'),'explore')}</div>${button(icon('arrow')+`<span>Switch to ${coord?'Student':'Coordinator'}</span>`,'role',coord?'student':'coordinator','nav-link')}${button(icon('logout')+`<span>Sign out</span>`,'logout','','nav-link')}<a class="account" href="#profile"><span class="avatar">${h(state.profile.name.slice(0,1))}S</span><div><strong>${h(state.profile.fullName)}</strong><small>${coord?'Coordinator · Demo':'Student · Demo profile'}</small></div>${icon('chevron')}</a></div></aside><div class="workspace"><header class="topbar"><div class="breadcrumb"><span>My campus</span>${icon('chevron')}<strong>${current}</strong></div><div class="header-actions">${button(icon('search')+'<span>Ask anything about your campus</span><kbd>⌘ K</kbd>','ask','','global-search')}${button(icon('bell')+(state.changes.some(c=>c.status==='pending')?'<i class="notification-dot"></i>':''),'notifications','','icon-button')}<div class="header-divider"></div><a class="avatar" href="#profile" aria-label="Your profile">${h(state.profile.name[0])}S</a></div></header><main id="main" class="content" tabindex="-1">${content}<footer class="demo-footer"><span><i class="demo-dot"></i>Interactive prototype · Sample campus data · Saved locally</span><span>${icon('book')} ${notion.connected?'Notion connected':'Notion not connected'} ${go('Connection details','coordinator/settings')}</span></footer></main></div><nav class="bottom-nav" aria-label="Mobile navigation">${navHTML('bottom-link')}</nav>`;
 app.querySelector('[data-action="notifications"]')?.insertAdjacentHTML('beforebegin',notionStatusBadge());
 app.querySelector('[data-action="notifications"]')?.setAttribute('aria-label','Notifications');
 app.querySelector('[data-action="ask"]')?.setAttribute('aria-label','Ask CampusNext');
 app.querySelectorAll('[data-action="filter"]').forEach(b=>b.setAttribute('aria-pressed',String(!!filters[b.dataset.id])));
 document.title=current+' · CampusNext';
}

function showPlan(id) {const e=eventById(id),existing=state.tasks.filter(t=>t.eventId===id);modal(existing.length?'Your preparation plan':'A suggested plan, ready for your review',`<p>${h(e.shortTitle)} · ${existing.length?'Accepted tasks':'Suggested tasks. Review dates and ownership before accepting.'}</p><form id="plan-form" data-id="${id}">${(existing.length?existing:acceptPlan([],e)).map(t=>`<div class="plan-card"><h3>${h(t.title)}</h3><p>Owner: ${h(t.owner)} · ${t.dependency?'Depends on the first task':'No prerequisite'} · ${existing.length?h(t.status):'Suggested'}</p><label>Due date <input type="date" name="${t.id}" value="${t.due}" required ${t.status==='completed'?'disabled':''}></label></div>`).join('')}<div class="dialog-actions"><button class="btn primary">${existing.length?'Save reviewed dates':'Accept plan'}</button></div></form>`);}
function showTask(id) {const t=state.tasks.find(t=>t.id===id);const blocked=isBlocked(t,state.tasks);modal(h(t.title),`<p>${h(eventById(t.eventId)?.shortTitle)} · Owner: ${h(t.owner)}</p><div class="info-row"><span>Due</span><strong>${date(t.due)}</strong></div><div class="info-row"><span>Status</span><strong>${blocked?'Blocked':h(t.status)}</strong></div><p class="body-copy spacing">${blocked?'Complete “'+h(state.tasks.find(x=>x.id===t.dependency)?.title)+'” first.':t.evidence?'This contribution requires evidence and coordinator approval before streak credit.':'This designated task earns one daily streak credit when completed.'}</p>${t.status==='completed'?'<span class="tag">Completed · activity recorded once</span>':t.status==='review'?'<span class="tag orange">Awaiting coordinator approval</span>':blocked?'':`<form id="complete-form" data-id="${id}">${t.evidence?'<label class="field">Evidence or deliverable<textarea name="evidence" required placeholder="Describe your work or paste a deliverable link"></textarea></label>':''}<button class="btn primary">${t.evidence?'Submit for approval':'Mark complete'}</button></form>`}`);}
function showChange(id) {const c=state.changes.find(c=>c.id===id);const tasks=state.tasks.filter(t=>t.eventId===c.eventId&&t.status!=='completed');modal('A new deadline. Your plan, your call.',`<p>${h(eventById(c.eventId).shortTitle)}</p><div class="diff-grid"><div class="diff-box"><small>PREVIOUS DEADLINE</small><strong>${date(c.previous)}</strong></div><div class="diff-box updated"><small>UPDATED DEADLINE</small><strong>${date(c.updated)}</strong></div></div><p class="body-copy">You saved this opportunity. Its source deadline changed, so ${tasks.length} unfinished tasks may need review. Completed work stays as it is.</p><form id="change-form" data-id="${id}">${tasks.map(t=>`<label class="field">${h(t.title)}${t.manual?' · Your edited date':''}<input type="date" name="${t.id}" value="${t.manual?t.due:t.due>c.updated?c.updated:t.due}" required></label>`).join('')}${source(eventById(c.eventId))}<div class="dialog-actions">${button('Keep my plan','dismiss-change',id,'btn')}<button class="btn primary">Accept reviewed dates</button></div></form>`);}
function importForm(d={}) {modal('Review an announcement',`<p>${notion.connected?'Publish a reviewed announcement to your campus Notion database.':'Save a local announcement. Connect Notion in Connection health to publish there.'} Enter the verified fields below.</p><form id="import-form" data-id="${h(d.id||'')}"><label class="field">Source announcement<textarea name="sourceText" required placeholder="Paste the original campus announcement">${h(d.sourceText||'')}</textarea></label><label class="field">Opportunity title<input name="title" required value="${h(d.title||'')}"></label><label class="field">Organizing club<input name="club" required value="${h(d.club||'')}"></label><div class="diff-grid"><label class="field">Event date<input type="date" name="date" required value="${h(d.date||'')}"></label><label class="field">Registration deadline<input type="date" name="deadline" required value="${h(d.deadline||'')}"></label></div><label class="field">Venue<input name="venue" value="${h(d.venue||'')}"></label><label class="field">Eligibility<input name="eligibility" value="${h(d.eligibility||'')}"></label><label class="field">Requirements (one per line)<textarea name="requirements">${h(d.requirements||'')}</textarea></label><p class="label-note">Unknown perks remain “Not announced”. Verify perk terms with the organizer before offering them.</p><label class="switch-row"><span>I reviewed these fields against the source</span><input name="verified" type="checkbox" class="switch"></label><div class="dialog-actions"><button name="intent" value="draft" formnovalidate class="btn">Save draft</button><button name="intent" value="publish" class="btn primary">${notion.connected?'Publish to Notion':'Publish to local demo'}</button></div><p id="form-error" class="form-error" role="alert"></p></form>`);}
function showAsk(question='') {modal('Ask CampusNext',`<p>A quick route from campus information to your next step.</p><form id="ask-form"><label class="field">Your question<input name="question" required placeholder="What must I finish this week?" value="${h(question)}"></label><button class="btn primary">Find in campus records ${icon('arrow')}</button></form><div class="prompt-list">${['What must I finish this week?','Which events have food and goodies?','What changed in my saved events?'].map(q=>button(q,'ask-prompt',q)).join('')}</div><p class="label-note">Demo record lookup · Uses sample records, not a connected AI service.</p><div id="answer" aria-live="polite"></div>`);if(question)answer(question);}
function answer(q) {let result='';if(/task|finish|week|prepare/i.test(q)){const ts=state.tasks.filter(t=>t.status!=='completed');result=ts.length?ts.map(t=>`<p>• ${h(t.title)} — ${date(t.due)}${isBlocked(t,state.tasks)?' (blocked by prerequisite)':''}. ${go('View source','event/'+t.eventId)}</p>`).join(''):'You have no unfinished accepted tasks.';}else if(/food|goodies|event|opportunit/i.test(q)&&!/chang/i.test(q)){result=filterOpportunities(state.events,{food:/food/i.test(q),goodies:/goodies/i.test(q)}).map(e=>`<p>${go(h(e.shortTitle),'event/'+e.id)} · ${date(e.date)}<br>${h(e.food.details)} · ${h(e.goodies.details)}<br>${h(e.goodies.condition||'')} · Updated ${h(e.updated)}</p>`).join('');}else if(/chang|deadline/i.test(q)){result=state.changes.filter(c=>state.saved.includes(c.eventId)).map(c=>`<p>${go(h(eventById(c.eventId).shortTitle),'event/'+c.eventId)}: deadline moved from ${date(c.previous)} to ${date(c.updated)}.</p>`).join('')||'No recorded changes in your saved opportunities.';}else result='I don’t have enough evidence in these demo records to answer that. Try asking about tasks, event perks, or changed deadlines.';document.querySelector('#answer').innerHTML=`<div class="answer"><h3>From your campus records</h3>${result}<div class="source-note">Local sample records · Snapshot: 3 October 2026. Follow the linked opportunity to inspect its source.</div></div>`;}

document.addEventListener('click',async ev=>{
 const el=ev.target.closest('[data-action]'); if(!el)return; const {action,id}=el.dataset;
 if(action==='login-select-role'){
  loginForm.role=id;
  if(id==='coordinator'){
   loginForm.email='coordinator@campus.edu';
   loginForm.password='campus2026';
  } else {
   loginForm.email='aarav@campus.edu';
   loginForm.password='campus2026';
  }
  loginForm.error='';
  render();
  return;
 }
 if(action==='login-toggle-pw'){loginForm.showPassword=!loginForm.showPassword;render();return;}
 if(action==='login-sso'){
  state.authenticated=true;
  state.role='student';
  state.onboardingComplete=true;
  state.profile={...state.profile, fullName:'Aarav Sharma', name:'Aarav'};
  persist('Signed in with Campus Institutional Google SSO.');
  location.hash='today';
  render();
  return;
 }
 if(action==='login-signup'){
  state.onboardingComplete=false;
  state.authenticated=true;
  onboarding={step:1, role:'student', interests:[], skills:'', availability:'4–8 hours / week', discoverable:false, shareStreak:false};
  location.hash='onboarding';
  render();
  return;
 }
 if(action==='go-login'){
  state.authenticated=false;
  location.hash='login';
  render();
  return;
 }
 if(action==='login-forgot'){
  modal('Reset campus credentials', `<p>Enter your institutional email address. A password reset link will be sent to your campus inbox.</p><form id="forgot-form"><label class="field">Campus email<input type="email" name="resetEmail" required placeholder="you@campus.edu" value="${h(loginForm.email)}"></label><div class="dialog-actions">${button('Cancel','close','','btn')}<button class="btn primary">Send reset link</button></div></form>`);
  return;
 }
 if(action==='logout'){
  state.authenticated=false;
  loginForm.error='';
  persist('You have signed out of CampusNext.');
  location.hash='login';
  render();
  return;
 }
 if(action==='onboarding-role'){onboarding.role=id;rerenderOnboardingFocus(action,id);return;}
 if(action==='onboarding-next'){onboarding.step++;rerenderOnboardingFocus('step');return;}
 if(action==='onboarding-skip-interests'){onboarding.interests=[];onboarding.step=3;rerenderOnboardingFocus('step');return;}
 if(action==='onboarding-interest'){onboarding.interests=onboarding.interests.includes(id)?onboarding.interests.filter(x=>x!==id):[...onboarding.interests,id];rerenderOnboardingFocus(action,id);return;}
 if(action==='onboarding-toggle'){onboarding[id]=!onboarding[id];rerenderOnboardingFocus(action,id);return;}
 if(action==='onboarding-finish'){finishOnboarding();return;}
 if(action==='onboarding-finish-skip'){finishOnboarding(true);return;}
 if(action==='close'){dialog.close();return;}
 if(action==='save'){state.saved=state.saved.includes(id)?state.saved.filter(x=>x!==id):[...state.saved,id];persist(state.saved.includes(id)?'Opportunity saved locally. Your readiness checklist is ready.':'Opportunity removed from saved. Accepted tasks are preserved.');render();return;}
 if(action==='filter'){filters[id]=!filters[id];render();return;}
 if(action==='clear-filters'){filters={query:'',category:'All opportunities',saved:filters.saved,food:false,goodies:false};render();return;}
 if(action==='explore-tab'){filters.saved=id==='saved';render();return;}
 if(action==='task-tab'){taskTab=id;render();return;}
 if(action==='plan'){showPlan(id);return;}
 if(action==='task'){showTask(id);return;}
 if(action==='change'){showChange(id);return;}
 if(action==='dismiss-change'){state.changes.find(c=>c.id===id).status='dismissed';persist('Source updated. Your existing task dates are preserved.');dialog.close();render();return;}
 if(action==='source'){const e=eventById(id);modal('Source record',`<span class="tag">${e.sourceMode==='notion'?'Live Notion source':'Synthetic demo source'}</span><h3>${h(e.source)}</h3><p class="body-copy spacing">${h(e.sourceText||e.description)}</p><p class="body-copy">Eligibility: ${h(e.eligibility)}<br>Requirements: ${e.requirements.map(h).join('; ')}<br>Updated: ${h(e.updated)}</p>${notionLink(e)}<p class="label-note">${e.sourceMode==='notion'?'Edit the source in Notion, then sync CampusNext to load changes.':'This sample record has no live Notion page.'}</p>`);return;}
 if(action==='invite'){const p=state.people.find(p=>p.id===id);if(state.invitations.some(i=>i.personId===id&&['pending','accepted'].includes(i.status))){toast('An invitation or accepted membership already exists.');return;}state.invitations.push({id:crypto.randomUUID(),personId:id,name:p.name,initials:p.initials,role:p.role,eventId:'hack',direction:'outgoing',status:'pending'});persist('Demo invitation created. Membership waits for acceptance.');render();return;}
 if(action==='accept-invite'||action==='decline-invite'||action==='leave'){state.invitations.find(i=>i.id===id).status=action==='accept-invite'?'accepted':action==='leave'?'left':'declined';persist(action==='accept-invite'?'Invitation accepted. Your team is ready.':'Invitation or membership updated locally.');render();return;}
 if(action==='role'){state.role=id;persist();location.hash=id==='coordinator'?'coordinator/overview':'today';render();return;}
 if(action==='ask'||action==='ask-prompt'){showAsk(action==='ask-prompt'?id:'');return;}
 if(action==='notifications'){modal('Your campus updates',`<div class="stack">${state.changes.filter(c=>c.status==='pending').map(c=>`<div class="plan-card"><h3>A deadline moved</h3><p>${h(eventById(c.eventId).shortTitle)} · New deadline ${date(c.updated)}</p>${button('Review change','change',c.id,'text-link')}</div>`).join('')}${state.invitations.filter(i=>i.direction==='incoming'&&i.status==='pending').map(i=>`<div class="plan-card"><h3>${h(i.name)} invited you to collaborate</h3><p>${h(eventById(i.eventId).shortTitle)}</p>${go('View invitation','teams')}</div>`).join('')}${!state.changes.some(c=>c.status==='pending')&&!state.invitations.some(i=>i.direction==='incoming'&&i.status==='pending')?'<p>You’re all caught up.</p>':''}</div>`);return;}
 if(action==='sync-notion'){syncNotionOpportunities();return;}
 if(action==='check-notion'){refreshNotionStatus();return;}
 if(action==='publish-notion'){
  el.disabled=true;el.textContent='Saving to Notion…';
  try {await saveNotionOpportunity(eventById(id));}catch(error){toast(error.message);}
  render();return;
 }
 if(action==='buddy-demo'){if(state.buddy.creditedToday){toast('Buddy contribution already counted today.');return;}state.buddy.creditedToday=true;persist('Sample buddy contribution recorded.');render();return;}
 if(action==='end-buddy'){modal('End this buddy relationship?',`<p>Your personal streak and past pair record are preserved. A new buddy pair starts at zero.</p><div class="dialog-actions">${button('Keep buddy','close','','btn')}${button('End relationship','confirm-end-buddy','','btn primary')}</div>`);return;}
 if(action==='confirm-end-buddy'){state.buddyHistory=[...(state.buddyHistory||[]),state.buddy];state.buddy=null;persist('Buddy relationship ended. History preserved.');dialog.close();render();return;}
 if(action==='invite-buddy'){modal('Invite a buddy',`<p>Your invitation will stay pending until the other person accepts.</p><form id="buddy-form"><label class="field">Choose an opted-in student<select name="person">${state.people.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select></label><button class="btn primary">Create demo invitation</button></form>`);return;}
 if(action==='outcome'){modal('Tell us how it went.',`<p>${h(eventById(id).shortTitle)} · Your report will await coordinator verification.</p><form id="outcome-form" data-id="${id}"><label class="field">What did you do?<select name="claim"><option>Registered</option><option>Attended</option><option>Submitted a deliverable</option></select></label><label class="field">Evidence or deliverable<textarea name="evidence" required placeholder="Add a reference or describe your contribution"></textarea></label><label class="field">What did you learn? (optional)<textarea name="lessons"></textarea></label><button class="btn primary">Submit outcome</button></form>`);return;}
 if(action==='import'){importForm();return;}
 if(action==='review-draft'){importForm(state.drafts.find(d=>d.id===id));return;}
 if(action==='edit-event'){const e=eventById(id);modal('Review source deadline',`<p>${h(e.shortTitle)}. Changing the source proposes new dates to affected students; it does not replace their plans.</p><form id="event-form" data-id="${id}"><label class="field">Registration deadline<input name="deadline" type="date" value="${e.deadline}" required max="${e.date}"></label><button class="btn primary">${e.sourceMode==='notion'?'Save to Notion':'Save local source change'}</button><p class="form-error" role="alert"></p></form>`);return;}
 if(action==='approve-task'&&state.role==='coordinator'){const t=state.tasks.find(t=>t.id===id);t.status='completed';state.credits=addCredit(state.credits,t,t.occurredDay||DEMO_DAY);persist('Contribution approved. Credit applied to its original day.');render();return;}
 if(action==='confirm-outcome'&&state.role==='coordinator'){const o=state.outcomes.find(o=>o.id===id);o.status='Confirmed';if(o.claim==='Attended')state.credits=addCredit(state.credits,{id:'attendance-'+o.eventId,status:'completed',qualifying:true},o.occurredDay);persist('Evidence confirmed in the local demo.');render();return;}
 if(action==='reset'){modal('Reset the sample workspace?',`<p>This removes your local prototype edits and restores the original sample records.</p><div class="dialog-actions">${button('Keep my changes','close','','btn')}${button('Reset sample data','confirm-reset','','btn primary')}</div>`);return;}
 if(action==='confirm-reset'){state=seedState();onboarding={step:1,role:'student',interests:[],skills:'',availability:'4–8 hours / week',discoverable:false,shareStreak:false};persist('Sample workspace restored.');dialog.close();location.hash='today';render();}
});
document.addEventListener('change',ev=>{if(ev.target.name==='onboarding-availability'){onboarding.availability=ev.target.value;}if(ev.target.id==='category-filter'){filters.category=ev.target.value;render();}if(ev.target.dataset.readiness){state.readiness||={};state.readiness[ev.target.dataset.readiness]=ev.target.value;persist('Readiness updated locally.');}});
document.addEventListener('input',ev=>{
 if(ev.target.id==='login-email'){loginForm.email=ev.target.value;}
 if(ev.target.id==='login-password'){loginForm.password=ev.target.value;}
 if(ev.target.id==='onboarding-skills'){onboarding.skills=ev.target.value;}
 if(ev.target.id==='explore-query'){const position=ev.target.selectionStart;filters.query=ev.target.value;render();const input=document.querySelector('#explore-query');input.focus();input.setSelectionRange(position,position);}
});
document.addEventListener('submit',async ev=>{
 ev.preventDefault();const form=ev.target,fd=new FormData(form),id=form.dataset.id,values=Object.fromEntries(fd);
 if(form.dataset.saving)return;
 if(form.id==='login-form'){
  const validation = validateCredentials(values.email || loginForm.email, values.password || loginForm.password);
  if(!validation.valid){
   loginForm.error = validation.error;
   render();
   return;
  }
  const email = validation.email;
  const role = classifyRole(loginForm.role, email);
  state.authenticated = true;
  state.onboardingComplete = true;
  state.role = role;
  state.profile = formatUserProfile(role, email, state.profile);
  if(role === 'coordinator'){
   persist('Welcome back, Dr. Smriti Rao.');
   location.hash = 'coordinator/overview';
  } else {
   persist(`Welcome back, ${state.profile.name}!`);
   location.hash = 'today';
  }
  render();
  return;
 }
 if(form.id==='forgot-form'){
  dialog.close();
  toast(`Password reset instructions sent to ${values.resetEmail||loginForm.email}.`);
  return;
 }
 if(form.id==='profile-form'){state.profile={...state.profile,...values,name:values.fullName.trim().split(' ')[0],interests:values.interests.split(',').map(s=>s.trim()).filter(Boolean),discoverable:fd.has('discoverable'),shareStreak:fd.has('shareStreak'),reminders:fd.has('reminders')};persist('Your preferences are saved locally.');render();return;}
 if(form.id==='ask-form'){answer(values.question);return;}
 if(form.id==='plan-form'){state.tasks=acceptPlan(state.tasks,eventById(id));state.tasks.forEach(t=>{if(t.eventId===id&&values[t.id]&&t.status!=='completed'){t.manual=t.manual||t.due!==values[t.id];t.due=values[t.id];}});persist('Preparation plan accepted and saved locally.');}
 if(form.id==='complete-form'){const t=state.tasks.find(t=>t.id===id);if(isBlocked(t,state.tasks)||t.status==='completed')return;t.occurredDay=DEMO_DAY;t.status=t.evidence?'review':'completed';t.submission=values.evidence||'';state.credits=addCredit(state.credits,t);persist(t.evidence?'Evidence submitted. Streak credit waits for approval.':'Task completed. Today’s qualifying action counted.');}
 if(form.id==='change-form'){const c=state.changes.find(c=>c.id===id);state.tasks.forEach(t=>{if(t.eventId===c.eventId&&t.status!=='completed'&&values[t.id]){t.due=values[t.id];t.manual=true;}});c.status='accepted';persist('Reviewed dates saved. Completed work is preserved.');}
 if(form.id==='buddy-form'){const p=state.people.find(p=>p.id===values.person);state.buddy={name:p.name,initials:p.initials,count:0,pending:true,accepted:false};persist('Buddy invitation pending. No pair streak has started.');}
 if(form.id==='outcome-form'){state.outcomes.push({id:crypto.randomUUID(),eventId:id,...values,status:'Awaiting verification',occurredDay:DEMO_DAY});persist('Outcome saved locally. Awaiting coordinator verification.');}
 if(form.id==='event-form'){
  const e=eventById(id);
  if(e.sourceMode==='notion'){
   if(form.dataset.saving)return;
   form.dataset.saving='true';ev.submitter.disabled=true;ev.submitter.textContent='Saving to Notion…';
   try {await saveNotionOpportunity(e,values.deadline);}
   catch(error){form.querySelector('.form-error').textContent=error.message;return;}
   finally {delete form.dataset.saving;ev.submitter.disabled=false;ev.submitter.textContent='Save to Notion';}
  } else {if(e.deadline!==values.deadline){state.changes.push({id:crypto.randomUUID(),eventId:id,previous:e.deadline,updated:values.deadline,status:'pending'});e.deadline=values.deadline;e.updated='3 Oct · Local demo edit';}persist('Source deadline updated. Student plans await review.');}
 }
 if(form.id==='import-form'){
  const publish=ev.submitter.value==='publish';
  if(publish&&(!fd.has('verified')||values.deadline>values.date)){document.querySelector('#form-error').textContent=!fd.has('verified')?'Review the source and check the verification box before publishing.':'Registration deadline must be on or before the event date.';return;}
  const draftId=id||crypto.randomUUID();form.dataset.id=draftId;
  if(publish&&notion.connected){
   if(form.dataset.saving)return;
   if(!notion.canPublish){form.querySelector('.form-error').textContent='This data source needs the CampusNext schema. See Connection health.';return;}
   state.drafts=state.drafts.filter(d=>d.id!==draftId);state.drafts.push({id:draftId,...values});persist();
   form.dataset.saving='true';ev.submitter.disabled=true;ev.submitter.textContent='Publishing to Notion…';
   try {await saveNotionOpportunity({id:draftId,...values,requirements:values.requirements.split('\n').filter(Boolean),category:'Community',published:true,description:values.sourceText,source:'Coordinator-reviewed announcement'});}
   catch(error){form.querySelector('.form-error').textContent=error.message;return;}
   finally {delete form.dataset.saving;ev.submitter.disabled=false;ev.submitter.textContent='Publish to Notion';}
   state.drafts=state.drafts.filter(d=>d.id!==draftId);persist();dialog.close();render();return;
  }
  state.drafts=state.drafts.filter(d=>d.id!==draftId);
  if(!publish){state.drafts.push({id:draftId,...values});persist('Draft saved locally.');}
  else {const existing=state.events.find(e=>e.sourceText===values.sourceText);const unknown={status:'Not announced',details:'Not announced',verified:false,availability:'Unknown'};const event={id:existing?.id||draftId,title:values.title,shortTitle:values.title,category:'Community',club:values.club,date:values.date,deadline:values.deadline,venue:values.venue||'Not announced',eligibility:values.eligibility||'Unknown — ask the organizer',requirements:values.requirements.split('\n').filter(Boolean),description:values.sourceText,sourceText:values.sourceText,source:'Coordinator-reviewed local announcement',updated:'3 Oct · Local demo',published:true,cover:'open',tagline:values.title.toUpperCase(),food:{...unknown},goodies:{...unknown},teamNeed:'Not announced',reason:'Published by your campus coordinator'};if(existing)Object.assign(existing,event);else state.events.push(event);persist(existing?'Existing local announcement updated.':'Opportunity published in the local demo.');}
 }
 dialog.close();render();
});
window.addEventListener('hashchange',()=>{dialog.close();render();window.scrollTo(0,0);});
document.addEventListener('keydown',ev=>{if((ev.metaKey||ev.ctrlKey)&&ev.key.toLowerCase()==='k'){ev.preventDefault();showAsk();}});
render();
refreshNotionStatus().then(()=>{if(notion.connected)syncNotionOpportunities(true);});
setInterval(()=>{if(notion.connected&&!document.hidden&&!dialog.open&&!document.activeElement?.closest('form')&&!document.activeElement?.matches('input,textarea,select'))syncNotionOpportunities(true);},60000);

