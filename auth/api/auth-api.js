// auth-api.js
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "./firebase-config.js";

import { db } from "./firebase-config.js";
import {
  doc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const googleProvider = new GoogleAuthProvider();

export const signUp = async (email, password, name = "") => {
  // Create user with Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Save user profile to Firestore
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    name: name,
    createdAt: new Date(),
    admin: false
  });

  return userCredential;
};

export const login = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  return await signOut(auth);
};

export const resetPassword = async (email) => {
  return await sendPasswordResetEmail(auth, email);
};

export const checkAuth = () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) resolve(user);
      else reject(null);
    });
  });
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const updateUserProfile = async (user, data) => {
  // Update Firebase Auth display name
  await updateProfile(user, data);

  // Also update Firestore name field
  if (data.displayName) {
    await updateDoc(doc(db, "users", user.uid), {
      name: data.displayName
    });
  }
};

export const signInWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};
