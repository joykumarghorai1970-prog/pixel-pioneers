import test from 'node:test';
import assert from 'node:assert/strict';
import {seedState} from './data.js';

test('seedState returns a fully structured, market-ready workspace state', () => {
  const state = seedState();

  // Root flags
  assert.equal(typeof state.version, 'number');
  assert.equal(state.authenticated, false);
  assert.equal(state.onboardingComplete, true);
  assert.equal(state.role, 'student');

  // Profile
  assert.ok(state.profile);
  assert.equal(typeof state.profile.name, 'string');
  assert.equal(typeof state.profile.fullName, 'string');
  assert.ok(Array.isArray(state.profile.interests));
  assert.equal(typeof state.profile.reminders, 'boolean');

  // Collections
  assert.ok(Array.isArray(state.events));
  assert.ok(state.events.length >= 4);
  assert.ok(Array.isArray(state.tasks));
  assert.ok(Array.isArray(state.credits));
  assert.ok(Array.isArray(state.people));
  assert.ok(Array.isArray(state.invitations));
});

test('every event in seedState adheres to required opportunity schema', () => {
  const state = seedState();
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  for (const event of state.events) {
    assert.ok(event.id, 'event must have an id');
    assert.ok(event.title, `event ${event.id} must have a title`);
    assert.ok(event.shortTitle, `event ${event.id} must have a shortTitle`);
    assert.ok(event.category, `event ${event.id} must have a category`);
    assert.ok(event.club, `event ${event.id} must have an organizing club`);
    assert.match(event.date, dateRegex, `event ${event.id} date must match YYYY-MM-DD`);
    assert.match(event.deadline, dateRegex, `event ${event.id} deadline must match YYYY-MM-DD`);
    assert.ok(event.deadline <= event.date, `deadline must be on or before event date`);
    assert.equal(typeof event.published, 'boolean');
    assert.ok(Array.isArray(event.requirements), `event ${event.id} requirements must be array`);

    // Perks
    assert.ok(event.food, `event ${event.id} must define food perk`);
    assert.ok(['Provided', 'Not announced'].includes(event.food.status));
    assert.ok(event.goodies, `event ${event.id} must define goodies perk`);
    assert.ok(['Provided', 'Not announced'].includes(event.goodies.status));
  }
});

test('every task in seedState links to an existing event and has valid prerequisites', () => {
  const state = seedState();
  const eventIds = new Set(state.events.map(e => e.id));
  const taskIds = new Set(state.tasks.map(t => t.id));

  for (const task of state.tasks) {
    assert.ok(eventIds.has(task.eventId), `task ${task.id} links to unknown event ${task.eventId}`);
    assert.ok(task.title, `task ${task.id} must have a title`);
    assert.ok(task.due, `task ${task.id} must have a due date`);
    assert.ok(['upcoming', 'completed', 'review'].includes(task.status));
    if (task.dependency) {
      assert.ok(taskIds.has(task.dependency), `task ${task.id} dependency ${task.dependency} must exist`);
    }
  }
});
