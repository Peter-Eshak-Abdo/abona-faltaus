import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDhZWRGufh0tr0or3ja-Fb2On4EQRpaSCU",
  authDomain: "abona-faltaus.firebaseapp.com",
  projectId: "abona-faltaus",
  storageBucket: "abona-faltaus.firebasestorage.app",
  messagingSenderId: "997007426913",
  appId: "1:997007426913:web:6fd9471da028dd49643120",
  measurementId: "G-91C82SG0D6",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

export { auth, db, storage, provider, signInAnonymously };
