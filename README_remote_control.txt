
SMJ Overlay Remote Control Setup

Files:
- index.html -> load this in OBS as the overlay
- control.html -> open this on your tablet
- Logo Master.png -> keep in the same folder/repo

How to connect both pages:
1. Create a free Firebase project at https://console.firebase.google.com
2. Add a Web App
3. Enable Realtime Database
4. In BOTH index.html and control.html, replace the firebaseConfig placeholder values with your real config
5. Publish both files to the same GitHub Pages repo

Recommended Firebase Realtime Database test rules while you set it up:
{
  "rules": {
    ".read": true,
    ".write": true
  }
}

After everything works, you should lock rules down.
