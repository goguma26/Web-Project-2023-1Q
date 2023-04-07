import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  onSnapshot,
  orderBy
} from "firebase/firestore";

import { signOut } from "firebase/auth";

import { auth, db, rsvp, coverDiv } from "../main";

async function openAccountInfo() {
  if (auth.currentUser) {
    console.clear();
    rsvp.innerText = "로그아웃";
    coverDiv.innerText = "";

    let docRef = doc(db, "users", auth.currentUser.uid);
    let docSnap = await getDoc(docRef);

    coverDiv.innerHTML = `<div id="account_header">계정 정보</div>
    <div id="account_details">
      <div class="account_infos">이름: ${auth.currentUser.displayName}</div>
      <div class="account_infos">이메일: ${auth.currentUser.email}</div>
      <div class="account_infos">가입일: ${docSnap.data().signupDate}</div>
      <div class="account_infos">점수 평균: </div>
      <div id="leave" class="account_infos">회원 탈퇴</div>
    </div>`;

    const leaveBtn = document.getElementById("leave");
    leaveBtn.addEventListener("click", async () => {
      const q = confirm(
        "정말로 탈퇴하시겠습니까? 기존 정보들이 모두 삭제되며 복구할 수 없습니다."
      );
      if (q) {
        rsvp.innerText = "로그인";
        const UID = auth.currentUser.uid;
        const memo = await getDoc(doc(db, "users", UID, "vocaNote", "test"));
        if (memo) {
          const q = query(collection(db, "users", UID, "vocaNote"));
          let list = onSnapshot(q, (snaps) => {
            snaps.forEach((docu) => {
              deleteDoc(doc(db, "users", UID, "vocaNote", docu.data().id));
            });
          });
        }
        await deleteDoc(docRef);
        signOut(auth);
        coverDiv.innerText = "";
        window.location.reload();
      }
    });
  } else {
    alert("로그인 후 이 서비스를 이용하실 수 있습니다.");
  }
}

export { openAccountInfo };
