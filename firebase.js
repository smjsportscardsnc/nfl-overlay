/*
  OPTIONAL FIREBASE MODE
  ----------------------
  Leave FIREBASE_CONFIG as null for local OBS testing. The overlay and control page
  will communicate through BroadcastChannel/localStorage on the same computer.

  To use from different devices, paste your Firebase web config below, include the
  Firebase scripts in index.html/control.html, and swap the adapter in app.js.
*/
window.SMJ_FIREBASE_CONFIG = null;
