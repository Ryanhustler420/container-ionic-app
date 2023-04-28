// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getPreference, PREFERENCE_KEYS } from "./utils/common/cache";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const defaultFirebaseConfig = {
    apiKey: "xxx",
    authDomain: "xxx.firebaseapp.com",
    projectId: "xxx-com",
    storageBucket: "xxx.appspot.com",
    messagingSenderId: "00005454545",
    appId: "1:23232335656:web:0000xsdsd",
    measurementId: "G-JKDHGJKSHD"
};

export const collections = {
    CONTAINERS: 'containers',
    DROPLETS: 'droplets',
    BUCKETS: 'buckets',
};

export default async () => {
    let config = await getPreference(PREFERENCE_KEYS.FIREBASE_CONFIG);
    if (config.value) {
        let obj = JSON.parse(config?.value!);
        let app = initializeApp(obj);
        return { analytics: getAnalytics(app), db: getFirestore(app) };
    } else return {
        analytics: getAnalytics(initializeApp(defaultFirebaseConfig)),
        db: getFirestore(initializeApp(defaultFirebaseConfig)),
    };
};
