import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  onSnapshot,
  orderBy,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";

import { auth, db, rsvp, coverDiv } from "../main";

async function openMyMemo() {
  if (auth.currentUser) {
    coverDiv.innerText = "";
    console.clear();
    rsvp.innerText = "로그아웃";
    coverDiv.innerHTML = `<div id="myMemo_header">나의 단어장</div>
    <div id="memo_select_bar">
      <select id="date-select" class="memo_select">
        <option disabled selected>날짜 선택</option>
      </select>
      <div id="add_memo_btn" class="memo_select memo_settings">단어장 추가</div>
      <div id="edit_memo_btn" class="memo_select memo_settings">단어장 편집</div>
      <div id="left_hide_btn" class="memo_select memo_settings">왼쪽 가리개</div>
      <div id="right_hide_btn" class="memo_select memo_settings">오른쪽 가리개</div>
    </div>
    <div style="display: flex;"><table id="word_table"><td>먼저 보고 싶은 단어장을 선택해주세요!</td></table><table id="word_table2"></table></div>`;

    let docRef = doc(db, "users", auth.currentUser.uid, "vocaNote", "test");
    let docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
    } else {
      await setDoc(doc(db, "users", auth.currentUser.uid, "vocaNote", "test"), {
        id: "test"
      });
    }

    const q = query(
      collection(db, "users", auth.currentUser.uid, "vocaNote"),
      orderBy("date", "desc")
    );
    const dateSelect = document.querySelector("#date-select");

    let list = onSnapshot(q, (snaps) => {
      snaps.forEach((doc) => {
        let a = 0;
        const option = document.createElement("option");
        option.classList.add("opt");
        option.innerText = doc.data().date;
        const options = document.querySelectorAll(".opt");
        options.forEach((opt) => {
          if (opt.value === doc.data().date) a = 1;
        });
        if (a === 0) dateSelect.append(option);
      });
    });
    dateSelect.addEventListener("change", async () => {
      makeVocaTable(dateSelect.value);
    });

    const addMemoBtn = document.getElementById("add_memo_btn");
    addMemoBtn.addEventListener("click", makeNewMemo);

    const leftHideBtn = document.getElementById("left_hide_btn");
    leftHideBtn.addEventListener("click", () => {
      const leftList = document.querySelectorAll(".word_table_td_left");
      if (leftList) {
        hideList(leftList);
      }
    });
    const rightHideBtn = document.getElementById("right_hide_btn");
    rightHideBtn.addEventListener("click", () => {
      const rightList = document.querySelectorAll(".word_table_td_right");
      if (rightList) {
        hideList(rightList);
      }
    });
  }
}

//관련 함수들
function hideList(list) {
  list.forEach((list) => {
    list.classList.toggle("hide");
  });
}

async function makeVocaTable(value) {
  const docSnap = await getDoc(
    doc(db, "users", auth.currentUser.uid, "vocaNote", value)
  );
  const noteBox = document.getElementById("word_table");
  const editBtn = document.getElementById("edit_memo_btn");
  const noteBox2 = document.getElementById("word_table2");
  let data = docSnap.data().contents;
  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  if (month + 1 < 10) {
    month = "0" + month;
  }
  let date = today.getDate();
  if (date < 10) {
    date = "0" + date;
  }
  const time = `${year}${month}${date}`;

  editBtn.click();
  const jungbockBangG = document.getElementById("shield");
  const jungbockBangG2 = document.getElementById("shield2");
  if (jungbockBangG) {
    jungbockBangG.remove();
    jungbockBangG2.remove();
  }

  if (data.length === 0) {
    noteBox.innerText = "아직 등록된 단어가 없습니다.";
    noteBox2.innerText = "";
  } else {
    noteBox.innerText = "";
    noteBox2.innerText = "";
  }

  let num = 0;

  if (data.length < 21) {
    data.forEach((pair) => {
      num++;
      makeTable(pair, noteBox, num);
    });
  } else {
    const arr1 = data.slice(0, 20);
    const arr2 = data.slice(20, data.length);
    arr1.forEach((pair) => {
      num++;
      makeTable(pair, noteBox, num);
    });
    arr2.forEach((pair) => {
      num++;
      makeTable(pair, noteBox2, num);
    });
    for (let i = 40 - data.length; i > 0; i--) {
      const n = "/";
      makeTable(n, noteBox2, "-");
    }
  }

  editBtn.addEventListener(
    "click",
    () => {
      if (time === value) {
        addWordPopup(data, value);
      }
    },
    { once: true }
  );
}

function makeTable(pair, box, num) {
  const pairBox = document.createElement("tr");
  pairBox.classList.add("table_row");
  const numberBox = document.createElement("td");
  numberBox.classList.add("word_table_number");
  const leftBox = document.createElement("td");
  leftBox.classList.add("word_table_td");
  leftBox.classList.add("word_table_td_left");
  const rightBox = document.createElement("td");
  rightBox.classList.add("word_table_td");
  rightBox.classList.add("word_table_td_right");
  numberBox.innerText = num;
  leftBox.innerText = pair.split("/")[0];
  rightBox.innerText = pair.split("/")[1];
  pairBox.append(numberBox);
  pairBox.append(leftBox);
  pairBox.append(rightBox);
  box.append(pairBox);
}

