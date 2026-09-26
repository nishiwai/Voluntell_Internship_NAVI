// トップページ：「新着のインターン募集」に、jobs-data.js の募集を新着順で表示します
// （カードの作り方は cards.js にあります）

document.getElementById("home-job-list").innerHTML = sortedJobs().map(makeCard).join("");
