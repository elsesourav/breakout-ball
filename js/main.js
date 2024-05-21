function lvlEditor() {
   lvlMaker.draw(ctx, CVS.width, CVS.height);
}

function playGame() {
   playLevel.update();
   playLevel.draw(ctx, CVS.width, CVS.height);
}