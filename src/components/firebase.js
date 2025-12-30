import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB23KO_TRCCrWEA7lF0hynaJZu-ETuRxTM",
  authDomain: "indikator-kpi.firebaseapp.com",
  projectId: "indikator-kpi",
  storageBucket: "indikator-kpi.appspot.com",
  messagingSenderId: "38111935187",
  appId: "1:38111935187:web:23700cd2c1e4bad4187226",
  measurementId: "G-D8RQFCM4SE",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
