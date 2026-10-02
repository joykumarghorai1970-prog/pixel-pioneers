# CampusNext UI UX Design Specification

Version 1.0 | 2 October 2026

## 1 Product direction

CampusNext helps students turn campus information into a clear next action. Its interface connects discovery, preparation, team formation and participation through live Notion records. This specification defines the navigation, screen layouts, interaction rules and interface states designers and developers should implement.

The design should feel calm, useful and approachable. Use readable cards, restrained teal accents, generous spacing and clear action labels. Prioritize current work and verified information. Personal and buddy streaks support progress; food and goodies are event-discovery attributes.

The primary student journey is **Discover > Save > Check readiness > Find collaborators when needed > Accept tasks > Participate > Record outcome**. Coordinators follow **Import > Review > Publish > Monitor > Update > Confirm outcomes**.

The approved product scope and business rules remain defined by CampusNext_PRD.md. Wireframes illustrate layout and hierarchy; their sample event and activity values are examples for the design.

**Document guide**

| Section | Page |
| --- | --- |
| Information architecture | 2 |
| Visual design system | 3 |
| Onboarding and Today | 4 |
| Explore and event discovery | 5 |
| Opportunity details and readiness | 6 |
| Tasks and Teams | 7 |
| Personal and buddy streaks | 8 |
| Coordinator review and publication | 9 |
| Ask, change review and Notion states | 10 |
| Responsive behavior and accessibility | 11 |
| Handoff and validation | 12 |

## 2 Information architecture

Student navigation has five persistent destinations: **Today, Explore, Tasks, Teams and Profile**. Use a left sidebar on desktop and a bottom navigation bar on mobile. Ask CampusNext opens from a persistent search control. Notifications open from a labeled bell control; Streaks opens from Today and Profile. Saved opportunities are available within Explore.

Coordinator navigation is a separate workspace: **Overview, Review queue, Opportunities, Teams, Participation and Settings**. Authorized users with both roles switch workspaces from their account menu; the current role remains visible.

| Screen ID | Screen | Main action |
| --- | --- | --- |
| S01 | Sign in and onboarding | Set up profile |
| S02 | Today | Open next action |
| S03 | Explore and saved opportunities | View opportunity |
| S04 | Opportunity details | Save opportunity |
| S05 | Readiness and preparation plan | Accept plan |
| S06 | Tasks and task detail | Complete task |
| S07 | Teams and collaborator discovery | Invite collaborator |
| S08 | Streaks and buddy detail | View qualifying action |
| S09 | Ask CampusNext | Ask a question |
| S10 | Notifications and change review | Review change |
| S11 | Profile and preferences | Save preferences |
| S12 | Participation and outcome submission | Submit evidence |
| C01 | Coordinator overview | Review pending work |
| C02 | Import and extraction review | Publish verified record |
| C03 | Opportunity management | Save approved changes |
| C04 | Participation and outcomes | Confirm evidence |
| A01 | Connection health | Retry synchronization |

## 3 Visual design system

Use Inter where available, with system sans-serif fallbacks. Start in a light theme. Define reusable tokens instead of screen-specific colors or spacing. Implement icons consistently; every status and icon-only action needs a readable label or accessible name.

| Token | Value | Use |
| --- | --- | --- |
| Primary | #0F766E | Primary actions and selected navigation |
| Primary soft | #CCFBF1 | Selected surfaces with dark text |
| Team accent | #4338CA | Collaboration highlights |
| Text | #152536 | Headings and main content |
| Secondary text | #516174 | Supporting information |
| Background | #F7F9FC | Page background |
| Surface | #FFFFFF | Cards and sheets |
| Control border | #64748B | Input and essential control boundaries |
| Decorative border | #CBD5E1 | Card separators |
| Success | #166534 | Confirmed and completed states |
| Warning | #92400E | Review needed and deadline changes |
| Error | #B91C1C | Failed or unavailable actions |
| Streak accent | #C2410C | Flame icon and streak highlights |

