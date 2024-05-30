function createChangePasswordInput(parent) {
   parent.classList.add("active");
   const id = Date.now();

   parent.innerHTML += `
   <div class="floating-window one" id="fw${id}">
      <p>Update Password</p>
      <button class="close cancel-for-all" id="c${id}"><i class="sbi-close"></i></button>
      <div class="input-username">
         <i class="sbi-user1"></i>
         <input type="text" class="inputs${id}" placeholder="Username">
      </div>
      <div class="input-password">
         <i class="sbi-https"></i>
         <input type="password" class="inputs${id}" placeholder="Current Password">
         <div class="pass-show-hide-btn" id="sh${id}">
            <i class="sbi-eye1"></i>
            <i class="sbi-eye-slash"></i>
         </div>
      </div>
      <div class="input-password">
         <i class="sbi-https"></i>
         <input type="password" class="inputs${id}" placeholder="New Password">
         <div class="pass-show-hide-btn" id="nsh${id}">
            <i class="sbi-eye1"></i>
            <i class="sbi-eye-slash"></i>
         </div>
      </div>
      <div class="buttons">
         <button id="con${id}">Change</button>
      </div>
   </div>
   `;

   return new Promise((resolve) => {
      const closeButton = parent.querySelector(`#c${id}`);
      const inputs = parent.querySelectorAll(`.inputs${id}`);
      const submit = parent.querySelector(`#con${id}`);
      const fw = parent.querySelector(`#fw${id}`);
      const showHideOldBtn = parent.querySelector(`#sh${id}`);
      const showHideNewBtn = parent.querySelector(`#nsh${id}`);
      inputs[0].select();

      let isSectionOuter = false;
      let showOldPassword = false;
      let showNewPassword = false;
      const setIsSectionTrue = () => (isSectionOuter = true);
      const setBorder = () => {
         inputs.forEach((inp) => {
            if (inp.value.length <= 0) inp.style.border = "1px solid #f00";
         });
      };
      const resetBorder = (input) => (input.style.border = "none");
      const showHideOldPass = () => {
         showOldPassword = !showOldPassword;
         showHideOldBtn.classList.toggle("active", showOldPassword);
         if (showOldPassword) inputs[1].type = "text";
         else inputs[1].type = "password";
      };
      const showHideNewPass = () => {
         showNewPassword = !showNewPassword;
         showHideNewBtn.classList.toggle("active", showNewPassword);
         if (showNewPassword) inputs[2].type = "text";
         else inputs[2].type = "password";
      };
      const closeSingle = (is = true) => {
         parent.classList.remove("active");
         parent.removeChild(fw);
         removeAllEventListener();
         if (is) resolve(null);
      };
      const closeAll = () => {
         if (!isSectionOuter) closeSingle();
         isSectionOuter = false;
      };
      const sendValue = () => {
         const nInputs = [...inputs].map((input) => input.value);
         if (nInputs.every((input) => input.length > 0)) {
            closeSingle(false);
            removeAllEventListener();
            resolve({
               username: inputs[0].value.toLowerCase(),
               oldPassword: inputs[1].value,
               newPassword: inputs[2].value,
            });
         } else {
            setBorder();
         }
      };
      const keyEnter =  (e) => {
         if (e.keyCode === 13) sendValue();
      };

      const removeAllEventListener = () => {
         fw.removeEventListener("keydown", keyEnter);
         parent.removeEventListener("click", closeAll);
         fw.removeEventListener("click", setIsSectionTrue, true);
         closeButton.removeEventListener("click", closeSingle);
         submit.removeEventListener("click", sendValue);
         showHideOldBtn.removeEventListener("click", showHideOldPass);
         showHideNewBtn.removeEventListener("click", showHideNewPass);
         inputs.forEach((inp) =>
            inp.removeEventListener("input", () => resetBorder(inp))
         );
      };

      fw.addEventListener("keydown", keyEnter);
      parent.addEventListener("click", closeAll);
      fw.addEventListener("click", setIsSectionTrue, true);
      closeButton.addEventListener("click", closeSingle);
      submit.addEventListener("click", sendValue);
      showHideOldBtn.addEventListener("click", showHideOldPass);
      showHideNewBtn.addEventListener("click", showHideNewPass);
      inputs.forEach((inp) =>
         inp.addEventListener("input", () => resetBorder(inp))
      );
   });
}

