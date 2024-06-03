let init, setup, draw, update;
let moveLeft, moveRight, moveTarget, moveDirect, drawBlockOnly, drawOutline;
let makerSetup, makerInit, makerDraw;
let makerAddBlock, makerRemoveBlock, makerHoverBlock;

window.onload = () => {
   Module.onRuntimeInitialized = () => {
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

      const scriptsSrc = [
         `./js/alert.js`,
         `./js/levels.js`,
         `./js/config.js`,
         `./js/global.js`,
         `./js/createImage.js`,
         `./js/pages.js`,
         `./js/form.js`,
         `https://www.gstatic.com/firebasejs/8.6.0/firebase-app.js`,
         `https://www.gstatic.com/firebasejs/8.6.0/firebase-auth.js`,
         `https://www.gstatic.com/firebasejs/8.6.0/firebase-database.js`,
         `./js/utils.js`,
         `./js/db.js`,
         `./js/levelMaker.js`,
         `./js/setup.js`,
         `./js/showPreview.js`,
         `./js/eventListener.js`,
         `./js/main.js`,
      ];

      // create js scripts
      for (let i = 0; i < scriptsSrc.length; i++) {
         const script = document.createElement("script");
         script.src = scriptsSrc[i];
         document.head.appendChild(script);
      }
   };
};
