# 1. Gameplay Rules

Only rules that describe what a player can do during play.

Examples:

## Goal

Move all word cards into matching category foundations.

## Word Cards

- Every word belongs to exactly one category.
- Word cards may move:
  - To an empty column.
  - Onto a column whose top card belongs to the same category.

## Category Cards

- Used to start foundations.
- May move:
  - To an empty column.
  - Onto a stack of the same category.
  - To an empty foundation.

- If a Category Card is on top of a column, no card may be placed on top of it.

## Foundations

- Empty foundations only accept Category Cards.
- Foundations cannot be undone.
- Cards cannot be removed from foundations.
- A completed foundation becomes empty again. Completion = Category Card + all words from that category.

## Columns

- Empty columns accept any card or valid stack.

## Stack Rules

- A stack is valid when every card belongs to the same category, regardless of card type. Category Cards may participate in movable stacks.
- Moving a stack counts as one move.
- Partial stack splitting is not allowed. Stacks always remain intact.

## Locks

- Locked cards:
  - Cannot move.
  - Cannot receive cards.

- After unlocking they behave normally.

## Keys

- When exposed:
  - Automatically reveal.
  - Automatically contribute to their lock.
  - Remain in play.

## Deck

- Draw 1 card.
- Draw consumes a move.
- Unplayable cards go to waste. The waste will eventually get recycled back into deck.

---

# 2. Level Generation Rules

Only rules the generator uses while building a level. Rules in Gameplay Rules do not constrain initial level construction unless explicitly referenced by Generation Rules.

Examples:

## Category Composition

- Category sizes:
  - 3
  - 4
  - 5
  - 8

- 6 and 7 are not allowed.

## Category Cards

- One Category Card exists per category.

## Foundations

- Foundation count equals column count.

## Columns

Cards are distributed so that each column contains one more card than the column to its left.

- 3 columns: Left to right, columns contain 4, 5, and 6 cards.
- 4 columns: Left to right, columns contain 5, 6, 7, and 8 cards.
- 5 columns: Left to right, columns contain 5, 6, 7, 8, and 9 cards.

## Locks

- Only 4- and 5-column levels may contain locks.
- Maximum 3 locks.
- Locks may never appear in deck.
- Locks only appear within the top four cards of a column.

## Keys

- Keys may never appear in deck.
- Keys may never start as top card of a column.

## Starting Layouts

All your column/deck/card count rules.

## Difficulty Rules

All your easy/medium/hard placement distribution rules.

## Category Accessibility Rules

All burial-depth and accessibility constraints.
Category Cards may appear at any depth unless restricted by another generation rule.

## Generation Invariants

- Every category completable.
- Every lock unlockable.
- Every key obtainable.
- At least one complete winning solution path must exist from the initial state and exist within the allotted move limit.
- No gridlocked state. A state is gridlocked if no sequence of legal moves can lead to a winning solution.

## Generator Freedom

- Generation is not required to obey player move restrictions.
- Generation may create layouts that could not arise through normal gameplay.
- Only solvability and validation requirements must be satisfied.
- Category Cards can start underneath Word Cards in the initial layout.

---

# 3. Validation Rules

Everything that must be checked after generation.

## Validator Checks

- Every lock unlockable.
- No circular lock dependencies.
- No category permanently inaccessible.
- No key permanently inaccessible.
- No gridlocked state exists.
- All generation rules honored.

## Validation Failure

1. Log failure.
2. Discard level.
3. Regenerate.
4. Revalidate.
5. Repeat until valid.
