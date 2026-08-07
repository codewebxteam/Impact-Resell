import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
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

async function testUpdate() {
    try {
        await updateDoc(doc(db, "orders", "pdjDfpKm2aFq6YoE1wD2"), { status: "Revoked" });
        console.log("Update succeeded!");
    } catch(e) {
        console.error("Update failed:", e);
    }
    process.exit(0);
}
testUpdate();
