// 募集一覧ページ：jobs-data.js の募集を、新着順のカードにして表示します

// 文字に < や & が入っても安全に表示するための処理
function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// 2026-11-30 → 2026年11月30日
function formatDate(text) {
  const p = text.split("-");
  return p[0] + "年" + Number(p[1]) + "月" + Number(p[2]) + "日";
}

// 募集1件ぶんのカード（トップページのカードと同じ形）
function makeCard(job) {
  const logo = job.logoUrl
    ? '<img src="' + esc(job.logoUrl) + '" alt="' + esc(job.company) + '">'
    : esc(job.logoText);

  const tags = job.targets
    .map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; })
    .join("");

  return (
    '<article class="job-card">' +
      '<div class="job-head">' +
        '<div class="logo">' + logo + "</div>" +
        '<p class="company">' + esc(job.company) + "</p>" +
      "</div>" +
      '<h3 class="job-title">' + esc(job.title) + "</h3>" +
      '<div class="tags">' + tags + "</div>" +
      '<ul class="meta">' +
        "<li>📍 " + esc(job.prefecture) + " " + esc(job.city) + "</li>" +
        "<li>🏢 " + esc(job.workStyle) + "</li>" +
      "</ul>" +
      '<dl class="job-info">' +
        "<div><dt>期間</dt><dd>" + esc(job.period) + "</dd></div>" +
        '<div><dt>応募締切</dt><dd class="deadline">' + esc(formatDate(job.deadline)) + "</dd></div>" +
      "</dl>" +
      '<a href="' + esc(job.detailUrl) + '" class="btn btn-outline btn-block">詳細を見る</a>' +
    "</article>"
  );
}

// 初回公開日が新しい順に並べる（更新日は使いません）
const sortedJobs = JOBS.slice().sort(function (a, b) {
  if (a.publishedAt < b.publishedAt) return 1;
  if (a.publishedAt > b.publishedAt) return -1;
  return 0;
});

document.getElementById("job-list").innerHTML = sortedJobs.map(makeCard).join("");
document.getElementById("job-count").textContent = "全" + sortedJobs.length + "件";
