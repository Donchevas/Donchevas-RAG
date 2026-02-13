import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Tu configuración obtenida de la consola
const firebaseConfig = {
  apiKey: "AIzaSyBj6Lei_RsR9_KffaqH4POELMhhK79cIQA",
  authDomain: "iagen-gcp-cwmi.firebaseapp.com",
  projectId: "iagen-gcp-cwmi",
  storageBucket: "iagen-gcp-cwmi.firebasestorage.app",
  messagingSenderId: "1069673789450",
  appId: "1:1069673789450:web:49d3ecd7f7b6391fff47f3"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos los servicios que usaremos
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;