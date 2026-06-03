# todos

## ui

- [ ] deck show stack effect and in waste show top and previous 2 cards if applicable.
- [ ] animate card on undoLastMove.
- [ ] add lockCards amd keyCards.
- [ ] animate key card being added to lock and final unlocking lock card.

## fix

- [ ] fix category card colors.
- [x] when drag/drop card into column it as a slow animation.
- [ ] win state and go to next level.
- [ ] when restart level lock/key cards are not animating in and already exist in place.
- [ ] when animating dealing deck switch to right to left instead.
- [ ] in column stack if category card is on top show how many completed are in it.

## logic

- [ ] card counts
  - 5 columns (98 cards total).
    - col 1 = 5
    - col 2 = 6
    - col 3 = 7
    - col 4 = 8
    - col 5 = 9
    - deck = 63
    - moves = 196
  - 4 columns (64 cards total).
    - col 1 = 4
    - col 2 = 5
    - col 3 = 6
    - col 4 = 7
    - deck = 42
    - moves = 132
  - 3 columns (36 cards total).
    - col 1 = 3
    - col 2 = 4
    - col 3 = 5
    - deck = 24
    - moves = 72
- [ ] gamestore
  - [ ] hearts (lives left).
  - [ ] wins in a row.
  - [ ] how many attempts at a level. (so that difficulty can be changed)
- [ ] generate initial columns should prevent unwinnable games and easy games. e.g. never put all category cards at very bottom or top of columns or never put all in deck. should split category cards 50/50 between deck and columns. then at most could have one category at top and one at bottom of columns total and then rest can be random.

#####

MAKE HOME SCREEN WITH BUTTONS TO LEVELS AND CHANGE DIFFICULTY

#####
