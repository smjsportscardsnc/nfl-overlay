const firebaseConfig = {
  apiKey: "AIzaSyAP5JIYtql-4YB-wAgNT2Urja4DUOFoRws",
  authDomain: "smj-overlay.firebaseapp.com",
  databaseURL: "https://smj-overlay-default-rtdb.firebaseio.com",
  projectId: "smj-overlay",
  storageBucket: "smj-overlay.firebasestorage.app",
  messagingSenderId: "1034121319902",
  appId: "1:1034121319902:web:2b88ce1cc3ccf79766794f",
  measurementId: "G-511F87E4GE"
};

window.SMJFIREBASE_READY = false;
window.SMJFIREBASE_ERROR = null;

try {
  firebase.initializeApp(firebaseConfig);
  window.smjDB = firebase.database();
  window.SMJFIREBASE_READY = true;
} catch (err) {
  console.error("Firebase setup error:", err);
  window.SMJFIREBASE_ERROR = err.message || String(err);
}
