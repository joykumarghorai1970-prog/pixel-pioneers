import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCredentials, classifyRole, formatUserProfile, isRouteAllowed, sanitizeState} from './domain.js';
import {seedState} from './data.js';

test('credential validation enforces institutional email and minimum password length', () => {
  assert.equal(validateCredentials('', 'campus2026').valid, false);
  assert.match(validateCredentials('', 'campus2026').error, /email address is required/i);

  assert.equal(validateCredentials('not-an-email', 'campus2026').valid, false);
  assert.match(validateCredentials('not-an-email', 'campus2026').error, /valid institutional email/i);

  assert.equal(validateCredentials('student@campus.edu', '').valid, false);
  assert.match(validateCredentials('student@campus.edu', '').error, /password is required/i);

  assert.equal(validateCredentials('student@campus.edu', '12').valid, false);
  assert.match(validateCredentials('student@campus.edu', '12').error, /at least 4 characters/i);

  const ok = validateCredentials('Aarav@Campus.EDU ', ' campus2026 ');
  assert.equal(ok.valid, true);
  assert.equal(ok.email, 'aarav@campus.edu');
  assert.equal(ok.password, 'campus2026');
});

test('role classification maps coordinator indicators and defaults to student', () => {
  assert.equal(classifyRole('coordinator', 'dr.smriti@campus.edu'), 'coordinator');
  assert.equal(classifyRole('student', 'coordinator@campus.edu'), 'coordinator');
  assert.equal(classifyRole('student', 'admin-affairs@campus.edu'), 'coordinator');
  assert.equal(classifyRole('student', 'aarav.sharma@campus.edu'), 'student');
  assert.equal(classifyRole('student', 'maya.patel@student.campus.edu'), 'student');
});

test('user profile formatting assigns proper designations and handles custom student names', () => {
  const coordProfile = formatUserProfile('coordinator', 'coordinator@campus.edu');
  assert.equal(coordProfile.fullName, 'Dr. Smriti Rao');
  assert.equal(coordProfile.name, 'Smriti');
  assert.match(coordProfile.course, /Dean of Student Affairs/);

  const aaravProfile = formatUserProfile('student', 'aarav@campus.edu');
  assert.equal(aaravProfile.fullName, 'Aarav Sharma');
  assert.equal(aaravProfile.name, 'Aarav');

  const customProfile = formatUserProfile('student', 'priya.nair@campus.edu');
  assert.equal(customProfile.name, 'Priya.nair');
  assert.equal(customProfile.fullName, 'Priya.nair (Student)');
});

test('route authorization restricts coordinator routes to coordinator role', () => {
  assert.equal(isRouteAllowed('student', 'today'), true);
  assert.equal(isRouteAllowed('student', 'explore'), true);
  assert.equal(isRouteAllowed('student', 'tasks'), true);
  assert.equal(isRouteAllowed('student', 'coordinator/settings'), true); // Diagnostic settings allowed
  assert.equal(isRouteAllowed('student', 'coordinator/overview'), false);
  assert.equal(isRouteAllowed('student', 'coordinator/review'), false);
  assert.equal(isRouteAllowed('student', 'coordinator/opportunities'), false);

  assert.equal(isRouteAllowed('coordinator', 'coordinator/overview'), true);
  assert.equal(isRouteAllowed('coordinator', 'coordinator/review'), true);
  assert.equal(isRouteAllowed('coordinator', 'today'), true);
});

test('sanitizeState handles null, corrupted, or tampered localStorage structures', () => {
  const baseline = seedState();
  assert.deepEqual(sanitizeState(null, baseline), baseline);
  assert.deepEqual(sanitizeState(undefined, baseline), baseline);
  assert.deepEqual(sanitizeState('not-an-object', baseline), baseline);

  const tampered = {
    authenticated: 'yes',
    role: 'hacker',
    events: 'invalid-events-not-array',
    tasks: null
  };
  const sanitized = sanitizeState(tampered, baseline);
  assert.equal(sanitized.authenticated, true);
  assert.equal(sanitized.role, 'student'); // Restricted to student default
  assert.ok(Array.isArray(sanitized.events));
  assert.ok(Array.isArray(sanitized.tasks));
  assert.equal(sanitized.onboardingComplete, true);
});
