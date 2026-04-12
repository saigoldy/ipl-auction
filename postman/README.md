# IPL Auction Admin Scripts

## Online Mode (Postman)

### Setup
1. Import `ipl-auction-admin.postman_collection.json` into Postman
2. Variables are pre-filled:
   - `supabase_url` — your Supabase project URL
   - `anon_key` — public anon key (already included)
   - `room_code` — change to target room (e.g. `4JUGVT`)
   - `new_budget_lakhs` — budget in **lakhs** (`12500` = ₹125 Cr)

### Available Requests

| # | Request | Purpose |
|---|---------|---------|
| 1 | List all rooms | See all active rooms |
| 2 | Get room by code | Inspect one room's settings |
| 3 | **Change room budget** | Update default budget for a room |
| 4 | List players in a room | See who's in a room |
| 5 | Delete room | Clean up a stuck room (host only) |
| 6 | Reset room status | Unstick a stuck auction |

### Change Budget Example
Set `room_code` = `4JUGVT` and `new_budget_lakhs` = `20000` (= ₹200 Cr), then run **Request #3**.

**Important:**
- Budget is in **lakhs**, not crores. `12500` = ₹125 Cr, `20000` = ₹200 Cr
- Only works for rooms in `waiting` or `picking_teams` status
- Once auction starts, team budgets are in the host's browser memory — cannot be changed remotely

---

## Offline Mode (Browser Console)

Postman cannot access browser `localStorage`. Use these scripts instead:

### Open Console
1. Open the app in your browser
2. Press **F12** → **Console** tab

### Scripts

**A) Change one team's budget:**
```javascript
(() => {
  const save = JSON.parse(localStorage.getItem('ipl_auction_save_v1'));
  const teamId = 'MI';      // change to target team (MI, CSK, RCB, etc.)
  const newBudget = 20000;  // in lakhs — 20000 = ₹200 Cr
  if (save && save.teamStates[teamId]) {
    save.teamStates[teamId].budget = newBudget;
    localStorage.setItem('ipl_auction_save_v1', JSON.stringify(save));
    console.log(teamId + ' budget set to ₹' + (newBudget/100) + ' Cr');
    location.reload();
  }
})();
```

**B) Change ALL teams' budgets:**
```javascript
(() => {
  const save = JSON.parse(localStorage.getItem('ipl_auction_save_v1'));
  const newBudget = 15000;
  if (save) {
    Object.keys(save.teamStates).forEach(tid => {
      save.teamStates[tid].budget = newBudget;
    });
    localStorage.setItem('ipl_auction_save_v1', JSON.stringify(save));
    location.reload();
  }
})();
```

**C) View current budgets:**
```javascript
(() => {
  const save = JSON.parse(localStorage.getItem('ipl_auction_save_v1'));
  if (save) {
    Object.entries(save.teamStates).forEach(([tid, s]) => {
      console.log(tid + ': ₹' + (s.budget/100).toFixed(2) + ' Cr (' + s.filled + '/25)');
    });
  }
})();
```

**D) Clear saved game:**
```javascript
localStorage.removeItem('ipl_auction_save_v1'); location.reload();
```

---

## Live Game Instance Budget Change

To change budget **during an in-progress auction or tournament** (affects only this running game instance):

**E) Change a team's budget LIVE (during auction):**
```javascript
(() => {
  const teamId = 'MI';      // target team
  const newBudget = 20000;  // in lakhs
  const states = AuctionEngine.getAllTeamStates();
  if (states[teamId]) {
    states[teamId].budget = newBudget;
    console.log(teamId + ' budget is now ₹' + (newBudget/100) + ' Cr');
    // Trigger UI refresh
    if (window.App) document.querySelector('.teams-budget-bar')?.click();
  }
})();
```

**F) Add budget to a team LIVE:**
```javascript
(() => {
  const teamId = 'MI';
  const bonusCr = 50;  // add 50 Cr
  const states = AuctionEngine.getAllTeamStates();
  if (states[teamId]) {
    states[teamId].budget += bonusCr * 100;
    console.log(teamId + ' now has ₹' + (states[teamId].budget/100) + ' Cr');
  }
})();
```

**Notes for online:**
- Run **E** or **F** in the **host's** browser console (host is authoritative)
- Non-host players will see the updated budget on the next bid/sold broadcast
- The change only lasts for this game instance — not persisted to DB

