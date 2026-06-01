# todos

## ui

- [ ] deck show stack effect and in waste show top and previous 2 cards if applicable.
- [ ] animate card flip from deck to waste.
- [ ] animate card on undoLastMove.
- [x] in foundation add total count to top card.
- [ ] animation for beginning level shuffle cards into place.

## fix

- [ ] fix category card colors.
- [ ] win state and go to next level.
  - [ ] needs to wait and allow animations to finish before showing modal.
  - [ ] fine tune the gameStore and logic for this.
- [ ] when dragging stack, shrink card peek to condense height.
- [ ] when dragging card/stack to foundation it can add an extra column. Should limit foundation column, should not allow adding additional columns.
- [ ] Generate initial columns should prevent unwinnable games and easy games. E.g. never put all category cards at very bottom or top of columns or never put all in deck. Should split category cards 50/50 between deck and columns. Then at most could have one category at top and one at bottom of columns total and then rest can be random.
