// Firebase Leitmix Producciones

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


const firebaseConfig = {
  apiKey: "AIzaSyAYTGDwg7CFXWxEqFQvBm065nzXdFS4GOc",
  authDomain: "leitmix-producciones.firebaseapp.com",
  projectId: "leitmix-producciones",
  storageBucket: "leitmix-producciones.firebasestorage.app",
  messagingSenderId: "623603784847",
  appId: "1:623603784847:web:f0281de4260939981324fa",
  measurementId: "G-067Z7ZTZ7R"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const storage = getStorage(app);


export { db, storage };
