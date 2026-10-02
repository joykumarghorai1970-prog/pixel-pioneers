import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const sourcePath = "C:/Users/ranuk/Documents/PIXEL PIONEEERS/KBC2026_Pitch_Template.pptx";
const buildDir = "C:/Users/ranuk/Documents/PIXEL PIONEEERS/.codex-build";
const candidatePath = path.join(buildDir, "CampusNext_Pitch_candidate.pptx");
const renderDir = path.join(buildDir, "CampusNext_candidate_renders");
await fs.mkdir(renderDir, { recursive: true });

const presentation = await PresentationFile.importPptx(await FileBlob.load(sourcePath));

function replace(id, oldText, newText) {
  const target = presentation.resolve(id);
  target.text.replace(oldText, newText);
}
function replaceLines(id, replacements) {
  for (const [oldText, newText] of replacements) replace(id, oldText, newText);
}

// Cover
replace("sh/547294r6", "Kinetex Lab × Notion", "Pixel Pioneers × CampusNext");
replace("sh/k3yl0zql", "[Your Project Name]", "CampusNext");
replace("sh/7qp4be9c", "[One-line tagline: what it does and for whom]", "Turn campus updates into a clear next action");
replace("sh/ts7md4r2", "Problem ID: KBC-NOTION-0[1 / 2 / 3]\nTeam name: [Team]   |   Members: [Name 1, Name 2, Name 3, Name 4]\nCollege: [KIIT]   |   Demo link: [URL]   |   Repo: [GitHub URL]", "Problem ID: KBC-NOTION-01\nTeam name: Pixel Pioneers   |   Members: [add names]\nCollege: [add college]   |   Demo: campusnext/   |   Repo: [add URL]");
replaceLines("sh/ts7md4r2", [
  ["KBC-NOTION-0[1 / 2 / 3]", "KBC-NOTION-01"],
  ["[Team]", "Pixel Pioneers"],
  ["[Name 1, Name 2, Name 3, Name 4]", "[add names]"],
  ["[KIIT]", "[add college]"],
  ["Demo link: [URL]", "Demo: campusnext/"],
  ["[GitHub URL]", "[add URL]"]
]);

// Slide 2: Problem & Users
replace("sh/x4r21kru", "Kaun Banega Codepati 2026 | Kinetex Lab × Notion", "Kaun Banega Codepati 2026 | CampusNext");
replace("sh/9wnqhczy", "What is scattered or broken today?\nWho feels the pain, and how often?\nReal example / scenario (e.g. missed deadline, lost decision)\nCost of the status quo", "• Campus information is spread across notices, posters and forms\n• Students miss relevance, requirements or the next step\n• Deadline changes leave saved plans stale\n• Coordinators cannot see blockers or follow-through");
replaceLines("sh/9wnqhczy", [
  ["What is scattered or broken today?", "Campus information is spread across notices, posters and forms"],
  ["Who feels the pain, and how often?", "Students miss relevance, requirements or the next step"],
  ["Real example / scenario (e.g. missed deadline, lost decision)", "Deadline changes leave saved plans stale"],
  ["Cost of the status quo", "Coordinators cannot see blockers or follow-through"]
]);
replace("sh/xk7qlczu", "Role 1: [e.g. Student / Researcher / Organizer]\nRole 2: [e.g. Club coordinator / Mentor / Volunteer]\nWhat each role needs to get done\nReference scenario we are solving", "• Students: discover, prepare, collaborate and track progress\n• Coordinators: publish verified information and confirm outcomes\n• Admins: manage roles, workspace mapping and connection health\n• Scenario: a hackathon notice becomes a team plan, then absorbs a deadline change");
replaceLines("sh/xk7qlczu", [
  ["Role 1: [e.g. Student / Researcher / Organizer]", "Students: discover, prepare, collaborate and track progress"],
  ["Role 2: [e.g. Club coordinator / Mentor / Volunteer]", "Coordinators: publish verified information and confirm outcomes"],
  ["What each role needs to get done", "Admins: manage roles, workspace mapping and connection health"],
  ["Reference scenario we are solving", "Scenario: a hackathon notice becomes a team plan, then absorbs a deadline change"]
]);

