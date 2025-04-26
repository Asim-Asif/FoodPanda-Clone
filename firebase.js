import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, query, orderBy, updateDoc, deleteDoc, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAJJlw-2eGhvPDhc6qECBLKiPCiq5ng184",
  authDomain: "foodpanda-official.firebaseapp.com",
  projectId: "foodpanda-official",
  storageBucket: "foodpanda-official.firebasestorage.app",
  messagingSenderId: "1005830121099",
  appId: "1:1005830121099:web:fa6086531ca10ce634968e",
  measurementId: "G-Z47NDFPFR6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, db, doc, setDoc, getDoc, collection, addDoc, getDocs, query, orderBy, updateDoc, deleteDoc, where };