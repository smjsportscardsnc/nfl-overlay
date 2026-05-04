// SMJ Firebase config
// Paste your existing Firebase web app config below.
// This overlay uses Firebase Realtime Database.

const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://PASTE_YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};

window.SMJFIREBASE_READY = false;
window.SMJFIREBASE_ERROR = null;

try {
  const hasPlaceholder = Object.values(firebaseConfig).some(v => String(v).includes("PASTE_"));
  if (hasPlaceholder) {
    throw new Error("Firebase config still has placeholder values in js/firebase.js");
  }
  firebase.initializeApp(firebaseConfig);
  window.smjDB = firebase.database();
  window.SMJFIREBASE_READY = true;
} catch (err) {
  console.error("SMJ Firebase setup error:", err);
  window.SMJFIREBASE_ERROR = err.message || String(err);
}
