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
   loadingWindow(true);
   const myData = OBJECTtoJSON(data);
   await getUser().updateProfile({
      photoURL: myData,
   });
   loadingWindow();
   return true;
}

async function getLevelRank(levelId) {
   loadingWindow(true);
   const playersRef = db.ref(`ranking/level-${levelId}`);
   const data = await playersRef.get();
   loadingWindow();
   return data.val();
}

async function getUserRank(levelId) {
   loadingWindow(true);
   const levelRank = await getLevelRank(levelId);
   let sortedList = [];
   for (const key in levelRank) {
      sortedList.push({ ...levelRank[key], username: key });
   }
   sortedList.sort((a, b) => a.time - b.time);
   const rank = sortedList.findIndex((e) => e.username === tempUser.username);
   loadingWindow();
   return {
      userRank: rank == -1 ? null : rank,
      ranks: sortedList,
   };
}

async function setUserLevelRank(levelId, time) {
   loadingWindow(true);
   const ref = db.ref(`ranking/level-${levelId}/${tempUser.username}`);
   await ref.set({
      time: time,
      fullName: tempUser.fullName,
   });
   loadingWindow();
   return await getUserRank(levelId);
}

async function updateUserLevelRank(levelId, time) {
   loadingWindow(true);
   const ref = db.ref(`ranking/level-${levelId}/${tempUser.username}`);
   await ref.update({ time });
   const data = await getUserRank(levelId);
   loadingWindow();
   return data;
}

async function setupLevelRanking(levelId, time) {
   const info = getUserInfo();
   if (
      info.levelsRecord[levelId] &&
      info.levelsRecord[levelId].time !== null &&
      info.levelsRecord[levelId].time <= time
   )
      return null;

   loadingWindow(true);
   const data =
      info.levelsRecord[levelId] && info.levelsRecord[levelId].time !== null
         ? await updateUserLevelRank(levelId, time)
         : await setUserLevelRank(levelId, time);

   await updateLevelView(levelId, currentGameMode == "local" ? currentGameMode : "online");

   if (info.levelsRecord[levelId]) {
      info.levelsRecord[levelId].time = time;
      info.levelsRecord[levelId].rank = data.userRank;
      info.levelsRecord[levelId].completed = true;
   } else {
      info.levelsRecord[levelId] = {
         time: time,
         rank: data.userRank,
         completed: true,
      };
   }

   if (tempUser.numLocalLevels - 1 > levelId) {
      info.levelsRecord[`${Number(levelId) + 1}`] = {
         time: null,
         rank: null,
         completed: false,
      };
   }

   await userProfileUpdate(info);
   loadingWindow();
   return data;
}

async function updateLevelView(levelId) {
   loadingWindow(true);
   const refLocal = db.ref(`levels/local/${levelId}/playCount`);

   const palyCount = await refLocal.get();
   const mode = palyCount.exists() ? "local" : "online";

   const level = await db.ref(`levels/${mode}/${levelId}/creator`);
   const ref = await db.ref(`levels/${mode}/${levelId}/playCount`);

   const creator = (await level.get()).val();

   if (creator !== tempUser.username) {
      await ref.transaction((count) => {
         if (!count) return 1;
         return count + 1;
      });
   }
   loadingWindow();
}

async function saveLevel(newLevel, path = "online") {
   loadingWindow(true);
   try {
      const ref = db.ref(`levels/${path}/${newLevel.id}`);
      await ref.set(newLevel);
      loadingWindow();
      return true;
   } catch (error) {
      return false;
   }
}
async function saveLevelPrivate(newLevel) {
   loadingWindow(true);
   try {
      const ref = db.ref(`levels/private/${tempUser.username}/${newLevel.id}`);
      await ref.set(newLevel);
      loadingWindow();
      return true;
   } catch (error) {
      return false;
   }
}

