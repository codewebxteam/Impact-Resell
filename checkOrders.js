import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import fs from "fs";
import path from "path";

// Read firebase config from the project
const configContent = fs.readFileSync("/Users/thead76/Desktop/Impact Resell/src/firebase/config.js", "utf8");
// Super basic extraction
const apiKey = configContent.match(/apiKey:\s*"([^"]+)"/)?.[1] || configContent.match(/apiKey:\s*import\.meta\.env\.VITE_FIREBASE_API_KEY/); 

// Since it's using VITE_, we need .env
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
  appId: envVars["VITE_FIREBASE_APP_ID"],
  measurementId: envVars["VITE_FIREBASE_MEASUREMENT_ID"]
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    const q = query(collection(db, "orders"), where("studentEmail", "==", "ccodewebxteam1@gmail.com"));
    const snap = await getDocs(q);
    console.log("Found orders:", snap.size);
    snap.docs.forEach(doc => {
        console.log(doc.id, doc.data());
    });
    process.exit(0);
}
check();
