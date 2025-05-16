// Firebase configuration file
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration - using Firebase JS SDK v9+
// These are public API keys specifically for this demo
const firebaseConfig = {
  apiKey: "AIzaSyBOCXwORRbGB54zggjzpQOe-6MDsO2Klus",
  authDomain: "tictactoe-34328.firebaseapp.com",
  databaseURL: "https://tictactoe-34328-default-rtdb.firebaseio.com/",
  projectId: "tictactoe-34328",
  storageBucket: "tictactoe-34328.firebasestorage.app",
  messagingSenderId: "124542911299",
  appId: "1:124542911299:web:8697b3ec10f670f0ea65f6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };