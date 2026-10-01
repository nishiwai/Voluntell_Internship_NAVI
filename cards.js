// 募集カードを作る共通の部品（トップページ・募集一覧・募集詳細で使います）
// jobs-data.js の次に読み込みます。

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

// 応募締切の表示（決まっていない間は「調整中」）
function deadlineText(job) {
  return job.deadline ? formatDate(job.deadline) : "調整中";
}

// ---- 募集の受付状態（一覧・詳細・申込みの表示と受付可否は、すべてここで決めます） ----

const LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]"];

// 受付先URLが、本番として使える形（https で、自分のパソコン以外）か
function isSecureRemoteUrl(url) {
  return url.protocol === "https:" && !LOCAL_HOSTS.includes(url.hostname);
}

// site-config.js の APPLY_API_URL が設定済みか（このページで site-config.js を読んでいない場合は未設定扱い）
function applyEndpointReady() {
  if (typeof APPLY_API_URL === "undefined" || !APPLY_API_URL) return false;
  try {
    return isSecureRemoteUrl(new URL(APPLY_API_URL, location.href));
  } catch (error) {
    return false;
  }
}

// 今日の日付（日本時間）。締切日は、その日の終わりまで受け付けます
function todayInJapan() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// accepting が true の状態だけ、申込みボタン・申込みフォームを表示します
const JOB_STATES = {
  sample: {
    key: "sample", label: "モニター掲載（サンプル）", css: "badge-monitor", accepting: false,
    notice: "この募集は掲載イメージのサンプルのため、現在は申込を受け付けていません。"
  },
  open: { key: "open", label: "受付中", css: "badge-open", accepting: true, notice: "" },
  preparing: {
    key: "preparing", label: "受付準備中", css: "badge-wait", accepting: false,
    notice: "現在、学生申込の受付準備中です。受付開始後にあらためてお申し込みください。"
  },
  paused: {
    key: "paused", label: "受付一時停止中", css: "badge-wait", accepting: false,
    notice: "この募集は、現在、受付を一時停止しています。受付を再開するまで、お申し込みいただけません。"
  },
  closed: {
    key: "closed", label: "募集終了", css: "badge-closed", accepting: false,
    notice: "この募集は終了しました。"
  }
};

// 優先順：サンプル → 募集終了（status が closed、または締切日を過ぎた）→ 一時停止 → 受付準備中 → 受付中
// 正式募集で status が "open" 以外（書き忘れを含む）のときは、安全のため受付しません。
function jobState(job) {
  if (job.listingType !== "official") return JOB_STATES.sample;
  if (job.status === "closed" || (job.deadline && todayInJapan() > job.deadline)) return JOB_STATES.closed;
  if (job.status !== "open") return JOB_STATES.paused;
  if (!applyEndpointReady()) return JOB_STATES.preparing;
  return JOB_STATES.open;
}

// イメージ画像（一覧・詳細で同じものを使う）。画像が無い募集では何も出さない
function jobImage(job) {
  if (!job.imageUrl) return "";
  return '<figure class="job-image">' +
    '<img src="' + esc(job.imageUrl) + '" alt="' + esc(job.imageAlt || "イメージ画像") + '" loading="lazy">' +
    '<figcaption class="image-label">イメージ画像</figcaption>' +
  "</figure>";
}

// 募集1件ぶんのカード
function makeCard(job) {
  const logo = job.logoUrl
    ? '<img src="' + esc(job.logoUrl) + '" alt="' + esc(job.company) + '">'
    : esc(job.logoText);

  const tags = job.targets
    .map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; })
    .join("");

  const state = jobState(job);
  const badge = '<p class="' + state.css + '" data-state="' + state.key + '">' + esc(state.label) + "</p>";

  return (
    '<article class="job-card">' +
      jobImage(job) +
      badge +
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
        '<div><dt>応募締切</dt><dd class="deadline">' + esc(deadlineText(job)) + "</dd></div>" +
      "</dl>" +
      '<a href="' + esc(job.detailUrl) + '" class="btn btn-outline btn-block">詳細を見る</a>' +
    "</article>"
  );
}

// 初回公開日が新しい順に並べる（同じ日付なら、jobs-data.js に書いた順。更新日は使いません）
function sortedJobs() {
  return JOBS.slice().sort(function (a, b) {
    if (a.publishedAt < b.publishedAt) return 1;
    if (a.publishedAt > b.publishedAt) return -1;
    return 0;
  });
}
