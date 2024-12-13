//firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAAtGpasdF7mmbmRc7wahWFCoKwWMFVF9I",
    authDomain: "task-manager-37b16.firebaseapp.com",
    projectId: "task-manager-37b16",
    storageBucket: "task-manager-37b16.firebasestorage.app",
    messagingSenderId: "841685865040",
    appId: "1:841685865040:web:e3ec83eccba98772c87755",
    measurementId: "G-WY3PFCLFGW"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User signed up:', userCredential.user);
  } catch (error) {
    console.error('Error signing up:', error.message);
  }
};

const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User signed in:', userCredential.user);
  } catch (error) {
    console.error('Error signing in:', error.message);
  }
};

const logOut = () => {
  signOut(auth).then(() => {
    console.log('User signed out');
  }).catch((error) => {
    console.error('Error signing out:', error.message);
  });
};

export { auth, signUpWithEmail, signInWithEmail, logOut, db };