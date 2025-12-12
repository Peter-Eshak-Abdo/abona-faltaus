import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app;
let auth;
let db;
let storage;
let persistenceEnabled = false;

function initializeFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  if (!persistenceEnabled && typeof window !== 'undefined') {
    enableIndexedDbPersistence(db)
      .then(() => {
        persistenceEnabled = true;
        console.log("Offline persistence enabled");
      })
      .catch((err) => {
        if (err.code == 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a time.
          console.log("Offline persistence failed: failed-precondition");
        } else if (err.code == 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence.
          console.log("Offline persistence failed: unimplemented");
        }
      });
  }
}

function getFirebaseServices() {
  if (!app) {
    initializeFirebase();
  }
  return { app, auth, db, storage };
}

export { getFirebaseServices };
