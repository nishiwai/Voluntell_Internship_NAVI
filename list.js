// 募集一覧ページ：jobs-data.js の募集を、新着順のカードにして表示します
// （カードの作り方は cards.js にあります）

const jobsInOrder = sortedJobs();

document.getElementById("job-list").innerHTML = jobsInOrder.map(makeCard).join("");
document.getElementById("job-count").textContent = "全" + jobsInOrder.length + "件";