// Slide 3: Solution & Workflow
replace("sh/298ryl4v", "Proposed workflow, end to end", "Announcement to outcome");
replace("sh/obq90bml", "Kaun Banega Codepati 2026 | Kinetex Lab × Notion", "Kaun Banega Codepati 2026 | CampusNext");
replace("sh/n6ls3alk", "1. Ingest", "1. Publish");
replace("sh/m1c3mlsn", "2. Structure (AI)", "2. Discover");
replace("sh/83ulovat", "3. Sync to Notion", "3. Prepare");
replace("sh/a5c3ql8z", "4. Act / Search", "4. Collaborate");
replace("sh/w7ulsvqp", "5. Insights", "5. Participate");
replace("sh/f29gbyx0", "Input: [announcement / notes / event change]\nAI output: [records, tasks, decisions, links]\nNotion write: [pages & databases touched]", "• Coordinator notice or Notion edit becomes a verified source\n• CampusNext explains relevance, readiness and dependencies\n• Approved records link opportunities, teams, tasks and outcomes");
replaceLines("sh/f29gbyx0", [
  ["Input: [announcement / notes / event change]", "Coordinator notice or Notion edit becomes a verified source"],
  ["AI output: [records, tasks, decisions, links]", "CampusNext explains relevance, readiness and dependencies"],
  ["Notion write: [pages & databases touched]", "Approved records link opportunities, teams, tasks and outcomes"]
]);
replace("sh/re9g7yxo", "Mandatory requirements covered: [list]\nAdvanced layer features: [list]\nRole-based views: [which roles]", "• Student and coordinator workspaces\n• Food + goodies filters use AND logic\n• Streaks, freezes and change-impact proposals\n• Role views: student, coordinator and admin");
replaceLines("sh/re9g7yxo", [
  ["Mandatory requirements covered: [list]", "Student and coordinator workspaces"],
  ["Advanced layer features: [list]", "Food + goodies filters use AND logic"],
  ["Role-based views: [which roles]", "Streaks, freezes and change-impact proposals\nRole views: student, coordinator and admin"]
]);

// Slide 4: Architecture & Data Flow
replace("sh/doj29oba", "Kaun Banega Codepati 2026 | Kinetex Lab × Notion", "Kaun Banega Codepati 2026 | CampusNext");
replace("sh/ih8ju9sn", "Frontend\n[React / Flutter / ...]", "Student web app\n[responsive HTML/CSS/JS]");
replaceLines("sh/ih8ju9sn", [["Frontend", "Student web app"], ["[React / Flutter / ...]", "[responsive HTML/CSS/JS]"]]);
replace("sh/i94r6xgz", "Backend / API\n[FastAPI / Node / ...]", "Backend / API\n[Node.js + auth routes]");
replaceLines("sh/i94r6xgz", [["[FastAPI / Node / ...]", "[Node.js + auth routes]"]]);
replace("sh/x8vaxsfe", "AI layer\n[LLM + RAG + extraction]", "Domain layer\n[discovery + plans + streaks]");
replaceLines("sh/x8vaxsfe", [["AI layer", "Domain layer"], ["[LLM + RAG + extraction]", "[discovery + plans + streaks]"]]);
replace("sh/g36tgryd", "Notion API\n[Databases + pages]", "Notion API\n[scoped records + sync]");
replaceLines("sh/g36tgryd", [["[Databases + pages]", "[scoped records + sync]"]]);
replace("sh/3ytsrmpw", "Databases & key relations (e.g. Event → Task → Member)\nPermissions / auth approach\nWhere AI output is labelled vs verified", "• Announcement → opportunity → save → team → task → outcome\n• Stable IDs, source revisions and visibility scopes\n• Authorization stays in the service layer, not in filtered views");
replaceLines("sh/3ytsrmpw", [
  ["Databases & key relations (e.g. Event → Task → Member)", "Announcement → opportunity → save → team → task → outcome"],
  ["Permissions / auth approach", "Stable IDs, source revisions and visibility scopes"],
  ["Where AI output is labelled vs verified", "Authorization stays in the service layer, not in filtered views"]
]);
replace("sh/fu9sn2p0", "Sync strategy & error handling\nSource citations / traceability\nTech stack & why", "• Idempotent retries prevent duplicate writes and credits\n• Notion edits create reviewable change proposals\n• Source links and update times support explainable answers");
replaceLines("sh/fu9sn2p0", [
  ["Sync strategy & error handling", "Idempotent retries prevent duplicate writes and credits"],
  ["Source citations / traceability", "Notion edits create reviewable change proposals"],
  ["Tech stack & why", "Source links and update times support explainable answers"]
]);

