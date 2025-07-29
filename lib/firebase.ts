import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, RecaptchaVerifier } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

// const recaptchaConfig = {
//   size: "invisible" as const,
//   callback: (response: string) => {
//     console.log("reCAPTCHA solved:", response);
//   },
//   "expired-callback": () => {
//     console.warn("reCAPTCHA expired. Try again.");
//   },
// };

// function getRecaptchaVerifier(containerId = "recaptcha-container") {
//   if (typeof window === "undefined") return null;
//   if (!window.recaptchaVerifier) {
//     window.recaptchaVerifier = new RecaptchaVerifier(
//       auth,
//       containerId,
//       recaptchaConfig
//     );
//     window.recaptchaVerifier.render();
//   }
//   return window.recaptchaVerifier;
// }

export {
  app,
  auth,
  db,
  storage,
  provider,
  // recaptchaConfig,
  // getRecaptchaVerifier,
  RecaptchaVerifier,
};
