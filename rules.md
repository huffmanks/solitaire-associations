# Solitaire Associations - Level Generation Rules

## Goal

Move all word cards into their matching category foundations.

A level is only valid if it is always solvable. Difficulty may affect accessibility and depth of cards, but must never create a gridlocked or unwinnable state.

---

# Card Types

## Word Cards

- Every word belongs to exactly one category.
- Word cards may stack only with other cards from the same category.
- Word cards may move to:
  - An empty column.
  - A column whose top card belongs to the same category.

## Category Cards

- One Category Card exists per category.
- Category Cards are used to start foundations.
- If a Category Card is on top of a column, no card may be placed on top of it.
- Category Cards may move:
  - To an empty column.
  - Onto a stack of the same category.
  - To an empty foundation.

- Foundations may only be started by Category Cards.

## Lock Cards

- Only levels with 4 or 5 columns may contain locks.
- Locks may never appear in the deck.
- Maximum locks per level: 3.
- Locked cards behave as normal cards after being unlocked.
- While locked:
  - Cannot move.
  - Cannot receive cards.

- Lock cards must never be placed deeper than column index 3 (4th card from top).

## Key Cards

- Keys may never appear in the deck.
- Keys may never start as the top card of a column.
- Keys are normal word or category cards with extra lock behavior.
- When a key becomes the top card of a column:
  - It is automatically revealed.
  - It automatically contributes to its associated lock.
  - It remains in play as a normal card.

- Keys are not consumed.

---

# Category Rules

Category sizes may only be:

- 3 words
- 4 words
- 5 words
- 8 words

Category sizes of 6 or 7 are not allowed.

---

# Foundation Rules

Foundation count always equals column count.

Examples:

- 3 columns = 3 foundations
- 4 columns = 4 foundations
- 5 columns = 5 foundations

Rules:

- Empty foundations only accept Category Cards.
- Foundations cannot be undone.
- Cards cannot be removed from foundations.

---

# Column Rules

Empty columns may accept any card or valid stack.

Cards may be stacked only with cards from the same category.

Category Cards on top of a stack block further stacking onto that stack.

---

# Lock and Key Rules

A lock may require 1-3 keys.

All requested locks and keys must exist.

Examples:

- 3 locks requiring 2 keys each = exactly 6 keys.
- Missing keys are never allowed.

A level may contain at most one key behind a lock.

If a key is behind a lock:

- The lock protecting it must be unlockable without that key.
- No circular dependencies are allowed.

Keys associated with the same lock may never touch each other.
Meaning they should never be directly above or below in a column.

---

# Category Accessibility Rules

The generator must prevent category deadlocks.

Rules:

- No more than 1-2 Category Cards may be hidden behind locks.
- No more than 1-2 Category Cards may be placed at the deepest positions in columns.
- Never allow 3 or more Category Cards to be simultaneously trapped behind locks and/or extreme burial.

The player must always have a path toward exposing additional categories.

---

# Difficulty Rules

Difficulty affects placement probabilities, not solvability. All difficulty modes must obey every generation and validation rule.

Global rules:

- Never place all Category Cards at the bottom of columns.
- Never place all Category Cards near the top of columns.
- Never place all Category Cards in the deck.
- Category Cards must be distributed across shallow, medium, deep, and deck positions.
- Difficulty should influence the distribution, but every level should contain a mix of accessibility levels.
- Difficulty should never create a gridlocked or unwinnable state.

## Easy

- Higher probability of Category Cards appearing near the tops of columns.
- Higher probability of Category Cards appearing in the deck.
- Lower probability of deeply buried Category Cards.
- Still maintain a mix of shallow, medium, deep, and deck placements.

## Medium

- Uses a controlled distribution, not a purely random distribution.
- Balanced mix of shallow, medium, deep, and deck placements.
- No strong bias toward either highly accessible or heavily buried Category Cards.

## Hard

- Uses the same controlled distribution model as Medium.
- Slightly increases the probability of deeper Category Card placements.
- Slightly decreases the probability of early Category Card placements.
- Still requires a healthy mix of shallow, medium, deep, and deck placements.
- Must continue to obey all accessibility, lock, key, and solvability rules.

---

# Starting Layouts

## 3 Columns

- Column 1 = 3 cards
- Column 2 = 4 cards
- Column 3 = 5 cards
- Deck = 24 cards
- Total cards = 36
- Moves = 72

Locks and keys are not allowed.

## 4 Columns

- Column 1 = 4 cards
- Column 2 = 5 cards
- Column 3 = 6 cards
- Column 4 = 7 cards
- Deck = 42 cards
- Total cards = 64
- Moves = 132

Locks and keys allowed.

## 5 Columns

- Column 1 = 5 cards
- Column 2 = 6 cards
- Column 3 = 7 cards
- Column 4 = 8 cards
- Column 5 = 9 cards
- Deck = 63 cards
- Total cards = 98
- Moves = 196

Locks and keys allowed.

---

# Solvability Requirements

Every generated level must pass validation before being accepted.

The validator must verify:

- Every Category Card is reachable.
- Every required key exists.
- Every lock is unlockable.
- No circular lock dependencies exist.
- No category becomes permanently inaccessible.
- No key becomes permanently inaccessible.
- No gridlocked state exists.
- All generation rules are honored.

If validation fails:

1. Discard the level.
2. Generate a new level.
3. Validate again.
4. Repeat until a valid level is produced.

A level should never be shipped unless it passes all validation checks.
