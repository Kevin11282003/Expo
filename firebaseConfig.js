import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCvTpYbMvjVW_wQ_9pVk08l8SQ6azP4OVk",
  authDomain: "melo-37ab5.firebaseapp.com",
  projectId: "melo-37ab5",
  storageBucket: "melo-37ab5.appspot.com",
  messagingSenderId: "587191030710",
  appId: "1:587191030710:web:888373e2e71cc411592717"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
