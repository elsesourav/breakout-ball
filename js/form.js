async function userForm(parent, hideClose = false, operationName = "Continue") {
   parent.classList.add("active");
   const id = Date.now();
   const messageSignin = "I don't have any Account <span>Create One</span>";
   const messageSignup = "I have already Account <span>Sign in</span>";
   let isSignin = false;

   parent.innerHTML += `
   <form class="floating-window one" id="fw${id}">
      <p id="title${id}">Sign Up</p>
      <button class="close cancel-for-all" id="c${id}"><i class="sbi-close"></i></button>
      <div class="input-fullName" id="fn${id}">
         <i class="sbi-user1"></i>
         <input type="text" class="inputs${id}" placeholder="Full Name" name="fullName" spellcheck="false" autocomplete="off">
         <div class="tool-tip-text">
            <i class="sbi-check"> Full Name minimum 3 letter required (Only use Latter)</i>
         </div>
      </div>
      <div class="input-username">
         <i class="sbi-user1"></i>
         <input type="text" class="inputs${id}" required placeholder="New Username" name="username" spellcheck="false" autocomplete="off">
         <div class="tool-tip-text">
            <i class="sbi-check"> Username minimum 4 letter required (Only use Number Latter _ and -)</i>
         </div>
      </div>
      <div class="input-password three">
         <i class="sbi-https"></i>
         <div class="tool-tip-text">
            <i class="sbi-check"> Password minimum 6 letter required (Only use Number Latter _ . - and @ )</i>
         </div>
         <input type="password" class="inputs${id}" required placeholder="Create Password" name="password" spellcheck="false" autocomplete="off">
         <div class="pass-show-hide-btn" id="sh${id}">
            <i class="sbi-eye1"></i>
            <i class="sbi-eye-slash"></i>
         </div>
      </div>
      <div class="buttons">
         <input type="submit" id="con${id}" value="${operationName}"/>
      </div>
      <div class="link" id="msg${id}">${messageSignup}</div>
   </form>
   `;

   return new Promise((resolve) => {
      const closeButton = parent.querySelector(`#c${id}`);
      const inputs = parent.querySelectorAll(`.inputs${id}`);
      const suggestions = parent.querySelectorAll(`.tool-tip-text`);
      const submit = parent.querySelector(`#con${id}`);
      const fw = parent.querySelector(`#fw${id}`);
      const fullNameBox = parent.querySelector(`#fn${id}`);
      const showHideBtn = parent.querySelector(`#sh${id}`);
      const title = parent.querySelector(`#title${id}`);
      const linkMessage = parent.querySelector(`#msg${id}`);

      fw.removeChild(closeButton);

      let isSectionOuter = false;
      let showPassword = false;
      const setIsSectionTrue = () => (isSectionOuter = true);
      const setBorder = () => {
         const vs = [...inputs].map((input) => input.value?.trim());

         if (!validName(vs[0])) inputs[0].style.border = "1px solid #f00";

         if (!validUName(vs[1])) inputs[1].style.border = "1px solid #f00";

         if (!validPass(vs[2])) inputs[2].style.border = "1px solid #f00";
      };
      const resetBorder = (input) => (input.style.border = "none");
      const showHidePass = () => {
         wav.click.currentTime = 0;
         wav.click.play();
         showPassword = !showPassword;
         showHideBtn.classList.toggle("active", showPassword);
         if (showPassword) inputs[2].type = "text";
         else inputs[2].type = "password";
      };
      const closeSingle = (is = true) => {
         wav.click.currentTime = 0;
         wav.click.play();
         parent.classList.remove("active");
         parent.removeChild(fw);
         removeAllEventListener();
         if (is) resolve(null);
      };

      function sendValue(e) {
         wav.click.currentTime = 0;
         wav.click.play();
         e.preventDefault();
         const vs = [...inputs].map((input) => input.value?.trim());

         if ((isSignin || validName(vs[0])) && validUName(vs[1]) && validPass(vs[2])) {
            closeSingle(false);
            removeAllEventListener();
            resolve({
               fullName: vs[0],
               username: vs[1].toLowerCase(),
               password: vs[2],
               isSignin,
            });
         } else {
            setBorder();
         }
      }

      const changeAuthOption = (e) => {
         wav.click.currentTime = 0;
         wav.click.play();
         title.innerHTML = isSignin ? "Sign Up" : "Sign In";
         linkMessage.innerHTML = isSignin ? messageSignup : messageSignin;
         isSignin = !isSignin;
         if (isSignin) {
            fullNameBox.classList.add("hidden");
            inputs[2].placeholder = "Password";
            inputs[1].placeholder = "Username";
         } else {
            fullNameBox.classList.remove("hidden");
            inputs[1].placeholder = "New Username";
            inputs[2].placeholder = "Create Password";
         }
      };

      const removeAllEventListener = () => {
         fw.removeEventListener("click", setIsSectionTrue, true);
         closeButton.removeEventListener("click", closeSingle);
         fw.removeEventListener("submit", sendValue);
         showHideBtn.removeEventListener("click", showHidePass);
         linkMessage.removeEventListener("click", changeAuthOption);

         inputs.forEach((inp) => inp.removeEventListener("input", () => resetBorder(inp)));
      };

      fw.addEventListener("click", setIsSectionTrue, true);
      closeButton.addEventListener("click", closeSingle);
      fw.addEventListener("submit", sendValue);
      showHideBtn.addEventListener("click", showHidePass);
      linkMessage.addEventListener("click", changeAuthOption);
      inputs.forEach((inp) => inp.addEventListener("input", () => resetBorder(inp)));
   });
}

// userForm(floatingInputShow)