UI typography: page title 28/36 px; section heading 20/28 px; body 16/24 px; label 14/20 px; caption 12/18 px. Do not place important requirements or perk conditions only in captions. Use 4, 8, 12, 16, 24 and 32 px spacing; 12 px card radius; 8 px input/button radius. Buttons and tap targets are at least 44 by 44 px. Primary buttons use white text on the primary fill.

Use one main action per decision area. Secondary actions use outlined or text treatments. Disabled actions include a reason. Destructive or irreversible actions require a clearly worded confirmation; ordinary save actions use inline progress and success feedback.

## 4 Onboarding and Today

Onboarding first establishes the institution and authenticated role. Students select interests; skills and availability are optional. Teammate discovery and public streak sharing start off. Each preference explains its effect. Optional steps can be skipped, and the student can edit them later.

Today answers “What needs my attention?” Its content order is: page heading and search; compact personal/buddy streak summary; next actions and urgent changes; upcoming accepted deadlines; relevant opportunities. On desktop use a main action column and a narrower secondary column. On mobile place next actions before additional recommendations and collapse long lists behind View all.

Action cards show a concrete title, linked opportunity/team, deadline, why it matters, status and one action. Change cards show the previous and revised fact, its source and Review change. Recommendation cards explain why they match the student's recorded interests.

Empty copy: “Your next actions will appear here. Explore an opportunity to get started.” Loading preserves layout with skeletons. A refresh failure retains last-loaded cards and says when they were last updated. A new account does not show fabricated progress or an existing streak.

## 5 Explore and event discovery

Place search above filter controls for category, date range, organizing club and team need, followed by active-filter chips, result count and opportunity cards. Default results use explainable relevance; also offer Deadline soon and Event date. Saved is a clearly labeled subview. Search/filter state remains when returning from a detail page.

Food and Goodies are independent labeled toggles. Selecting both applies AND and displays “Must include both food and goodies.” Active filters are removable individually. Zero-result copy names the filters and offers Clear filters; the system never silently broadens the query.

Cards show event title, organizing club, category, event date, registration deadline, verified source status, food/goodies information and Save/View actions. An availability badge must remain beside its condition, for example “Lunch included” and “Welcome kit for first 100 registrants.” Paid benefits are labeled. Unknown stock is disclosed. Winner-only prizes appear as prizes and do not qualify as guaranteed goodies.

Not announced, Not provided and Needs verification are distinct states. Unverified perks do not pass verified availability filters. Cancelled, withdrawn, exhausted and closed-registration states remain readable and govern the relevant actions.

## 6 Opportunity details and readiness

The detail header contains title, organizer, verified source, last update, event date and registration deadline. Follow it with eligibility and requirements, readiness, team needs, perks and source documents. Desktop uses a main content column plus a sticky summary/action column. Mobile uses a single column with a sticky bottom action that does not obscure content.

Before saving, the primary action is Save opportunity. After saving, it becomes View preparation plan. Open registration is a separate external-link action and never implies successful submission. Track self-reported registration separately from coordinator-confirmed registration.

Readiness items use Complete, Missing or Unknown and explain their source. Avoid an unexplained readiness percentage. Missing information offers a specific action such as Add availability or Review eligibility. AI-generated preparation tasks are labeled Suggested. Students review tasks, dates and owners before Accept plan creates accepted work.

An unassigned task remains visibly Unassigned. A scheduling conflict identifies the overlapping activity and asks the student to review options. Changing a source deadline proposes revised personal task dates; it does not silently replace manual edits or completed work.

After registration or participation, Record outcome opens S12. Students select the claimed status, attach evidence or a deliverable and optionally add lessons learned. Show Self-reported, Awaiting verification, Confirmed or Needs more evidence separately. Submit preserves inputs during sync; confirmation belongs to the authorized coordinator. Access this screen from the opportunity and Profile activity history.

## 7 Tasks and Teams