// Slide 5: Notion Integration & Innovation
replace("sh/l4bupwny", "Kaun Banega Codepati 2026 | Kinetex Lab × Notion", "Kaun Banega Codepati 2026 | CampusNext");
replace("sh/x4vedgvm", "Databases created / synced: [names]\nRead AND write operations: [examples]\nNotion is active in the workflow, not a static page\nLive-sync proof: [what we will show]", "• Operational records: announcements, opportunities, tasks, teams and outcomes\n• Planned writes: publish, accepted plans, memberships, activity and outcomes\n• Planned reads: authorized discovery, source links and change detection\n• Prototype today: local sample records; Notion health is explicit");
replaceLines("sh/x4vedgvm", [
  ["Databases created / synced: [names]", "Operational records: announcements, opportunities, tasks, teams and outcomes"],
  ["Read AND write operations: [examples]", "Planned writes: publish, accepted plans, memberships, activity and outcomes"],
  ["Notion is active in the workflow, not a static page", "Planned reads: authorized discovery, source links and change detection"],
  ["Live-sync proof: [what we will show]", "Prototype today: local sample records; Notion health is explicit"]
]);
replace("sh/58vehgvy", "Our unique idea: [1 line]\nAdvanced features built: [RAG, impact analysis, simulation...]\nAI output vs verified source: [how shown]\nCompared with existing tools: [gap we fill]", "• One path from campus notice to an accepted next action\n• Explainable discovery from interests, workload and requirements\n• TeamBridge shows only opted-in collaborators\n• Changes propose revised dates without overwriting personal edits");
replaceLines("sh/58vehgvy", [
  ["Our unique idea: [1 line]", "One path from campus notice to an accepted next action"],
  ["Advanced features built: [RAG, impact analysis, simulation...]", "Explainable discovery from interests, workload and requirements"],
  ["AI output vs verified source: [how shown]", "TeamBridge shows only opted-in collaborators"],
  ["Compared with existing tools: [gap we fill]", "Changes propose revised dates without overwriting personal edits"]
]);

// Slide 6: Prototype & Live Demo
replace("sh/ml07i9sv", "Kaun Banega Codepati 2026 | Kinetex Lab × Notion", "Kaun Banega Codepati 2026 | CampusNext");
replace("sh/pc76hkr2", "[Insert screenshot / GIF of the prototype]", "CampusNext interactive prototype\n\nStudent workspace: Today · Explore · Tasks · Teams · Profile\nCoordinator workspace: Overview · Review queue · Participation\n\nLocal sample data, saved in the browser");
replace("sh/u1kbu1ov", "1. Input arrives: [scenario]\n2. System structures it, syncs to Notion\n3. Role A takes action\n4. Role B sees update / asks a question\n5. Insight, alert or report\nDemo dataset: [synthetic / real]", "1. Explore and enable Food + Goodies\n2. Save Hack the Campus 2026 and review readiness\n3. Accept Ishita's invitation and take a task\n4. Complete a task and show the personal/buddy streak\n5. Review the deadline change and keep or edit the plan\n6. Record an outcome, then switch to coordinator");
replaceLines("sh/u1kbu1ov", [
  ["1. Input arrives: [scenario]", "1. Explore and enable Food + Goodies"],
  ["2. System structures it, syncs to Notion", "2. Save Hack the Campus 2026 and review readiness"],
  ["3. Role A takes action", "3. Accept Ishita's invitation and take a task"],
  ["4. Role B sees update / asks a question", "4. Complete a task and show the personal/buddy streak"],
  ["5. Insight, alert or report", "5. Review the deadline change and keep or edit the plan"],
  ["Demo dataset: [synthetic / real]", "6. Record an outcome, then switch to coordinator"]
]);

