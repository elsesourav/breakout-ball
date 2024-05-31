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
   const playersRef = db.ref(`ranking/level-${levelId}`);
   const data = await playersRef.orderByChild("time").once("value");
   return data.val();
}

async function getUserRank(levelId) {
   const levelRank = await getLevelRank(levelId);
   const array = Object.entries(levelRank);
   const rank = array.length - array.findIndex(([e]) => e == username);
   return {
      userRank: rank,
      ranks: array,
   };
}

async function setUserLevelRank(levelId, time) {
   const ref = db.ref(`ranking/level-${levelId}/${username}`);
   await ref.set({
      time: time,
      fullName,
   });
   return await getUserRank(levelId);
}

async function updateUserLevelRank(levelId, time) {
   const ref = db.ref(`ranking/level-${levelId}/${username}/time`);
   await ref.set(time);
   return await getUserRank(levelId);
}

async function updateLocalLevel(levelId, time) {
   const info = getUserInfo();
   if (info.levelsRecord[levelId]) {
      if (info.levelsRecord[levelId].time < time) {
         info.levelsRecord[levelId].bestTime = time;
         const all = await updateUserLevelRank(levelId, time);
         const result = getRank(all);
         info.levelsRecord[levelId].rank = result.userRank;
         await userProfileUpdate(info);
         return result.ranks;
      }
   } else {
      info.levelsRecord[levelId].bestTime = time;
      const all = await setUserLevelRank(levelId, time);
      const result = getRank(all);
      info.levelsRecord[levelId].rank = result.userRank;
      await userProfileUpdate(info);
      return result.ranks;
   }

   setupLocalLevel(info.levelsRecord);
}

auth.onAuthStateChanged(async (User) => {
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
      username = info.username;
      fullName = info.fullName;

      // setUserLevelRank(0, 100);
      // setUserLevelRank(0, 200);
      // setUserLevelRank(0, 300);
      // setUserLevelRank(0, 50);
      updateLocalLevel(0, 20);
      setupLocalLevel(info.levelsRecord);
      $("#fullName").innerText = info.fullName;
      $("#username").innerText = `@${info.username}`;
   }
});

const createNewUser = (username, password, fullName) =>
   asyncHandler(async () => {
      try {
         const userCredential = await auth.createUserWithEmailAndPassword(
            `${username}@sb.com`,
            password
         );
         await userProfileUpdate({
            fullName: fullName,
            username: username,
            ...userDemo,
         });
         return {
            data: userCredential.user,
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

const signinUser = (username, password) =>
   asyncHandler(async () => {
      try {
         const userCredential = await auth.signInWithEmailAndPassword(
            `${username}@sb.com`,
            password
         );
         return {
            data: userCredential.user,
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

{
   // async function loginUser(username, password) {
   //    try {
   //       const doc = await db.collection("usernameToUid").doc(username).get();
   //       if (doc.exists) {
   //          const uid = doc.data().uid;
   //          const userDoc = await db.collection("users").doc(uid).get();
   //          if (userDoc.exists) {
   //             const email = userDoc.data().email;
   //             const userCredential = await auth.signInWithEmailAndPassword(
   //                email,
   //                password
   //             );
   //             const user = userCredential.user;
   //             console.log("User signed in:", user);
   //          } else {
   //             console.error("No user found with the provided UID.");
   //          }
   //       } else {
   //          console.error("Username not found.");
   //       }
   //    } catch (error) {
   //       console.error("Error signing in:", error.code, error.message);
   //    }
   // }
   // async function createNewUser(username, email, password) {
   //    try {
   //       const userCredential = await auth.createUserWithEmailAndPassword(
   //          email,
   //          password
   //       );
   //       const User = userCredential.user;
   //       // await db.collection("usernameToUid").doc(username).set({
   //       //    uid: User.uid,
   //       // });
   //       // await db.collection("users").doc(User.uid).set({
   //       //    username: username,
   //       //    email: email,
   //       // });
   //       console.log("User created:", User);
   //    } catch (error) {
   //       console.error("Error creating new user:", error.code, error.message);
   //    }
   // }
   // };
}

// createNewUser("sourav", "431413414").then((data) => {
//    // console.log(data);
// });

// loginUser("sourav", "431413414").then((data) => {
//    console.log(data);
// })
setTimeout(() => {
   console.log(auth.user);
}, 1000);
