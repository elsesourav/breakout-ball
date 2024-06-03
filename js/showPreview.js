async function setupPreview(mode = "play", data = null, time = null) {
   showPreview.classList = [];

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
         const rankElements = document.querySelectorAll("#localMode .local-user-rank");
         const info = getUserInfo();
         
         if (rankElements[Number(levelId) - 1]) rankElements[Number(levelId) - 1].innerText = rank + 1;
         if (info.levelsRecord[levelId] && info.levelsRecord[levelId].completed) {
            info.levelsRecord[levelId].rank = rank + 1;
            await userProfileUpdate(info);  
         }
      }

      let tableRows = "";

      for (let i = 0; i < rankTable.length; i++) {
         const { fullName, time } = rankTable[i];
         tableRows += `<tr ${rank === i ? 'class="me"' : ""}>
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

      $("#rankingTable").innerHTML = leaderBoardHTML;
   }

   showPreview.classList.add(mode);

   isInOfTheGame = false; // for Mouse Hide and Show

   animation.stop();
   $("#lvlNo").innerHTML = levelId;
   $("#levelCreatorName").innerHTML = base36ToBase10(levelId) > 100 ? `@${currentPlayingLevel.creator}` : "";
   $("#lvlRank").innerHTML = rank !== null ? rank + 1 : "∞";
   $("#lvlTime").innerHTML = time !== null ? time : rank !== null ? rankTable[rank].time : "∞";
}
