import * as functions from "firebase-functions";
import * as express from "express";

import db from "./db";
import firebase from "./firebase";
import admin from "./admin";

import {
  SignupDto,
  validationSchema as signupValidationSchema
} from "./dtos/auth/signup.dto";
import { extractYupErrors } from "./errors";

const app = express();

const getCurrentTimestamp = () =>
  admin.firestore.Timestamp.fromDate(new Date());

app.get("/screams", (req, res) => {
  db.collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      const screams = data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt._seconds * 1000)
      }));
      return res.json(screams);
    })
    .catch((err) => console.error(err));
});

app.post("/screams", (request, response) => {
  const newScream = {
    body: request.body.body,
    userHandle: request.body.userHandle,
    createdAt: getCurrentTimestamp()
  };

  db.collection("screams")
    .add(newScream)
    .then((doc) => response.json({ id: doc.id }))
    .catch((err) => {
      console.error(err);
      response.status(500).json({ error: "something went wrong" });
    });
});

// Signup route
app.post("/signup", async (req, res) => {
  let signupDto = req.body as SignupDto;

  try {
    await signupValidationSchema.validate(signupDto, { abortEarly: false });
  } catch (err) {
    const errors = extractYupErrors(err.inner);
    return res.status(400).json(errors);
  }

  const doc = await db.doc(`/users/${signupDto.handle}`).get();

  if (doc.exists)
    return res.status(400).json({ handle: "this handle is already taken" });

  try {
    const signedUser = await firebase
      .auth()
      .createUserWithEmailAndPassword(signupDto.email, signupDto.password);

    if (signedUser.user) {
      await db.doc(`/users/${signupDto.handle}`).set({
        handle: signupDto.handle,
        email: signupDto.email,
        createdAt: getCurrentTimestamp(),
        userId: signedUser.user.uid
      });

      const token = await signedUser.user.getIdToken();

      return res.status(200).json({ token });
    } else {
      throw new Error("User property does not exist on createdUser");
    }
  } catch (err) {
    console.error(err);
    if (err.code === "auth/email-already-in-use") {
      return res.status(400).json({ email: "Email is already in use" });
    } else {
      return res.status(500).json({ error: "Couldn't signup" });
    }
  }
});

// Login route
app.post("/login", async (req, res) => {
  const loginDto = {
    email: req.body.email,
    password: req.body.password
  };

  try {
    const loggedUser = await firebase
      .auth()
      .signInWithEmailAndPassword(loginDto.email, loginDto.password);

    const token = await loggedUser.user?.getIdToken();
    return res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    if (err.code === "auth/wrong-password") {
      return res.status(400).json({ password: "invalid password" });
    } else {
      return res.status(500).json({ error: "couldn't login" });
    }
  }
});

// Export as https://baseurl.com/api
// .region('europe-west1') changes default deploy region from us to eu
export const api = functions.region("europe-west1").https.onRequest(app);
