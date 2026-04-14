// Browser-like environment for testing
const fs = require('fs');
const path = require('path');

global.window = global;
global.document = {
  getElementById: () => ({ classList: { add: () => {}, remove: () => {} }, style: {}, innerHTML: '', textContent: '', appendChild: () => {} }),
  querySelectorAll: () => [],
  createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {} }),
  addEventListener: () => {},
  body: { appendChild: () => {} }
};
global.localStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = v; },
  removeItem(k) { delete this._data[k]; }
};
global.alert = () => {};
const _origLog = console.log;
const _origWarn = console.warn;
const _origError = console.error;
console.log = () => {};
console.warn = () => {};
console.error = () => {};

// Helper to restore console (call before running tests)
global.restoreConsole = () => {
  console.log = _origLog;
  console.warn = _origWarn;
  console.error = _origError;
};

function loadFile(p) {
  const code = fs.readFileSync(path.join(__dirname, '..', p), 'utf-8');
  eval.call(global, code);
}

// Load data
loadFile('data/teams.js');
loadFile('data/players.js');

// Load engines
loadFile('js/auction.js');
loadFile('js/simulation.js');

global.TEAMS = window.TEAMS;
global.PLAYERS = window.PLAYERS;
global.AuctionEngine = window.AuctionEngine;
global.SimulationEngine = window.SimulationEngine;

module.exports = { TEAMS: global.TEAMS, PLAYERS: global.PLAYERS };
