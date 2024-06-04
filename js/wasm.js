let init, setup, draw, update;
let moveLeft, moveRight, moveTarget, moveDirect, drawBlockOnly, drawOutline;
let makerSetup, makerInit, makerDraw;
let makerAddBlock, makerRemoveBlock, makerHoverBlock;

onload = () => {
   Module.onRuntimeInitialized = async () => {
      setup = Module.cwrap("setup", null, [
         "number",
         "number",
         "number",
         "number",
         "number",
         "number",
         "number",
         "number",
         "number",
         "number",
      ]);
      init = Module.cwrap("init", null, ["number", "number"]);
      draw = Module.cwrap("draw", null, []);
      update = Module.cwrap("update", null, []);
      moveLeft = Module.cwrap("moveLeft", null, []);
      moveRight = Module.cwrap("moveRight", null, []);
      moveTarget = Module.cwrap("moveTarget", "number", []);
      moveDirect = Module.cwrap("moveDirect", "number", []);
      drawBlockOnly = Module.cwrap("drawBlockOnly", null, []);
      drawOutline = Module.cwrap("drawOutline", null, []);

      makerSetup = Module.cwrap("makerSetup", null, ["number", "number", "number", "number", "number"]);
      makerInit = Module.cwrap("makerInit", null, ["number", "number"]);
      makerDraw = Module.cwrap("makerDraw", null, []);
      makerAddBlock = Module.cwrap("makerAddBlock", null, ["number", "number", "number"]);
      makerRemoveBlock = Module.cwrap("makerRemoveBlock", null, ["number", "number"]);
      makerHoverBlock = Module.cwrap("makerHoverBlock", null, ["number", "number", "number"]);

      function wait(milliseconds) {
         return new Promise((resolve) => setTimeout(resolve, milliseconds));
      }

      const links = [
         `./icons/css/font.css`,
         `./icons/css/icon.css`,
         `./css/home.css`,
         `./css/form.css`,
         `./css/pages.css`,
         `./css/showPreview.css`,
         `./css/gameDesigner.css`,
         `./css/level.css`,
         `./css/profile.css`,
         `./css/modifier.css`,
      ];

      const scripts = [
         `./js/config.js`,
         `https://www.gstatic.com/firebasejs/8.6.0/firebase-app.js`,
         `https://www.gstatic.com/firebasejs/8.6.0/firebase-auth.js`,
         `https://www.gstatic.com/firebasejs/8.6.0/firebase-database.js`,
         `./js/global.js`,
         `./js/alert.js`,
         `./js/form.js`,
         `./js/createImage.js`,
         `./js/levelMaker.js`,
         `./js/pages.js`,
         `./js/utils.js`,
         `./js/elements.js`,
         `./js/audio.js`,
         `./js/functions.js`,
         `./js/setup.js`,
         `./js/db.js`,
         `./js/showPreview.js`,
         `./js/eventListener.js`,
         `./js/main.js`,
      ];

      const html = `
         <div id="gameMode">
            <!--==============================
                    Header (Navigation)
            ===============================-->
            <header id="selectMode">
               <div class="mode active">
                  <p>Local</p>
               </div>
               <div class="mode">
                  <p>Online</p>
               </div>
               <div class="mode">
                  <p>Create</p>
               </div>
               <div class="mode">
                  <p>Profile</p>
               </div>
               <div class="move"></div>
            </header>
            <!--==============================
                     Navigation Body
            ===============================-->
            <div id="modeType">
               <div id="localMode" class="map"></div>
               <div class="map extra" id="onlineMap">
                  <div class="top">
                     <div class="box">
                        <i class="sbi-search"></i>
                        <input
                           type="text"
                           id="searchInput"
                           placeholder="Search Level"
                           spellcheck="false"
                           autocomplete="off"
                        />
                     </div>
                  </div>
                  <div id="onlineMode" class="inner"></div>
                  <div id="pages"></div>
               </div>
               <div class="map extra" id="userCreateMap">
                  <div class="top">
                     <div class="box" id="createLevel">
                        <i class="sbi-plus1"></i>
                        <p>Create a Level</p>
                     </div>
                  </div>
                  <div id="createMode" class="inner"></div>
               </div>
               <div class="map active profile">
                  <div class="user">
                     <div class="icon"><i class="sbi-user1"></i></div>
                     <div class="name">
                        <p id="fullName">Your Name</p>
                        <p id="username">@username</p>
                     </div>
                  </div>
                  <br />
                  <div class="option">
                     <i class="sbi-volume-medium"></i>
                     <div class="seek-bar">
                        <input
                           id="volumeInput"
                           type="range"
                           min="0"
                           max="1"
                           step="0.01"
                           value="1"
                        />
                     </div>
                  </div>
                  <div class="option">
                     <i class="sbi-vibration"></i>
                     <p>Vibrate</p>
                     <div class="switch active" id="vibrateOnOff">
                        <div class="inner">
                           <div class="thumb"></div>
                        </div>
                     </div>
                  </div>
                  <div class="option gyro-on-off">
                     <i class="sbi-screen-rotation"></i>
                     <p>Gyroscope</p>
                     <div class="switch active" id="gyroOnOff">
                        <div class="inner">
                           <div class="thumb"></div>
                        </div>
                     </div>
                  </div>
                  <div class="option gyro-sen">
                     <i class="sbi-screen-rotation"></i>
                     <div class="seek-bar">
                        <input
                           id="gyroSenInput"
                           type="range"
                           min="0.05"
                           max="0.7"
                           step="0.01"
                           value="0.4"
                        />
                     </div>
                  </div>
                  <div id="signOut"><p>Sign Out</p></div>
                  <a href="https://github.com/elsesourav" id="copyright"
                     >&copy;SouravBarui2024</a
                  >
               </div>
            </div>
         </div>

         <!--==============================
                     Main Canvas
         ===============================-->
         <canvas id="mainCanvas" class=""></canvas>

         <!--=============================================
           Game Status(Health, time, Game Over, Game Win)
         ================================================-->
         <div id="showGameStatus" class="">
            <div id="showHealths" class="">
               <i class="sbi-heart"></i>
               <i class="sbi-heart"></i>
               <i class="sbi-heart"></i>
            </div>
            <div id="showCountDowns" class="">
               <span><p>Level Win!</p></span>
               <span><p>Game Over!</p></span>
               <span><p>1</p></span>
               <span><p>2</p></span>
               <span><p>3</p></span>
            </div>
            <div id="showTime" class="">
               <p id="showTimeUsed">0</p>
               <span>s</span>
            </div>
         </div>

         <!--====================================================
               User Level Modify (Public, Private and Delete) 
         ======================================================-->
         <div id="levelModifier" class="">
            <div class="btn" id="closeModifier">
               <i class="sbi-cross1"></i>
            </div>
            <div class="inner">
               <div class="cvs">
                  <canvas id="cvsModifier"></canvas>
               </div>
               <div class="lvl-details">
                  <div class="flex selected-lvl">
                     <span>Level</span>
                     <p id="M_lvlNo">1</p>
                  </div>
                  <div class="flex rank">
                     <span>Your Rank</span>
                     <p id="M_lvlRank">∞</p>
                  </div>
                  <div class="flex time">
                     <span class="sbi-play-circle"></span>
                     <p id="M_playCount">∞</p>
                  </div>
               </div>
               <div class="switch-button">
                  <input
                     class="switch-button-checkbox"
                     type="checkbox"
                     name="privacy"
                     id="privacyModifier"
                  />
                  <label class="switch-button-label" for="privacy">
                     <span class="switch-button-label-span">Private</span>
                  </label>
               </div>
               <div class="buttons">
                  <button class="btn" id="deleteLevel">
                     <i class="sbi-trash"></i>
                  </button>
                  <button class="btn" id="saveModifier">
                     <i class="sbi-save2"></i>
                  </button>
               </div>
            </div>
         </div>

         <!--==============================
                  Game Preview
         ===============================-->
         <div id="showPreview" class="">
            <button id="previewClose">
               <i class="sbi-arrow-left2"></i>
            </button>

            <div class="rapper">
               <div class="canvas-and-lvl-details">
                  <canvas id="preview"></canvas>
                  <div class="lvl-details">
                     <div class="flex selected-lvl">
                        <p>Level</p>
                        <div id="lvlNo">1</div>
                     </div>
                     <div class="flex rank">
                        <p>Your Rank</p>
                        <div id="lvlRank">∞</div>
                     </div>
                     <div class="flex time">
                        <i class="sbi-stopwatch1"></i>
                        <div>
                           <p id="lvlTime">∞</p>
                           <span>s</span>
                        </div>
                     </div>
                  </div>
               </div>
               <div class="btn">
                  <span id="levelCreatorName"><small>@</small>sourav</span>
                  <button id="startButton">
                     <p class="play">START</p>
                     <p class="play">PLAY AGAIN</p>
                  </button>
                  <button id="nextLevelButton">
                     <i class="sbi-double-arrow"></i>
                  </button>
                  <button id="homeButton">
                     <i class="sbi-home"></i>
                  </button>
               </div>
               <div class="leaderboard">
                  <div class="title">
                     <i class="sbi-trophy2"></i>
                     <p>Players Ranking</p>
                  </div>
                  <div class="ranking-table" id="rankingTable"></div>
               </div>
            </div>
         </div>

         <!--==============================
               Level Create Options
         ===============================-->
         <div id="levelDesigner" class="">
            <div class="selection one">
               <p class="tag">BLOCKS</p>
               <div class="options">
                  <div class="option active">
                     <div class="block"><span>1</span></div>
                     <div class="tool-tip-text">
                        <i class="sbi-info-with-circle">
                           Hit Points(HP) <b>1</b></i
                        >
                        <i class="sbi-keyboard"> SPACE+1</i>
                     </div>
                  </div>
                  <div class="option">
                     <div class="block"><span>2</span></div>
                     <div class="tool-tip-text">
                        <i class="sbi-info-with-circle">
                           Hit Points(HP) <b>2</b></i
                        >
                        <i class="sbi-keyboard"> SPACE+2</i>
                     </div>
                  </div>
                  <div class="option">
                     <div class="block"><span>3</span></div>
                     <div class="tool-tip-text">
                        <i class="sbi-info-with-circle">
                           Hit Points(HP) <b>3</b></i
                        >
                        <i class="sbi-keyboard"> SPACE+3</i>
                     </div>
                  </div>
                  <div class="option">
                     <div class="block"><span>4</span></div>
                     <div class="tool-tip-text">
                        <i class="sbi-info-with-circle">
                           Hit Points(HP) <b>4</b></i
                        >
                        <i class="sbi-keyboard"> SPACE+4</i>
                     </div>
                  </div>
                  <div class="option">
                     <div class="block"><span>5</span></div>
                     <div class="tool-tip-text">
                        <i class="sbi-info-with-circle">
                           Hit Points(HP) <b>5</b></i
                        >
                        <i class="sbi-keyboard"> SPACE+5</i>
                     </div>
                  </div>
               </div>
            </div>
            <div class="selection two">
               <div class="names">
                  <p class="tag">WALL</p>
                  <p class="tag">ERASER</p>
               </div>
               <div class="options">
                  <div class="option">
                     <div class="block"><span></span></div>
                     <div class="tool-tip-text">
                        <i class="sbi-info-with-circle">
                           Hit Points(HP) <b>∞</b></i
                        >
                        <i class="sbi-keyboard"> SPACE+W</i>
                     </div>
                  </div>
                  <div class="option">
                     <div class="block eraser">
                        <span><i class="sbi-gavel1"></i></span>
                     </div>
                     <div class="tool-tip-text">
                        <i class="sbi-info-with-circle"> Remove Block & Wall</i>
                        <i class="sbi-keyboard"> SPACE+E</i>
                     </div>
                  </div>
               </div>
            </div>

            <div class="buttons one">
               <button class="btn" id="undoBtn">
                  <i class="sbi-undo1"></i>
                  <div class="tool-tip-text">
                     <i class="sbi-info-with-circle"> Undo Edit</i>
                     <i class="sbi-keyboard"> SPACE+Z</i>
                  </div>
               </button>
               <button class="btn" id="redoBtn">
                  <i class="sbi-undo1 rotate"></i>
                  <div class="tool-tip-text">
                     <i class="sbi-info-with-circle"> Redo Edit</i>
                     <i class="sbi-keyboard"> SPACE+Y</i>
                  </div>
               </button>
               <button class="btn" id="makeTesting">
                  <i class="sbi-play-circle"></i>
                  <div class="tool-tip-text">
                     <i class="sbi-info-with-circle"> Run Level</i>
                     <i class="sbi-keyboard"> SPACE+T</i>
                  </div>
               </button>
            </div>

            <div class="buttons two">
               <div class="switch-button">
                  <input
                     class="switch-button-checkbox"
                     type="checkbox"
                     name="privacy"
                     id="privacy"
                     checked
                  />
                  <label class="switch-button-label" for="privacy">
                     <span class="switch-button-label-span">Private</span>
                  </label>
               </div>
               <button class="btn" id="saveBtn">
                  <i class="sbi-save2"></i>
                  <div class="tool-tip-text">
                     <i class="sbi-info-with-circle"> Save Level</i>
                     <i class="sbi-keyboard"> SPACE+S</i>
                  </div>
               </button>
               <button class="btn" id="closeBtn">
                  <i class="sbi-sign-out"></i>
                  <div class="tool-tip-text">
                     <i class="sbi-info-with-circle"> Close Making</i>
                     <i class="sbi-keyboard"> SPACE+C</i>
                  </div>
               </button>
            </div>
         </div>
         <!--==============================
                  Alert Window
         ===============================-->
         <div id="floatingInputShow" class="floating-window-outer"></div>
         `;

      const audiosHtml = `
      <audio src="./src/audio/click.wav" id="click"></audio>
      <audio src="./src/audio/block-hit.wav" id="block-hit"></audio>
      <audio src="./src/audio/side-hit.wav" id="side-hit"></audio>
      <audio src="./src/audio/damage.wav" id="damage"></audio>
      <audio src="./src/audio/win.wav" id="win"></audio>
      <audio src="./src/audio/game-over.wav" id="game-over"></audio>
      <audio src="./src/audio/bg0.wav" id="bg0"></audio>
      <audio src="./src/audio/bg1.wav" id="bg1"></audio>`;

      document.body.innerHTML += audiosHtml;

      await wait(20);

      document.getElementById("main").innerHTML += html;

      await wait(20);

      for (let i = 0; i < links.length; i++) {
         const link = document.createElement("link");
         link.rel = "stylesheet";
         link.href = links[i];
         await wait(20);
         document.head.appendChild(link);
      }

      for (let i = 0; i < scripts.length; i++) {
         const script = document.createElement("script");
         script.src = scripts[i];
         await wait(20);
         document.head.appendChild(script);
      }

      if (window.DeviceOrientationEvent) {
         window.addEventListener("deviceorientation", (e) => {
            if (!tempUser.isGyroActive || !touchForcedUse) return;
            const s = (1 - tempUser.gyroSensitivity) * GYRO_RANGE;
            const p = map(e.gamma, -s, s, CVS_W * -0.2, CVS_W + CVS_W * 0.2);
            moveDirect(p);
         });
      }
   };
};
