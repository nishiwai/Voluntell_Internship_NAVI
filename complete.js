// 申込完了ページ：
//   1. 申し込んだ募集の名前を表示する
//   2. LINEボタンに、site-config.js で設定したURLを入れる

const params = new URLSearchParams(location.search);
const localHosts = ["localhost", "127.0.0.1", "[::1]"];
const testMode = location.protocol === "http:" && localHosts.includes(location.hostname) &&
  params.get("job") === "__TEST__" && params.get("test") === "1";
const testJob = {
  id: "__TEST__",
  company: "架空テスト企業",
  title: "架空の動作確認用募集"
};
const job = testMode ? testJob : JOBS.find(function (j) { return j.id === params.get("job"); });

let applicationSaved = false;
if (job) {
  try {
    applicationSaved = Boolean(sessionStorage.getItem("navi-application-saved:" + job.id));
  } catch (error) {
    applicationSaved = false;
  }
}

if (applicationSaved) {
  document.getElementById("complete-pending").hidden = true;
  document.getElementById("complete-success").hidden = false;
  document.querySelector(".line-box").hidden = testMode;
}

if (testMode) {
  const pending = document.querySelector("#complete-pending");
  const success = document.querySelector("#complete-success");
  pending.querySelector("h1").textContent = "架空テストの保存を確認できません";
  pending.querySelector("p").textContent = "テスト用シートへの保存成功を確認できた場合だけ、テスト完了を表示します。";
  success.querySelector("h1").textContent = "架空テストデータの保存を確認しました";
  success.querySelector("p").textContent = "この表示は架空データによる動作確認です。実際の応募受付は行っていません。";
}

if (job) {
  const el = document.getElementById("complete-job");
  el.textContent = "申込み先：" + job.company + "「" + job.title + "」";
  el.hidden = false;
}

const lineButton = document.getElementById("line-button");

if (LINE_URL) {
  lineButton.href = LINE_URL;
  lineButton.target = "_blank";
  lineButton.rel = "noopener";
} else {
  // URLが未設定の間は、押しても移動せず、お知らせだけ出す
  lineButton.addEventListener("click", function (event) {
    event.preventDefault();
    alert("公式LINEのURLはまだ設定されていません。（site-config.js で設定します）");
  });
}
