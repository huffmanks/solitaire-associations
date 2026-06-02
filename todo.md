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

## logic

- [ ] columns
  - [ ] 5 columns (98 cards).
- [ ] gamestore
  - [ ] hearts (lives left).
  - [ ] wins in a row.
  - [ ] how many attempts at a level. (so that difficulty can be changed)
- [ ] generate initial columns should prevent unwinnable games and easy games. e.g. never put all category cards at very bottom or top of columns or never put all in deck. should split category cards 50/50 between deck and columns. then at most could have one category at top and one at bottom of columns total and then rest can be random.