Tasks separates My tasks and Shared tasks, with status filters for Upcoming, Blocked and Completed. Each task opens a detail screen showing owner, opportunity/project, due date, dependencies, evidence requirements and activity history. Completion follows the declared evidence/approval rule. Awaiting approval is distinct from Completed and from Synced.

Team screens show accepted members, open roles, pending invitations and linked project work. Invitations include the opportunity, proposed role and availability context. Invite does not create membership. Accept and Decline are explicit, equally understandable actions. A pending request has a cancel option; removal/withdrawal clearly describes its effect.

Collaborator discovery shows opted-in profile information and explains the relevant declared skills. It exposes no private task content. Skills are labeled Declared unless verified through an explicit source. Useful individual preparation continues while a team invitation is pending.

Empty states guide the next action: “No accepted team yet. Invite a collaborator for this opportunity.” A task list without accepted tasks offers Review suggested plan, not Complete task.

## 8 Personal and buddy streaks

Today shows a flame icon, count and Completed today/Action needed label. Detail shows personal and longest counts, seven-day history, today's credit, next badge and weekly freeze. Provide a text alternative; active, frozen, missed and pending days differ by label and shape as well as color.

Buddy setup uses Invite buddy, a Pending invitation state and explicit Accept/Decline controls. Acceptance starts a new pair at zero; permit one active buddy. End buddy relationship confirms the effect, preserves past history and enables a new invitation. Buddy detail shows the partner, pair count and contribution status; private activity remains access-controlled.

| State | Example copy | Action |
| --- | --- | --- |
| No streak | Complete a qualifying action to start | View tasks |
| Credited today | Today's action counted | View activity |
| Waiting for buddy | Your action counted and your buddy is pending | View buddy status |
| Frozen day | Your freeze protected the streak and the count paused | View rules |
| Streak ended | Your longest streak is saved and you can start again | View next task |
| Pending approval | Your contribution is awaiting approval | View contribution |

Rules beside the count specify one credit per campus day and one automatic freeze per Monday–Sunday week. Frozen days pause the count. A pair increments when both contribute; each missing buddy needs their own freeze. One freeze protects personal and buddy continuity for the same date. Display Asia/Kolkata and the refresh date. Delayed approval recalculates the recorded day and freeze history, with a short explanation.

Badges unlock at 3, 7, 14 and 30 credited days. Offer reduced motion and opt-in sharing. Extra task toggles earn no additional credit. Event perks remain independent unless their published conditions specify otherwise.

## 9 Coordinator review and publication

Overview prioritizes pending reviews, publication blockers, affected opportunities and participation requiring confirmation. Analytics label saved, self-reported registered, confirmed registered and confirmed attended separately.

The import screen accepts pasted text or a poster image and reports progress. Review places the source next to extracted fields on desktop. On mobile use Source and Extracted details tabs with the same review state. Keep the source accessible while correcting a value.

Fields include title, dates, timezone, venue, organizer, eligibility, requirements, registration link and food/goodies. Flag missing/conflicting values beside the field. Food/goodies each have independent status, cost, conditions, availability and verification fields. Do not convert an empty field into Not provided.

Save draft and Publish are separate actions. If publishing is unavailable, display the specific validation reason. After approval show Saving to Notion, then Published only after the operation succeeds. A failure preserves the corrected draft and offers Retry. Reimporting the same source shows a revision comparison rather than a second opportunity.

Participation review shows the submitted evidence, claimed status, source and confirmation controls. Coordinators see only records within their managed scope. Record changes preserve an audit trail.

## 10 Ask change review and Notion states

Ask CampusNext opens from global search. Starter prompts include “What must I finish this week?” and “What changed in my saved events?” Answers display source cards, update time and a clear separation between verified facts and suggested actions. Missing evidence produces an explicit unknown with an available next step. Generated tasks remain proposals until accepted.

Notifications group changes, invitations, accepted tasks and verification outcomes. Each item opens the relevant object, not a dead-end notification detail. Optional reminders have settings; important changes stay visible in Today. Avoid repeated notifications for the same source revision.

