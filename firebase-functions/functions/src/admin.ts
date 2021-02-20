import * as admin from "firebase-admin";

// We would usually pass app id but our project already
// knows about it look in .firebaserc file
admin.initializeApp();

export default admin;
