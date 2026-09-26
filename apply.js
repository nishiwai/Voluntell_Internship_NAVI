// 申込フォームページ：
//   1. アドレスの ?job=募集ID から、申し込む募集を探して表示する
//   2. 送信ボタンを押したら、申込完了ページへ移動する（試作版：何も送信・保存しない）

const params = new URLSearchParams(location.search);
const jobId = params.get("job");
const job = JOBS.find(function (j) { return j.id === jobId; });

if (job) {
  document.getElementById("apply-company").textContent = job.company;
  document.getElementById("apply-title").textContent = job.title;
  document.getElementById("apply-job").hidden = false;
  document.getElementById("apply-form").hidden = false;
} else {
  // 募集IDが無い・間違っているとき
  document.getElementById("apply-error").hidden = false;
}

document.getElementById("apply-form").addEventListener("submit", function (event) {
  event.preventDefault(); // ここで止めて、下の処理で完了ページへ進む
  // 個人情報はアドレスに載せず、募集IDだけを引き継ぐ
  location.href = "complete.html?job=" + encodeURIComponent(job.id);
});
