// dashboard.js
import { auth } from "../api/firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { db } from "../api/firebase-config.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const userEmailDiv = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout-btn");

// ✅ Listen for user session
onAuthStateChanged(auth, async (user) => {
  if (user) {
    let displayName = user.displayName;

    // 🔄 If no displayName, try Firestore
    if (!displayName) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        displayName = userDoc.data().name;
      }
    }

    userEmailDiv.innerHTML = `Welcome, ${displayName || user.email}`;
  } else {
    // 🚪 Not logged in — go to login
    window.location.href = "login.html";
  }
});

// 🔐 Logout logic
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});
