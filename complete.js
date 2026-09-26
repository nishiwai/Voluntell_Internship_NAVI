// 申込完了ページ：
//   1. 申し込んだ募集の名前を表示する
//   2. LINEボタンに、site-config.js で設定したURLを入れる

const params = new URLSearchParams(location.search);
const job = JOBS.find(function (j) { return j.id === params.get("job"); });

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
