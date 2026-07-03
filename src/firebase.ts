import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy
} from "firebase/firestore";

// Config parsed from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyD9DRWfpnKIvZ6XCl2p5Hfoo3UCr_Jg2Dk",
  authDomain: "ai-studio-applet-webapp-5a910.firebaseapp.com",
  projectId: "ai-studio-applet-webapp-5a910",
  storageBucket: "ai-studio-applet-webapp-5a910.firebasestorage.app",
  messagingSenderId: "190218744439",
  appId: "1:190218744439:web:d13437d216fe4c622ecc72"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-maziexam-223bd057-c0c2-4f86-aaae-77bf6be13fc6");

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy
};
export type { User };
