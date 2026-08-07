import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import fs from "fs";

const configContent = fs.readFileSync("/Users/thead76/Desktop/Impact Resell/src/firebase/config.js", "utf8");
const envContent = fs.readFileSync("/Users/thead76/Desktop/Impact Resell/.env", "utf8");
const envVars = {};
envContent.split("\n").forEach(line => {
    const [key, val] = line.split("=");
    if(key && val) envVars[key.trim()] = val.trim();
});

const firebaseConfig = {
  apiKey: envVars["VITE_FIREBASE_API_KEY"],
  authDomain: envVars["VITE_FIREBASE_AUTH_DOMAIN"],
  projectId: envVars["VITE_FIREBASE_PROJECT_ID"],
  storageBucket: envVars["VITE_FIREBASE_STORAGE_BUCKET"],
  messagingSenderId: envVars["VITE_FIREBASE_MESSAGING_SENDER_ID"],
  appId: envVars["VITE_FIREBASE_APP_ID"]
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    const q = query(collection(db, "orders"), where("studentEmail", "==", "demostudent3@gmail.com"));
    const snap = await getDocs(q);
    console.log("Found orders for demostudent3@gmail.com:", snap.size);
    snap.docs.forEach(doc => {
        console.log(doc.id, doc.data());
    });
    process.exit(0);
}
check();
