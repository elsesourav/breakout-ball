const htmlOnlineLevels = createOnlineLevels(MAX_PAGE_RENDER, onlineMode);

htmlOnlineLevels.forEach(([level], i) => {
   level.addEventListener("click", () => {
      wav.click.currentTime = 0;
      wav.click.play();
      currentGameMode = "online";
      currentPlayingLevel = window.onlineLevels[currentPageIndex * MAX_PAGE_RENDER + i];
      setupPreview();
   });
});

function setupOnlineLevel(eleAry, level) {
   const [mainEle, _ctx, count, id] = eleAry;
   mainEle.classList.add("show");
   count.innerText = level.playCount;
   id.innerText = level.id;

   ctx = _ctx;
   const { aryPtr, length } = create2dAryPointer(level.blocks);
   init(aryPtr, length);
   draw();
}

function setupOnlineLevels(searchData = "", current = currentPageIndex) {
   needUpdateOnlineLevels = false;
   currentPageIndex = current;
   let j = 0;
   let i = current * MAX_PAGE_RENDER;
   let n = Math.min(window.onlineLevels.length, (current + 1) * MAX_PAGE_RENDER);

   if (searchData.length === 5) {
      const findLevel = window.onlineLevels.find((e) => e.id === searchData);
      if (findLevel) {
         currentPlayingLevel = findLevel;
         setupOnlineLevel(htmlOnlineLevels[0], findLevel);
         j = 1;
      }
   } else {
      for (j = 0; i < n; i++, j++) {
         setupOnlineLevel(htmlOnlineLevels[j], window.onlineLevels[i]);
      }
   }

   for (; j < MAX_PAGE_RENDER; j++) {
      const [mainEle] = htmlOnlineLevels[j];
      mainEle.classList.remove("show");
   }
}

function setupLocalLevel(levels) {
   const htmlLocalLevels = createHtmlLevels(tempUser.numLocalLevels, levels, localMode);

   htmlLocalLevels.every(([lvl], i) => {
      if (!levels[i + 1]) return false;
      lvl.addEventListener("click", async () => {
         wav.click.currentTime = 0;
         wav.click.play();
         currentGameMode = "local";
         currentPlayingLevel = await getLevel(i + 1);
         setupPreview();
      });
      return true;
   });
}

const htmlCreateLevels = createUserLevels(MAX_LEVEL_CAN_CREATE, createMode);

async function setupCreateLevel() {
   let levels = window.onlineLevels.filter((e) => e.creator == tempUser.username);
   levels.push(...window.privateLevels);
   const len = (totalCreatedLevel = levels.length);
   let I, j;

   for (I = 0; I < len; I++) {
      const [mainEle, cvs, _ctx, count, id, setting, _privacy] = htmlCreateLevels[I];
      mainEle.classList.add("show");
      count.innerText = levels[I].playCount;
      id.innerText = levels[I].id;

      ctx = _ctx;
      const { aryPtr, length } = create2dAryPointer(levels[I].blocks);
      init(aryPtr, length);
      draw();

      const isPublic = window.onlineLevels.find((e) => e.id === levels[I].id) !== undefined;
      _privacy.classList.toggle("active", !isPublic);

      safeEventListener(
         setting,
         async ([i]) => {
            const data = await getUserRank(levels[i].id);
            M_lvlNo.innerText = levels[i].id;
            M_lvlRank.innerText = data.userRank !== null ? data.userRank + 1 : "∞";
            M_playCount.innerText = levels[i].playCount;

            const isPublic = window.onlineLevels.find((e) => e.id === levels[i].id) !== undefined;
            privacyModifier.checked = isPublic;

            ctx = MODIFIER_CTX;
            const { aryPtr, length } = create2dAryPointer(levels[i].blocks);
            init(aryPtr, length);
            draw();

            levelModifier.classList.add("active");

            safeEventListener(saveModifier, async () => {
               if (isPublic === privacyModifier.checked) {
                  // same position. don't need to change anything
                  levelModifier.classList.remove("active");
               } else {
                  const un = `${tempUser.username}/`;
                  const oldPath = `levels/${isPublic ? "online" : "private"}/${isPublic ? "" : un}${levels[i].id}`;
                  const newPath = `levels/${isPublic ? "private" : "online"}/${isPublic ? un : ""}${levels[i].id}`;

                  await moveData(oldPath, newPath);
                  _privacy.classList.toggle("active", isPublic);
                  levelModifier.classList.remove("active");
               }
            });

            safeEventListener(deleteLevel, async () => {
               const alert = new AlertHTML({
                  title: "Delete Level",
                  message: "Are you sure you want to delete this level?",
               });
               alert.show();
               alert.clickBtn1(() => {
                  alert.hide();
                  levelModifier.classList.remove("active");
               });
               alert.clickBtn2(async () => {
                  alert.hide();
                  const un = `${tempUser.username}/`;
                  const path = `levels/${isPublic ? "online" : "private"}/${isPublic ? "" : un}${levels[i].id}`;
                  await deleteData(path);
                  levelModifier.classList.remove("active");
               });
            });
         },
         [I]
      );

      safeEventListener(
         cvs,
         ([levels]) => {
            currentGameMode = "online";
            currentPlayingLevel = levels;
            setupPreview();
         },
         [levels[I]]
      );
   }

   for (j = I; j < MAX_LEVEL_CAN_CREATE; j++) htmlCreateLevels[j][0].classList.remove("show");
}
