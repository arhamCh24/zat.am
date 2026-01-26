import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "./firebase-config";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();

export const signUp = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
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
      if (user) {
        resolve(user);
      } else {
        reject(null);
      }
    });
  });
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const updateUserProfile = async (user, data) => {
  return await updateProfile(user, data);
};

export const signInWithGoogle = async () => {
  const cred = await signInWithPopup(auth, googleProvider);
  // Ensure a Firestore user document exists for this account
  await ensureUserDocument(cred.user);
  return cred;
};

// Ensure there is a Firestore user document for the given user.
// Creates it only if missing, with isAdmin defaulting to false.
// This respects security rules by never changing isAdmin on existing docs.
export const ensureUserDocument = async (user, extraData = {}) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    // Do not modify existing documents here (especially isAdmin).
    return;
  }

  const { displayName, email } = user;

  // Never allow callers to override isAdmin from the client
  const { isAdmin, ...safeExtraData } = extraData || {};

  await setDoc(userRef, {
    email: email || "",
    name: displayName || safeExtraData.name || "",
    // Language and bilingual toggle defaults
    langCode: "sa", // "sa" = Sanskrit / Devanagari in this prototype
    bilingualEnabled: false,
    isAdmin: false,
    createdAt: serverTimestamp(),
    ...safeExtraData,
  });
};

// Fetch the current user's profile document from Firestore
export const getCurrentUserProfile = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) return null;

  return { id: snapshot.id, ...snapshot.data() };
};

// Convenience helper for other teams (e.g., leaderboards)
// to quickly check if the logged-in user is an admin.
export const isCurrentUserAdmin = async () => {
  const profile = await getCurrentUserProfile();
  return !!(profile && profile.isAdmin === true);
};

// Change Password Method
export const changePassword = async (currentPassword, newPassword) => {
  const user = auth.currentUser;

  // authenticate again user with current password
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);

  // Update to new password
  return await updatePassword(user, newPassword);
};

// Generic helper to safely update the current user's profile document.
// Strips out isAdmin so it cannot be modified from the client.
export const updateCurrentUserProfile = async (partialData = {}) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Not authenticated");
  }

  const userRef = doc(db, "users", user.uid);

  const { isAdmin, ...safeData } = partialData || {};

  return await updateDoc(userRef, safeData);
};

// Convenience helper specifically for language + bilingual toggle settings.
// langCode is a short code like "sa" (Sanskrit/Devanagari) or "en"
// (Sanskrit in Latin letters). bilingualEnabled controls whether
// games should honor the user's preference.
export const updateUserLanguageSettings = async ({
  langCode,
  bilingualEnabled,
} = {}) => {
  const update = {};

  if (typeof langCode === "string" && langCode.trim()) {
    update.langCode = langCode.trim();
  }

  if (typeof bilingualEnabled === "boolean") {
    update.bilingualEnabled = bilingualEnabled;
  }

  if (Object.keys(update).length === 0) {
    return; // nothing to update
  }

  return updateCurrentUserProfile(update);
};
