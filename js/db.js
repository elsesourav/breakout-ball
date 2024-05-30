// onload = () => {
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

auth.onAuthStateChanged((user) => {
   waitingWindow.classList.remove("active");
   if (user) {

   } else {
      
   }
 });

 

function getUser() {
   return auth.currentUser;
}
function getUsername() {
   const user = getUser();
   return user ? user.email.split("@")[0] : null;
}
console.log(getUser());
console.log(getUsername());

const createNewUser = (username, password, fullName) =>
   asyncHandler(async () => {
      try {
         const userCredential = await auth.createUserWithEmailAndPassword(`${username}@sb.com`, password);
         await userCredential.user.updateProfile({
            fullName: fullName,
            currentLevel
         })
         await auth.signInWithEmailAndPassword(`${username}@sb.com`, password);
         return {
            data: userCredential.user
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
   }
); 

const loginUser = (username, password) =>
   asyncHandler(async () => {
      try {
         const userCredential = await auth.signInWithEmailAndPassword(`${username}@sb.com`, password);
         return {
            data: userCredential.user
         };
      } catch (error) {
         console.log(error);
         if (error.code == "auth/invalid-login-credentials" || error.code == "auth/internal-error") {
            return {
               data: null,
               title: "Authentication Error",
               message:
                  "The username (${username}) is invalid. Please ensure it meets the required criteria or create a new account if you do not have one.",
            };
         } else {
            return {
               data: null,
               title: "Authentication Error",
               message: "Invalid Password. Please enter a valid password",
            };
         }
      }
   }
); 

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