async function userForm(parent, operationName = "Continue") {
   parent.classList.add("active");
   const id = Date.now();
   const messageSignin = "I don't have any Account <span>Create One</span>";
   const messageSignup = "I have already Account <span>Sign in</span>";
   let isSignin = true;

   parent.innerHTML += `
   <div class="floating-window one" id="fw${id}">
      <p id="title${id}">Sign In</p>
      <button class="close cancel-for-all" id="c${id}"><i class="sbi-close"></i></button>
      <div class="input-username">
         <i class="sbi-user1"></i>
         <input type="text" class="inputs${id}" placeholder="Username" spellcheck="false" autocomplete="off">
      </div>
      <div class="input-password three">
         <i class="sbi-https"></i>
         <input type="password" class="inputs${id}" placeholder="Password" spellcheck="false" autocomplete="off">
         <div class="pass-show-hide-btn" id="sh${id}">
            <i class="sbi-eye1"></i>
            <i class="sbi-eye-slash"></i>
         </div>
      </div>
      <div class="buttons">
         <button id="con${id}">${operationName}</button>
      </div>
      <div class="link" id="msg${id}">${messageSignin}</div>
   </div>
   `;

   return new Promise((resolve) => {
      const closeButton = parent.querySelector(`#c${id}`);
      const inputs = parent.querySelectorAll(`.inputs${id}`);
      const submit = parent.querySelector(`#con${id}`);
      const fw = parent.querySelector(`#fw${id}`);
      const showHideBtn = parent.querySelector(`#sh${id}`);
      const title = parent.querySelector(`#title${id}`);
      const linkMessage = parent.querySelector(`#msg${id}`);

      inputs[0].select();

      let isSectionOuter = false;
      let showPassword = false;
      const setIsSectionTrue = () => (isSectionOuter = true);
      const setBorder = () => {
         inputs.forEach((inp) => {
            if (inp.value.length < 4) inp.style.border = "1px solid #f00";
         });
      };
      const resetBorder = (input) => (input.style.border = "none");
      const showHidePass = () => {
         showPassword = !showPassword;
         showHideBtn.classList.toggle("active", showPassword);
         if (showPassword) inputs[1].type = "text";
         else inputs[1].type = "password";
      };
      const closeSingle = (is = true) => {
         parent.classList.remove("active");
         parent.removeChild(fw);
         removeAllEventListener();
         if (is) resolve(null);
      };
      const closeAll = () => {
         if (!isSectionOuter) closeSingle();
         isSectionOuter = false;
      };
      const sendValue = () => {
         const nInputs = [...inputs].map((input) => input.value);
         if (nInputs.every((input) => input.length > 3)) {
            closeSingle(false);
            removeAllEventListener();
            resolve({
               username: inputs[0].value.toLowerCase(),
               password: inputs[1].value,
               isSignin
            });
         } else {
            setBorder();
         }
      };
      const keyEnter =  (e) => {
         if (e.keyCode === 13) sendValue();
      };

      const changeAuthOption =  (e) => {
         title.innerHTML = isSignin ? "Sign Up" : "Sign In";
         linkMessage.innerHTML = isSignin ? messageSignup : messageSignin;
         isSignin = !isSignin;
      };

      const removeAllEventListener = () => {
         fw.removeEventListener("keydown", keyEnter);
         parent.removeEventListener("click", closeAll);
         fw.removeEventListener("click", setIsSectionTrue, true);
         closeButton.removeEventListener("click", closeSingle);
         submit.removeEventListener("click", sendValue);
         showHideBtn.removeEventListener("click", showHidePass);
         linkMessage.removeEventListener("click", changeAuthOption);

         inputs.forEach((inp) =>
            inp.removeEventListener("input", () => resetBorder(inp))
         );
      };

      fw.addEventListener("keydown", keyEnter);
      parent.addEventListener("click", closeAll);
      fw.addEventListener("click", setIsSectionTrue, true);
      closeButton.addEventListener("click", closeSingle);
      submit.addEventListener("click", sendValue);
      showHideBtn.addEventListener("click", showHidePass);
      linkMessage.addEventListener("click", changeAuthOption);
      inputs.forEach((inp) =>
         inp.addEventListener("input", () => resetBorder(inp))
      );
   });
}

// userForm(floatingInputShow)