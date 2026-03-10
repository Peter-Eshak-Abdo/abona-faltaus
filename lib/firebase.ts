import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// function getFirebaseApp() {
//     return !getApps().length ? initializeApp(firebaseConfig) : getApp();
// }

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Persistence failed: Multiple tabs open");
    } else if (err.code === 'unimplemented') {
      console.warn("Persistence is not supported by this browser");
    }
  });
}

export { app, auth, db, storage };

// export function getFirebaseServices() {
//     const app = getFirebaseApp();
//     const auth = getAuth(app);
//     const db = getFirestore(app);
//     const storage = getStorage(app);
//     return { app, auth, db, storage };
// }
