import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "api123milhas-gate67",
  appId: "1:770472534603:web:c3ddd7961a64ed2bbd23ce",
  storageBucket: "api123milhas-gate67.firebasestorage.app",
  apiKey: "AIzaSyA5WHR1q-ewhle7cXplatQgaXRTLBNK0Jc",
  authDomain: "api123milhas-gate67.firebaseapp.com",
  messagingSenderId: "770472534603"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
