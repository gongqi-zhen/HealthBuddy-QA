import admin from "firebase-admin";

try {
  admin.initializeApp();
  console.log('Firebase initialized successfully');
} catch (err) {
  if (!/already exists/.test(err.message)) {
    console.error('Firebase initialization error', err.stack)
  } else {
    console.log('Firebase already initialized.');
  }
}

export async function verifyIdToken(req) {
  const idToken = req.body.token;
  if (!idToken) {
    console.error('ID token is missing.');
    return null;
  }
  // console.log('ID token received:', idToken);
  var decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (err) {
    console.error('Error verifying ID token:', err);
    decodedToken = null;
  }
  return decodedToken;
}