// Slide 7: Feasibility, Scalability & Next Steps
replace("sh/kzmdova1", "Kaun Banega Codepati 2026 | Kinetex Lab × Notion", "Kaun Banega Codepati 2026 | CampusNext");
replace("sh/a9ojq5kz", "Works with: [existing campus tools]\nSetup effort: [low / medium]\nCost: [APIs, hosting]", "• Runs today as a local Node.js prototype\n• No package install needed; sample data makes demos repeatable\n• Production needs authentication, scoped Notion access and retries");
replaceLines("sh/a9ojq5kz", [
  ["Works with: [existing campus tools]", "Runs today as a local Node.js prototype"],
  ["Setup effort: [low / medium]", "No package install needed; sample data makes demos repeatable"],
  ["Cost: [APIs, hosting]", "Production needs authentication, scoped Notion access and retries"]
]);
replace("sh/25ojml43", "From 1 club to whole campus\nMulti-team / multi-event\nPerformance & rate limits", "• Domain rules isolate discovery, plans, teams and streaks\n• Stable IDs and idempotency prevent duplicate records\n• Start with one campus pilot, then add institutions and connectors");
replaceLines("sh/25ojml43", [
  ["From 1 club to whole campus", "Domain rules isolate discovery, plans, teams and streaks"],
  ["Multi-team / multi-event", "Stable IDs and idempotency prevent duplicate records"],
  ["Performance & rate limits", "Start with one campus pilot, then add institutions and connectors"]
]);
replace("sh/eh4jil4r", "Next 30 days: [..]\nFuture features: [..]\nTeam ask / thank you", "• Now: validate the core journey with students and coordinators\n• Next: live Notion sync, OCR/extraction, auth and notifications\n• Measure activation, completion, team formation and useful discovery");
replaceLines("sh/eh4jil4r", [
  ["Next 30 days: [..]", "Now: validate the core journey with students and coordinators"],
  ["Future features: [..]", "Next: live Notion sync, OCR/extraction, auth and notifications"],
  ["Team ask / thank you", "Measure activation, completion, team formation and useful discovery"]
]);

const notes = [
  "Sources: CampusNext_PRD.md, CampusNext_System_Flow.md, CampusNext_UIUX.md. Team and college metadata were not provided, so bracketed fields remain for completion.",
  "Sources: CampusNext_PRD.md sections 1–4 and CampusNext_System_Flow.md sections 1–3. Claims describe the stated problem and target users, not measured pilot outcomes.",
  "Sources: CampusNext_PRD.md sections 1, 5–8 and CampusNext_System_Flow.md section 1. The workflow is the proposed product flow.",
  "Sources: CampusNext_PRD.md sections 9–10, CampusNext_System_Flow.md section 4, campusnext/README.md. The current artifact is a local interactive prototype; live Notion access is a production requirement, not a completed integration claim.",
  "Sources: CampusNext_PRD.md sections 7–10, CampusNext_System_Flow.md sections 6–7, campusnext/README.md. Prototype boundary: local sample records and explicit Notion-not-connected state.",
  "Sources: campusnext/README.md demonstration sequence and verification notes; campusnext/data.js synthetic demo records. The demo dataset is synthetic and the prototype persists locally in the browser.",
  "Sources: campusnext/README.md honest implementation boundary and CampusNext_PRD.md sections 12–13. Production work remains for authentication, scoped Notion sync, OCR/extraction, retries and notifications."
];
for (let i = 0; i < presentation.slides.items.length; i++) {
  presentation.slides.items[i].speakerNotes.textFrame.setText(notes[i]);
}

await (await PresentationFile.exportPptx(presentation)).save(candidatePath);
for (let i = 0; i < presentation.slides.items.length; i++) {
  const png = await presentation.slides.items[i].export({format:"png", scale:2});
  await fs.writeFile(path.join(renderDir, `slide-${i+1}.png`), new Uint8Array(await png.arrayBuffer()));
}
console.log(`Wrote ${candidatePath}`);
