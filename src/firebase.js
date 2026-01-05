import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDa4cYL7wLR8rJn1C8MXyUVVxsRb2aaugg",
  authDomain: "theoohpoint.firebaseapp.com",
  projectId: "theoohpoint",
  storageBucket: "theoohpoint.appspot.com",
  messagingSenderId: "1039836854227",
  appId: "1:1039836854227:web:f3e4c448e44ab53fc0e126",
  measurementId: "G-C2N44JCB4K",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
