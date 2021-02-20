import firebase from "firebase";
import * as config from "./config.json";

const firebaseConfig = config.firebase;

firebase.initializeApp(firebaseConfig);

export default firebase;