async function getLevel(levelId) {
   loadingWindow(true);
   try {
      const refLocal = db.ref(`levels/local/${levelId}`);
      const refOnline = db.ref(`levels/online/${levelId}`);

      let level = await refLocal.get();

      if (level.exists()) level = level.val();
      else level = (await refOnline.get()).val();

      loadingWindow();
      return level;
   } catch (error) {
      return false;
   }
}

async function moveData(oldPath, newPath) {
   try {
      loadingWindow(true);
      const oldRef = db.ref(oldPath);
      const snapshot = await oldRef.once("value");
      const data = snapshot.val();

      const newRef = db.ref(newPath);
      await newRef.set(data);

      await oldRef.remove();
   } catch (error) {
      const alert = new AlertHTML({
         title: "Something is wrong",
         message: "Database not response please try again.",
         btnNm1: "Okay",
         oneBtn: true,
      });
      loadingWindow();
      alert.show();
      alert.clickBtn1(() => {
         alert.hide();
      });
   }
}

async function deleteData(path) {
   try {
      loadingWindow(true);
      const ref = db.ref(path);
      await ref.remove();
      loadingWindow();
   } catch (error) {
      const alert = new AlertHTML({
         title: "Something is wrong",
         message: "Database not response please try again.",
         btnNm1: "Okay",
         oneBtn: true,
      });
      loadingWindow();
      alert.show();
      alert.clickBtn1(() => {
         alert.hide();
      });
   }
}

const createNewUser = (username, password, fullName) => {
   return asyncHandler(async () => {
      try {
         await auth.createUserWithEmailAndPassword(`${username}@sb.com`, password);
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
               message: "This username is already taken. Please choose a different one.",
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
         if (error.code == "auth/invalid-login-credentials" || error.code == "auth/internal-error") {
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
   loadingWindow(true);
   auth.onAuthStateChanged(async (User) => {
      loadWasm();

      if (!User) {
         loadingWindow();
         const { fullName, username, password, isSignin } = await userForm(floatingInputShow, true);
         if (isSignin) {
            await signinUser(username, password);
         } else {
            await createNewUser(username, password, fullName);
         }
      } else {
         const info = getUserInfo();
         tempUser = info;

         let loadComplete = false;

         setupLocalLevel(info.levelsRecord);
         $("#fullName").innerText = info.fullName;
         $("#username").innerText = `@${info.username}`;

         // download online levels
         const onlineRef = db.ref(`levels/online`);
         const privateRef = db.ref(`levels/private/${tempUser.username}`);
         window.onlineLevels = [];
         window.privateLevels = [];

         const bounceAll = debounce(() => {
            loadComplete = true;
            window.onlineLevels.sort((a, b) => b.playCount - a.playCount);
            const maxPagePossible = Math.ceil(window.onlineLevels.length / MAX_PAGE_RENDER);
            PAGES.update(maxPagePossible);
            setupCreateLevel();
            setupOnlineLevels();
            loadingWindow();
         }, 100);

         const bouncePrivate = debounce(() => {
            setupCreateLevel();
         }, 100);

         privateRef.on("child_added", (s) => {
            window.privateLevels.push(s.val());
            bouncePrivate();
         });

         privateRef.on("child_removed", (s) => {
            const index = window.privateLevels.findIndex((e) => e.id === s.key);
            if (index !== -1) {
               window.privateLevels.splice(index, 1);
               bouncePrivate();
            }
         });

         onlineRef.on("child_added", (s) => {
            window.onlineLevels.push(s.val());
            bounceAll();
         });

         onlineRef.on("child_removed", (s) => {
            const index = window.onlineLevels.findIndex((e) => e.id === s.key);
            if (index !== -1) {
               window.onlineLevels.splice(index, 1);
               bounceAll();
            }
         });

         // when on online map exist then remove loading window
         setTimeout(() => {
            if (!loadComplete) {
               loadingWindow(false);
            }
         }, 20000);
      }
   });
};
