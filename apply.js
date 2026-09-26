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

// 学生区分に合わせて、学年の選択肢を切り替える
const GRADES = {
  "大学生": ["1年", "2年", "3年", "4年", "修士1年", "修士2年", "その他"],
  "短大生": ["1年", "2年"],
  "専門学生": ["1年", "2年", "3年", "4年"],
  "高校生": ["1年", "2年", "3年"]
};
const categorySelect = document.getElementById("category");
const gradeSelect = document.getElementById("grade");

categorySelect.addEventListener("change", function () {
  const list = GRADES[categorySelect.value] || [];
  gradeSelect.innerHTML = "";
  const first = document.createElement("option");
  first.value = "";
  first.textContent = list.length ? "選んでください" : "先に学生区分を選んでください";
  gradeSelect.appendChild(first);
  list.forEach(function (g) {
    const opt = document.createElement("option");
    opt.textContent = g;
    gradeSelect.appendChild(opt);
  });
  gradeSelect.disabled = list.length === 0;
});

document.getElementById("apply-form").addEventListener("submit", function (event) {
  event.preventDefault(); // ここで止めて、下の処理で完了ページへ進む
  // 個人情報はアドレスに載せず、募集IDだけを引き継ぐ
  location.href = "complete.html?job=" + encodeURIComponent(job.id);
});
