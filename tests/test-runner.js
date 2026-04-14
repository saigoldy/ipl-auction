// Simple unit test runner — no dependencies
// Run with: node tests/test-runner.js

let passed = 0, failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  \x1b[32m✓\x1b[0m ' + name);
  } catch (e) {
    failed++;
    failures.push({ name, error: e.message });
    console.log('  \x1b[31m✗\x1b[0m ' + name);
    console.log('    \x1b[31m' + e.message + '\x1b[0m');
  }
}

function describe(name, fn) {
  console.log('\n\x1b[36m' + name + '\x1b[0m');
  fn();
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) throw new Error(`Expected ${expected}, got ${actual}`);
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected))
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toBeLessThan: (n) => {
      if (!(actual < n)) throw new Error(`Expected ${actual} < ${n}`);
    },
    toBeGreaterThan: (n) => {
      if (!(actual > n)) throw new Error(`Expected ${actual} > ${n}`);
    },
    toBeGreaterThanOrEqual: (n) => {
      if (!(actual >= n)) throw new Error(`Expected ${actual} >= ${n}`);
    },
    toBeLessThanOrEqual: (n) => {
      if (!(actual <= n)) throw new Error(`Expected ${actual} <= ${n}`);
    },
    toBeTruthy: () => {
      if (!actual) throw new Error(`Expected truthy, got ${actual}`);
    },
    toBeFalsy: () => {
      if (actual) throw new Error(`Expected falsy, got ${actual}`);
    },
    toContain: (item) => {
      if (!actual.includes(item)) throw new Error(`Expected to contain ${item}`);
    },
    toHaveLength: (n) => {
      if (actual.length !== n) throw new Error(`Expected length ${n}, got ${actual.length}`);
    }
  };
}

module.exports = { test, describe, expect, summary: () => {
  console.log('\n\x1b[1m' + '='.repeat(50) + '\x1b[0m');
  console.log(`\x1b[32m${passed} passed\x1b[0m, \x1b[31m${failed} failed\x1b[0m`);
  if (failed > 0) {
    console.log('\n\x1b[31mFailures:\x1b[0m');
    failures.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
    process.exit(1);
  }
  process.exit(0);
}};
