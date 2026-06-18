// js/app.js  神経衰弱ゲーム 完成版（解答例）
// 各処理の詳しい解説は docs/GUIDE.md を参照してください。

// ===== Step 1: トランプの準備とシャッフル =====

// カードのデータを保存する配列
const cards = [];
const card_type = ['&spades;', '&diams;', '&hearts;', '&clubs;'];

// forループを使って、52枚のカードを作成します
for (let i = 0; i < card_type.length; i++) {
  for (let j = 1; j <= 13; j++) {
    cards.push({
      type: card_type[i],
      num: j,
      isopen: false, // カードが表か裏か
      ispair: false  // カードがペアになったか
    });
  }
}

// カードをシャッフルする関数（フィッシャー・イェーツのシャッフル）
function shuffle() {
  let i = cards.length;
  while (i) {
    let swap_idx = Math.floor(Math.random() * i--);
    // 配列の要素を交換
    let tmp = cards[i];
    cards[i] = cards[swap_idx];
    cards[swap_idx] = tmp;
  }
}

// シャッフルを実行します
shuffle();

// ===== Step 3: カードをめくる関数 =====

function flip(count) {
  let el = document.getElementById(count);
  let d_card = cards[count];

  if (d_card.isopen) { // もしカードが表なら、裏にします
    el.innerHTML = '**<br>**';
    el.style.color = 'green';
    d_card.isopen = false;
  } else { // もしカードが裏なら、表にします
    el.innerHTML = d_card.type + '<br>' + d_card.num;
    if (d_card.type === '&spades;' || d_card.type === '&clubs;') {
      el.style.color = 'black';
    } else {
      el.style.color = 'red';
    }
    d_card.isopen = true;
  }
}

// ===== Step 4: ペア判定で使う状態変数と関数 =====

// 1枚目のカードを保存する変数
let firstid = -1;

// ペア不成立の待機中（カードを裏に戻すまで）はクリックを無効にするためのロック
let locked = false;

// ペアかどうかをチェックする関数
function checkPair(firstid, secondid) {
  return cards[firstid].num === cards[secondid].num;
}

// ===== Step 2: カードを画面に表示する =====

const table = document.getElementById('table');

// ループを使ってテーブルを作成し、カードを並べます
let count = 0;
for (let i = 0; i < card_type.length; i++) {
  let tr = document.createElement('tr');
  for (let j = 0; j < 13; j++) {
    let td = document.createElement('td');
    let d_card = cards[count];

    td.id = count;
    td.style.width = '1.5em';
    td.style.textAlign = 'center';
    td.innerHTML = d_card.type + '<br>' + d_card.num;

    // 模様で色を分けます
    if (d_card.type === '&spades;' || d_card.type === '&clubs;') {
      td.style.color = 'black';
    } else {
      td.style.color = 'red';
    }

    // クリックイベント（Step 4 のペア判定ロジック）
    td.addEventListener('click', function() {
      let count = this.id;

      // 裏に戻す待機中はクリックを受け付けない（3枚以上開くのを防ぐ）
      if (locked) {
        return;
      }

      // 既にペアになっているカードや、同じカードをクリックした場合は何もしない
      if (cards[count].ispair || count == firstid) {
        return;
      }

      flip(count); // カードをめくる

      if (firstid < 0) {
        // 1枚目のカードをクリックした時の処理
        firstid = count;
      } else {
        // 2枚目のカードをクリックした時の処理
        if (checkPair(firstid, count)) {
          // ペアだった時の処理
          document.getElementById('message').innerHTML = 'ペアができた';
          cards[firstid].ispair = true;
          cards[count].ispair = true;
        } else {
          // ペアじゃなかった時の処理
          document.getElementById('message').innerHTML = 'ペアじゃない';
          locked = true; // 裏に戻すまでクリックを無効化
          let wk_firstid = firstid;
          setTimeout(function() {
            flip(wk_firstid);
            flip(count);
            document.getElementById('message').innerHTML = '　';
            locked = false; // クリックを再び有効化
          }, 1000); // 1秒後に裏に戻す
        }
        // 状態をリセット
        firstid = -1;
      }
    });

    tr.appendChild(td);
    count++;
  }
  table.appendChild(tr);
}

// 5秒後に、全てのカードを裏にします
setTimeout(function() {
  for (let i = 0; i < 52; i++) {
    let td = document.getElementById(i);
    td.innerHTML = '**<br>**';
    td.style.color = 'green';
  }
}, 5000);

// ===== Step 5: ヘルプ機能 =====

const help = document.getElementById('help');
let help_count = 3;

help.addEventListener('click', function() {
  if (help_count <= 0) {
    return;
  }

  // 裏を向いているカードを、一時的に全部表にします
  for (let i = 0; i < 52; i++) {
    if (!cards[i].isopen) {
      flip(i);
    }
  }

  // 3秒後に、元に戻します
  setTimeout(function() {
    for (let i = 0; i < 52; i++) {
      // ペアになっていなくて、今、表を向いているカードだけ裏にします
      if (!cards[i].ispair && cards[i].isopen) {
        flip(i);
      }
    }
  }, 3000);

  help_count--;
  help.innerHTML = '助けて：のこり' + help_count + '回';

  if (help_count <= 0) {
    help.style.display = 'none';
  }
});
