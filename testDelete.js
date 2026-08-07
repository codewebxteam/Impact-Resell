import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
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

async function testDelete() {
    const ordersQ = query(
        collection(db, "orders"),
        where("studentEmail", "==", "ccodewebxteam1@gmail.com"),
        where("courseId", "==", "EIxEpSXBqEwByqGxIJaR")
    );
    try {
        const snap = await getDocs(ordersQ);
        console.log(`Found ${snap.size} orders`);
        for (let orderDoc of snap.docs) {
            console.log("Deleting order", orderDoc.id);
            await deleteDoc(doc(db, "orders", orderDoc.id));
            console.log("Deleted successfully");
        }
    } catch(e) {
        console.error("Deletion failed:", e);
    }
    process.exit(0);
}
testDelete();
