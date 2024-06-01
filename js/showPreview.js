async function setupStartPreview(optionalClass = [], data = null, time = null) {
   ctx = PREVIEW_CTX;
   ctx.clearRect(0, 0, CVS.width, CVS.height);
   const { aryPtr, length } = create2dAryPointer(currentPlayingLevel.blocks);
   init(aryPtr, length);
   draw();

   const DATA = data || await getUserRank(currentPlayingLevel.id);

   const { userRank, ranks } = DATA;
   let tableRows = "";

   for (let i = 0; i < ranks.length; i++) {
      const [_, element] = ranks[i];
      tableRows += `<tr ${userRank === i ? 'class="me"' : ""}>
            <td>${i + 1}</td>
            <td>${element.fullName}</td>
            <td>${element.time}<span>s</span></td>
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

   isInOfTheGame = false;

   const levelId = currentPlayingLevel.id;

   showPreview.classList = [];
   showPreview.classList.add("active", ...optionalClass);
   
   animation.stop();
   $("#lvlNo").innerHTML = levelId;
   $("#levelCreatorName").innerHTML = levelId > 100 ? `@${currentPlayingLevel.creator}` : "";
   $("#lvlRank").innerHTML = userRank !== null ? userRank + 1 : "∞";
   $("#lvlTime").innerHTML = time !== null ? time : userRank !== null ? ranks[userRank][1].time : "∞" ;
}
