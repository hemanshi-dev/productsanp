import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApBh6nIgPCxdiwVg9Fet7DhdxTZQHMdWA",
  authDomain: "productsnap-75ca2.firebaseapp.com",
  projectId: "productsnap-75ca2",
  storageBucket: "productsnap-75ca2.firebasestorage.app",
  messagingSenderId: "874569363416",
  appId: "1:874569363416:web:a961acebeb562f46ec0cad",
  measurementId: "G-NDTYVKFHXD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (only in browser environment)
let analytics: ReturnType<typeof getAnalytics> | null = null;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };
export default app;

