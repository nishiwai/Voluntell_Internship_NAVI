// 掲載相談フォームページ：
//   1. 入力内容をチェックする（足りない所があれば、上にお知らせを出す）
//   2. 問題なければ、Google Apps Script（スプレッドシートへ保存する窓口）へ送る
//   3. 保存に成功したときだけ、相談完了ページへ移動する

// 送信先：Google Apps Script のウェブアプリURL
// 保存先を変えるときは、この1行を差し替えます（返事の形 {"ok":true} が同じなら、他は変更不要）
const CONSULT_ENDPOINT = "https://script.google.com/macros/s/AKfycbz37sRcFvbxFfjMZlt1CwayyAxzvxCQd1U9FaBM-sGEaxds0uRBXZD-wc_yUWp7bqv9Wg/exec";
const SEND_TIMEOUT_MS = 15000; // 15秒たっても返事がなければ、失敗として扱う
const SEND_ERROR_TEXT = "送信できませんでした。入力内容はそのまま残っています。時間をおいて、もう一度お試しください。";

const form = document.getElementById("consult-form");
const errorBox = document.getElementById("consult-error");
const submitButton = document.getElementById("submit-button");
const submitLabel = submitButton.textContent;
let sending = false; // 送信中かどうか（二重送信を防ぐ）

// エラーを、フォーム上部の赤い枠に出す（1行ずつ「・」付き）
function showErrors(list) {
  errorBox.innerHTML = "";
  list.forEach(function (text) {
    const line = document.createElement("span");
    line.style.display = "block";
    line.textContent = "・" + text;
    errorBox.appendChild(line);
  });
  errorBox.hidden = false;
  errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
}

// 送信できる状態に戻す
function finishSending() {
  sending = false;
  submitButton.disabled = false;
  submitButton.textContent = submitLabel;
}

// Google Apps Script へ送る。成功なら何も返さず、失敗なら文章つきで例外を投げる
async function sendToScript(payload) {
  const controller = new AbortController();
  const timer = setTimeout(function () { controller.abort(); }, SEND_TIMEOUT_MS);
  try {
    // Content-Type を text/plain にするのは、Apps Script が受け付けるため（application/json だと失敗する）
    // 文字列はブラウザが自動でUTF-8にするので、日本語もそのまま送れる
    const response = await fetch(CONSULT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const result = await response.json();
    if (!result || result.ok !== true) {
      // 受付側が理由を返してきたときは、その文章を利用者に見せる
      const rejected = new Error(result && result.error ? result.error : SEND_ERROR_TEXT);
      rejected.fromServer = true;
      throw rejected;
    }
  } finally {
    clearTimeout(timer);
  }
}

form.addEventListener("submit", async function (event) {
  event.preventDefault(); // ここで止めて、下でチェックしてから送信する
  if (sending) return;    // 送信中に、もう一度押されても無視する

  const company = form.company.value.trim();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const message = form.message.value.trim();

  const errors = [];
  let firstBad = null;
  function bad(field, text) {
    errors.push(text);
    if (!firstBad) firstBad = field;
  }

  if (!company) bad(form.company, "会社名を入力してください。");
  if (!name) bad(form.name, "担当者名を入力してください。");
  if (!email) {
    bad(form.email, "メールアドレスを入力してください。");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    bad(form.email, "メールアドレスの形式が正しくありません。（例：example@company.co.jp）");
  }
  // 電話番号は任意。入力があるときだけ、数字・ハイフン・+・カッコ・空白で10桁以上かを見る
  if (phone && (!/^[0-9+\-()\s]+$/.test(phone) || phone.replace(/\D/g, "").length < 10)) {
    bad(form.phone, "電話番号は、数字とハイフンで入力してください。（例：03-1234-5678）");
  }
  if (!message) bad(form.message, "相談内容を入力してください。");
  if (!form.consent.checked) bad(form.consent, "個人情報の取扱いへの同意にチェックを入れてください。");

  if (errors.length > 0) {
    showErrors(errors);
    firstBad.focus({ preventScroll: true });
    return;
  }

  errorBox.hidden = true;

  // 送信中は、ボタンを押せなくする（二重送信の防止）
  sending = true;
  submitButton.disabled = true;
  submitButton.textContent = "送信中…";

  try {
    await sendToScript({
      companyName: company,
      contactName: name,
      email: email,
      phone: phone,
      message: message,
      website: form.website.value // ボット対策：人は空のまま。入っていたら受付側が捨てる
    });
    // 保存に成功したときだけ、完了ページへ進む。個人情報はアドレスに載せない
    location.href = "consult-complete.html";
  } catch (err) {
    // 失敗：入力内容は消さず、理由（分かるとき）を表示して、もう一度送れる状態に戻す
    // 通信エラー・時間切れ・返事が読めないときは、共通の文章にする
    showErrors([err && err.fromServer ? err.message : SEND_ERROR_TEXT]);
    finishSending();
  }
});
