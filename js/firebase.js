
const firebaseConfig = {
  apiKey: "AIzaSyAP5JIYtql-4YB-wAgNT2Urja4DUOFoRws",
  authDomain: "smj-overlay.firebaseapp.com",
  databaseURL: "https://smj-overlay-default-rtdb.firebaseio.com",
  projectId: "smj-overlay",
  storageBucket: "smj-overlay.firebasestorage.app",
  messagingSenderId: "1034121319902",
  appId: "1:1034121319902:web:2b88ce1cc3ccf79766794f"
};

firebase.initializeApp(firebaseConfig);
window.smjDB = firebase.database();