Change review presents Previous, Updated, Why it affects you and Proposed actions. Students can accept, edit or dismiss proposed task changes. Confirmed source facts refresh independently of that personal-plan decision.

| State | Student wording | Behavior |
| --- | --- | --- |
| Pending write | Saving to Notion | Keep submitted work and prevent duplicate action |
| Synced | Saved | Show confirmation only after acknowledgement |
| Failed write | Could not save yet | Retain inputs and offer Retry |
| Stale refresh | Showing information last updated at [time] | Preserve records and allow Refresh |
| Conflict | A newer version needs review | Show differences before replacement |
| Restricted | You do not have access to this record | Avoid exposing its private contents |

Keep integration credentials and technical errors in administrator diagnostics. Show source freshness where it helps a student judge information. Connection health provides status, last successful sync and authorized recovery actions.

## 11 Responsive behavior and accessibility

| Width | Layout |
| --- | --- |
| 360–767 px | Single column, 16 px side margins, bottom navigation, filter sheet and full-width detail screens |
| 768–1023 px | Two-column content where readable; navigation rail or drawer; review source available in a panel |
| 1024 px and above | 240 px sidebar, content max-width 1200 px, 24–32 px margins and secondary detail column |

Bottom navigation contains Today, Explore, Tasks, Teams and Profile. Streaks is accessible through Today/Profile and Ask through search. Sticky actions reserve content padding and safe-area space. Filters use a sheet with Apply and Clear on small screens; desktop changes can apply immediately. Preserve selected filters and scroll position on Back.

Target WCAG 2.2 AA. Normal text contrast must reach 4.5:1; essential control/focus boundaries must reach 3:1. Use semantic headings, labeled fields and buttons, keyboard focus, live status announcements and text equivalents for icons. Dialogs trap focus and return it to their trigger. Errors are inline and summarized when a form has several failures. Support 200 percent zoom, reduced motion and keyboard alternatives to dragging.

Every main screen needs loading, empty, error, restricted-access and stale-data states. Distinguish no matching results from no records and from a failed refresh. Test at 360 px without page-level horizontal overflow and ensure fixed controls do not hide focused fields.

Accessibility reference: W3C WCAG 2.2 Quick Reference, https://www.w3.org/WAI/WCAG22/quickref/ . These are implementation targets, not a claim that an unbuilt interface is compliant.

## 12 Handoff and validation

Design handoff includes the screen inventory, reusable tokens, navigation patterns, wireframe layouts, interaction/state specifications and PRD requirement references. Use screen IDs in design files and implementation tickets. Components include opportunity/action cards, source labels, perk badges, filter controls, readiness rows, tasks, invitation cards, streak history, review fields and sync indicators.

| Coverage | PRD requirements |
| --- | --- |
| Onboarding and preferences | FR-01 |
| Import review and publication | FR-02, FR-03 |
| Explore relevance and perks | FR-04, FR-05, FR-12 |
| Readiness tasks and change impact | FR-06, FR-09, FR-10 |
| Source-grounded questions | FR-07 |
| Teams and consent | FR-08 |
| Personal and buddy streaks | FR-11 |
| Notion feedback and notifications | FR-13, FR-14 |
| Participation and analytics | FR-15 |

Run moderated usability sessions with students and coordinators. Ask participants to find an event with both food and goodies, understand a limited-kit condition, save and prepare for it, accept a collaborator invitation, complete a qualifying task, explain a frozen streak day and review a changed deadline. Coordinators must correct an extracted unknown field and recover from a failed publish without losing work.

Proposed validation targets: at least 4 of 5 pilot participants complete each core journey without facilitator intervention; no participant mistakes an unverified perk for a confirmed offer or a save action for registration; keyboard and mobile users can complete the same core tasks. Revise targets with a larger pilot, and report observed results separately from these goals.

Before implementation sign-off, verify required states, source links, AND filtering, consent, explicit task ownership, streak/freezes, pending versus saved feedback, source-change review and mobile reflow. Check implementation against CampusNext_PRD.md and CampusNext_System_Flow.md.