function addWordPopup(data, date) {
  const backDiv = document.createElement("div");
  backDiv.id = "shield";

  const backDiv2 = document.createElement("div");
  backDiv2.id = "shield2";

  const wordEditDiv = document.createElement("div");
  wordEditDiv.id = "word_edit_div";

  const wordEditDivInner = document.createElement("div");
  wordEditDivInner.id = "word_edit_table_div";
  const wordEditTable1 = document.createElement("table");
  const wordEditTable2 = document.createElement("table");

  const memoNow = document.createElement("div");
  memoNow.id = "memo_now";
  memoNow.classList.add("list_buttons");
  memoNow.innerHTML = `<span>${date}</span><button id="Xbtn">❌</button>`;
  wordEditDiv.append(memoNow);

  let num = 0;

  if (data.length < 21) {
    data.forEach((pair) => {
      num++;
      makeTable(pair, wordEditDiv, num);
    });
  } else {
    const arr1 = data.slice(0, 20);
    const arr2 = data.slice(20, data.length);
    arr1.forEach((pair) => {
      num++;
      makeTable(pair, wordEditTable1, num);
    });
    arr2.forEach((pair) => {
      num++;
      makeTable(pair, wordEditTable2, num);
    });
    for (let i = 40 - data.length; i > 0; i--) {
      const n = "/";
      makeTable(n, wordEditTable2, "-");
    }
  }
  wordEditDivInner.append(wordEditTable1);
  wordEditDivInner.append(wordEditTable2);
  wordEditDiv.append(wordEditDivInner);

  const addWord = document.createElement("div");
  addWord.id = "add_word";
  addWord.classList.add("list_buttons");
  addWord.innerHTML = `<button id="plusBtn">➕</button><button id="minusBtn">➖</button>`;

  wordEditDiv.append(addWord);
  backDiv2.append(wordEditDiv);
  document.body.append(backDiv);
  document.body.append(backDiv2);

  const Xbtn = document.getElementById("Xbtn");
  Xbtn.addEventListener("click", () => {
    backDiv.remove();
    backDiv2.remove();
    document.getElementById("my_memo").click();
  });

  const plusBtn = document.getElementById("plusBtn");
  plusBtn.addEventListener("click", () => {
    if (data.length > 39) {
      alert("하루 최대 40단어까지만 지원됩니다.");
      return;
    }
    const q1 = prompt("첫 번째 칸에 들어갈 말을 입력해 주세요.");
    const q2 = prompt("두 번째 칸에 들어갈 말을 입력해 주세요.");

    if (q1 === "" || q2 === "") {
      return;
    } else if (q1 === null || q2 === null) {
      return;
    } else {
      const found = data.find((e) => e === `${q1}/${q2}`);
      if (found) return;
      updateDoc(doc(db, "users", auth.currentUser.uid, "vocaNote", date), {
        contents: arrayUnion(`${q1}/${q2}`)
      });
      backDiv.remove();
      backDiv2.remove();
      data.push(`${q1}/${q2}`);
      addWordPopup(data, date);
    }
  });

  const minusBtn = document.getElementById("minusBtn");
  minusBtn.addEventListener("click", () => {
    let q = prompt("몇 번째 단어를 삭제하시겠어요?");
    if (q) {
      q = q * 1;
      if (isNaN(q)) {
        alert("숫자만 입력할 수 있어요!");
      } else if (q >= 1) {
        if (data.length >= q) {
          console.log(data[q - 1]);
          const selected = data[q - 1];
          if (selected !== undefined) {
            updateDoc(
              doc(db, "users", auth.currentUser.uid, "vocaNote", date),
              {
                contents: arrayRemove(selected)
              }
            );
            backDiv.remove();
            backDiv2.remove();
            data = data.filter((e) => e !== selected);
            addWordPopup(data, date);
          }
        }
      }
    }
  });
}

async function makeNewMemo() {
  const res = confirm(
    "새 단어장을 생성하시겠습니까? 환경에 부정적인 영향을 미칠 수 있습니다."
  );
  if (res) {
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    if (month + 1 < 10) {
      month = "0" + month;
    }
    let date = today.getDate();
    if (date < 10) {
      date = "0" + date;
    }
    const time = `${year}${month}${date}`;

    let docRef = doc(db, "users", auth.currentUser.uid, "vocaNote", time);
    let docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      alert("단어장을 하루에 2개 이상 만들면 지구가 아파할 거예요!");
    } else {
      await setDoc(doc(db, "users", auth.currentUser.uid, "vocaNote", time), {
        contents: [],
        date: time,
        id: time
      });
      alert("단어장이 추가되었습니다.");
    }
  }
}

export { openMyMemo };
