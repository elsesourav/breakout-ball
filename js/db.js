// onload = () => {
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

function getUser() {
   return auth.currentUser;
}
function getUserInfo() {
   return JSONtoOBJECT(getUser().photoURL);
}
async function userProfileUpdate(data) {
   const myData = OBJECTtoJSON(data);
   await getUser().updateProfile({
      photoURL: myData,
   });
   return true;
}

async function getLevelRank(levelId) {
   waitingWindow.classList.add("active");
   const playersRef = db.ref(`ranking/level-${levelId}`);
   const data = await playersRef.orderByChild("time").once("value");
   waitingWindow.classList.remove("active");
   return data.val();
}

async function getUserRank(levelId) {
   const levelRank = await getLevelRank(levelId);
   const array = levelRank ? Object.entries(levelRank) : [];
   const rank = array.findIndex(([e]) => e == tempUser.username);
   return {
      userRank: rank == -1 ? null : rank,
      ranks: array,
   };
}

async function setUserLevelRank(levelId, time) {
   const ref = db.ref(`ranking/level-${levelId}/${tempUser.username}`);
   await ref.set({
      time: time,
      fullName: tempUser.fullName,
   });
   return await getUserRank(levelId);
}

async function updateUserLevelRank(levelId, time) {
   const ref = db.ref(`ranking/level-${levelId}/${tempUser.username}`);
   await ref.update({ time });
   return await getUserRank(levelId);
}

async function setupLevelRanking(levelId, time) {
   const info = getUserInfo();

   if (
      info.levelsRecord[levelId] &&
      info.levelsRecord[levelId].time !== null &&
      info.levelsRecord[levelId].time <= time
   )
      return null;
   waitingWindow.classList.add("active");

   const data =
      info.levelsRecord[levelId] && info.levelsRecord[levelId].time !== null
         ? await updateUserLevelRank(levelId, time)
         : await setUserLevelRank(levelId, time);

   await updateLevelView(
      levelId,
      currentGameMode == "local" ? currentGameMode : "online"
   );

   info.levelsRecord[levelId].time = time;
   info.levelsRecord[levelId].rank = data.userRank;
   info.levelsRecord[levelId].completed = true;

   if (tempUser.numLocalLevels - 1 > levelId) {
      info.levelsRecord[`${Number(levelId) + 1}`] = {
         time: null,
         rank: null,
         completed: false,
      };
   }

   await userProfileUpdate(info);
   waitingWindow.classList.remove("active");
   return data;
}

async function updateLevelView(levelId) {
   waitingWindow.classList.add("active");
   const refLocal = db.ref(`levels/local/${levelId}/playCount`);
   const refOnline = db.ref(`levels/online/${levelId}/playCount`);

   const level = await refLocal.get();
   const ref = level.exists() ? refLocal : refOnline;

   await ref.transaction((count) => {
      if (!count) return 1;
      return count + 1;
   });
}

async function saveLevel(newLevel, path = "online") {
   waitingWindow.classList.add("active");
   try {
      const ref = db.ref(`levels/${path}/${newLevel.id}`);
      await ref.set(newLevel);
      waitingWindow.classList.remove("active");
      return true;
   } catch (error) {
      return false;
   }
}

async function getLevel(levelId) {
   waitingWindow.classList.add("active");
   try {
      const refLocal = db.ref(`levels/local/${levelId}`);
      const refOnline = db.ref(`levels/online/${levelId}`);

      let level = await refLocal.get();

      if (level.exists()) level = level.val();
      else level = (await refOnline.get()).val();

      waitingWindow.classList.remove("active");
      return level;
   } catch (error) {
      return false;
   }
}

// async function getUserCreatedLevels() {
//    waitingWindow.classList.add("active");
//    const ref = db.ref(`levels/online`);
//    const levels = await ref
//       .orderByChild("creator")
//       .equalTo(tempUser.username)
//       .once("value");
//    waitingWindow.classList.remove("active");
//    return levels.val();
// }

const createNewUser = (username, password, fullName) => {
   return asyncHandler(async () => {
      try {
         await auth.createUserWithEmailAndPassword(
            `${username}@sb.com`,
            password
         );
         const info = {
            username: username,
            fullName: fullName,
            volume: 1,
            isGyroActive: true,
            isVibrateActive: true,
            numLocalLevels: 10,
            levelsRecord: {
               1: {
                  rank: null,
                  time: null,
                  completed: false,
               },
            },
         };
         await userProfileUpdate(info);
         return {
            data: true,
         };
      } catch (error) {
         if (error.code == "auth/email-already-in-use") {
            return {
               data: null,
               title: "Username Exists",
               message:
                  "This username is already taken. Please choose a different one.",
            };
         } else {
            return {
               data: null,
               title: "Bad Request",
               message: "Something went wrong!",
            };
         }
      }
   });
};

const signinUser = (username, password) => {
   return asyncHandler(async () => {
      try {
         await auth.signInWithEmailAndPassword(`${username}@sb.com`, password);
         return {
            data: true,
         };
      } catch (error) {
         if (
            error.code == "auth/invalid-login-credentials" ||
            error.code == "auth/internal-error"
         ) {
            return {
               data: null,
               title: "Authentication Error",
               message: `The username (${username}) is invalid. Please ensure it meets the required criteria or create a new account if you do not have one.`,
            };
         } else {
            return {
               data: null,
               title: "Authentication Error",
               message: "Invalid Password. Please enter a valid password",
            };
         }
      }
   });
};

Module.onRuntimeInitialized = () => {
   waitingWindow.classList.add("active");
   auth.onAuthStateChanged(async (User) => {
      loadWasm();

      waitingWindow.classList.remove("active");
      if (!User) {
         const { fullName, username, password, isSignin } = await userForm(
            floatingInputShow,
            true
         );
         if (isSignin) {
            await signinUser(username, password);
         } else {
            await createNewUser(username, password, fullName);
         }
      } else {
         const info = getUserInfo();
         tempUser = info;

         setupLocalLevel(info.levelsRecord);
         $("#fullName").innerText = info.fullName;
         $("#username").innerText = `@${info.username}`;

         // download online levels
         const onlineRef = db.ref(`levels/online`);
         window.onlineLevels = [];

         const bounce = debounce(() => {
            window.onlineLevels.sort((a, b) => b.playCount - a.playCount);
            const maxPagePossible = Math.ceil(window.onlineLevels.length / MAX_PAGE_RENDER);
            PAGES.update(maxPagePossible);
            setupCreateLevel();
            setupOnlineLevels();
         }, 200);

         onlineRef.on("child_added", (s) => {
            window.onlineLevels.push(s.val());
            bounce();
         });

         onlineRef.on("child_removed", (s) => {
            const index = window.onlineLevels.findIndex((e) => e.id === s.key);
            if (index !== -1) {
               window.onlineLevels.splice(index, 1);
               pageClickAction();
            }
         });
      }
   });
};
