async function setupPreview(mode = "play", data = null, time = null) {
   stopBackgroundAudio();
   showPreview.classList = [];
   showPreview.classList.add("active");
   nextLevelButton.classList = [];

   ctx = PREVIEW_CTX;
   ctx.clearRect(0, 0, CVS.width, CVS.height);
   const { aryPtr, length } = create2dAryPointer(currentPlayingLevel.blocks);
   init(aryPtr, length);
   draw();
   const levelId = currentPlayingLevel.id;
   let rank, rankTable;

   if (mode !== "testing") {
      const DATA = data || (await getUserRank(levelId));
      rank = DATA.userRank;
      rankTable = DATA.ranks;

      if (base36ToBase10(levelId) < 100) {
         const id = Number(levelId);
         const rankElements = document.querySelectorAll("#localMode .local-user-rank");
         if (rank) updateProfileRank(levelId, rank, rankTable[rank - 1].time);
         if (rankElements[id - 1]) rankElements[id - 1].innerText = rank;
         if (rankElements[id] && tempUser.levelsRecord[id + 1] && !tempUser.levelsRecord[id + 1].completed) {
            nextLevelButton.classList.add("show");
         }
      }

      showPreview.classList.add(mode);

      let tableRows = "";

      for (let i = 0; i < rankTable.length; i++) {
         const { fullName, time } = rankTable[i];
         tableRows += `<tr ${rank - 1 === i ? 'class="me"' : ""}>
               <td>${i + 1}</td>
               <td>${fullName}</td>
               <td>${time}<span>s</span></td>
         </tr>`;
      }

      const leaderBoardHTML = `
            <table>
               <tr>
                  <td>Rank</td>
                  <td>Name</td>
                  <td>Time</td>
               </tr>
               ${tableRows}
            </table>`;

      rankingTable.innerHTML = leaderBoardHTML;
   }



   isInOfTheGame = false; // for Mouse Hide and Show

   animation.stop();
   lvlNo.innerHTML = levelId;
   levelCreatorName.innerHTML = base36ToBase10(levelId) > 100 ? `@${currentPlayingLevel.creator}` : "";
   lvlRank.innerHTML = rank !== null ? rank : "∞";
   lvlTime.innerHTML = time !== null ? time : rank !== null ? rankTable[rank - 1].time : "∞";
}
