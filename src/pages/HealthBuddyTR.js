import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { auth, signInWithGoogle } from "lib/firebase";
import { signOut } from "firebase/auth";
import HealthBuddyTR from "components/HealthBuddyTR";

export default function HealthBuddyTRPage() {
  const [loginUser, setLoginUser] = useState(null);

  // Register login state change handler
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setLoginUser(user);
    });
    return unsubscribe;
  }, []);

  let element;

  if (loginUser) {
    element = (
      <>
        <HealthBuddyTR />
        <br/>
        <button onClick={() => signOut(auth)}>Logout</button>
        <br/><Link href="/HealthBuddyQA">Back to QA Service</Link>
      </>
    );
  } else {
    element = (
      <>
        <button onClick={signInWithGoogle}>
          Sign in with Google
        </button>
      </>
    );
  }


  return (
    <>
      <Head>
        <title>HealthBuddy TR Service</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={{ margin: "10px", width: "600px" }}>
        {element}
      </div>
    </>
  );
}
