# todos

## ui

- [ ] deck show stack effect and in waste show top and previous 2 cards if applicable.
- [ ] animate card on undoLastMove.
- [x] add lockCards and keyCards.
- [ ] animate key card being added to lock and final unlocking lock card.
- [ ] make card styles more 3d.
- [ ] make the card peek small when 10 or more cards instead of 7.
- [ ] make 3 column card size same as 4 column.
- [ ] in column stack if category card is on top show how many completed are in it

## fix

- [ ] fix category card colors.
- [x] when drag/drop card into column it as a slow animation.
- [ ] win state and go to next level.
- [ ] when restart level lock/key cards are not animating in and already exist in place.
- [ ] when animating dealing deck switch to right to left instead.
- [ ] in column stack if category card is on top show how many completed are in it.
- [ ] right column of foundation drag/release is very rigid. It's like the hitbox is lower center of card slot. same with trying to drop a card in empty column slot.

## logic

- [ ] gamestore
  - [ ] hearts (lives left).
  - [ ] wins in a row.
  - [ ] how many attempts at a level. (so that difficulty can be changed)

## level gen

- [ ] if a level fails redo it with same parameters, e.g. (numberOfColumns,difficulty,categories,locks). this should retry until successful. this should eliminate adding status and validationErrors to levels json. would then like to add the actual errors:
      errors: {
      levelNumber
      diffuculty // easy | medium | hard
      }[]
      // and remove breakdown
- [ ] check/or not allow same categories to be reused. can recycle categories after X amount(maybe 15) levels.
