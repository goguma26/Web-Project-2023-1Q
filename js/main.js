import "../css/styles.css";

import { openAccountInfo } from "./mypage/account_info";

import { openMyMemo } from "./mypage/my_memo";

import { openDaily } from "./test/daily";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  onSnapshot,
  orderBy,
  updateDoc,
  arrayUnion
} from "firebase/firestore";

import {
  getAuth, // authentication 설정
  signInWithPopup, //google 로그인을 팝업창에 띄우기 위해
  GoogleAuthProvider, //google login 기능
  signOut,
  onAuthStateChanged
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvBfHPXp0xWse_W49aQ0Bn67fIPj6gOwc",
  authDomain: "webproject2023-1.firebaseapp.com",
  projectId: "webproject2023-1",
  storageBucket: "webproject2023-1.appspot.com",
  messagingSenderId: "603303088397",
  appId: "1:603303088397:web:f29448febd6b12bc6c2044"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth();
const db = getFirestore();
const provider = new GoogleAuthProvider();

const coverDiv = document.getElementById("main_div");

const account_info = document.getElementById("account_info");
const my_memo = document.getElementById("my_memo");
const rsvp = document.getElementById("rsvp");

const todays_word = document.getElementById("todays_word");
const daily = document.getElementById("daily");
const weekly = document.getElementById("weekly");

if (auth.currentUser) {
  rsvp.innerText = "로그아웃";
}

account_info.addEventListener("click", () => {
  openAccountInfo();
});

my_memo.addEventListener("click", () => {
  openMyMemo();
});

daily.addEventListener("click", () => {
  openDaily();
});

//login function
rsvp.addEventListener("click", () => {
  if (auth.currentUser) {
    // User is signed in; allows user to sign out
    signOut(auth);
    rsvp.innerText = "로그인";
    coverDiv.innerText = "";
    alert("로그아웃 되었습니다.");
  } else {
    // No user is signed in; allows user to sign in
    login();
  }
});

async function login() {
  signInWithPopup(auth, provider).then(async function (result) {
    const user = result.user;
    let docRef = doc(db, "users", auth.currentUser.uid);
    let docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
    } else {
      let today = new Date();
      let year = today.getFullYear(); // 년도
      let month = today.getMonth() + 1; // 월
      let date = today.getDate(); // 날짜

      await setDoc(doc(db, "users", auth.currentUser.uid), {
        userId: auth.currentUser.uid,
        userEmail: user.email,
        signupDate: `${year} / ${month} / ${date}`
      });
    }
    rsvp.innerText = "로그아웃";
  });
}

setTimeout(() => clear(), 500);

for (let i = 8; i > 0; i--) {
  setTimeout(() => clear(), 1000);
}

setTimeout(() => clear(), 3000);

function clear() {
  if (auth.currentUser) {
    rsvp.innerText = "로그아웃";
  }
  console.clear();
}

export { firebaseConfig, auth, db, rsvp, coverDiv };
