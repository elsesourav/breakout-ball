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
   const rank = array.findIndex(([e]) => e == username);
   return {
      userRank: rank == -1 ? null : rank,
      ranks: array,
   };
}

async function setUserLevelRank(levelId, time) {
   const ref = db.ref(`ranking/level-${levelId}/${username}`);
   await ref.set({
      time: time,
      fullName: fullName,
   });
   return await getUserRank(levelId);
}

async function updateUserLevelRank(levelId, time) {
   const ref = db.ref(`ranking/level-${levelId}/${username}/time`);
   await ref.update(time);
   return await getUserRank(levelId);
}

async function setupLevelRanking(levelId, time) {
   const info = getUserInfo();
   if (info.levelsRecord[levelId] && info.levelsRecord[levelId].time > time)
      return;

   waitingWindow.classList.add("active");

   const data = info.levelsRecord[levelId].time
      ? await updateUserLevelRank(levelId, time)
      : await setUserLevelRank(levelId, time);

   info.levelsRecord[levelId].bestTime = time;
   info.levelsRecord[levelId].rank = data.userRank;
   info.levelsRecord[levelId].completed = true;

   if (window.levels.length - 1 > levelId) {
      info.levelsRecord[`${Number(levelId) + 1}`] = {
         bestTime: null,
         rank: null,
         completed: false,
      };
   }

   console.log(info);
   await userProfileUpdate(info);
   waitingWindow.classList.remove("active");
   return data;
}

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
         userDemo = info;
         username = info.username;
         fullName = info.fullName;

         setupLocalLevel(info.levelsRecord);
         $("#fullName").innerText = info.fullName;
         $("#username").innerText = `@${info.username}`;
      }
   });
};

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
            levelsRecord: {
               1: {
                  rank: null,
                  bestTime: null,
                  completed: false,
               },
            },
         };
         await userProfileUpdate(info);
         return {
            data: true,
         };
      } catch (error) {
         console.log(error);
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
         console.log(error);
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
