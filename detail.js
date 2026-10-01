// 募集詳細ページ：アドレスの ?job=募集ID から、jobs-data.js の募集を探して表示します
// （例：detail.html?job=tajima-kogyo）
// どの企業でも同じ形（フォーマット）で表示されます。企業ごとの中身は jobs-data.js を書き換えます。

// モニター掲載のときに表示する注意書き
const MONITOR_NOTICE = "※現在はモニター掲載用のサンプルです。募集内容は正式掲載時に企業と確認のうえ決定します。";

// 応募後の流れ（全企業共通）
const AFTER_APPLY = [
  ["申込みフォームを送信", "必要事項を入力して送信します。"],
  ["Voluntell運営が内容を確認", "まず、Voluntellが申込みを受け付けて記録します。"],
  ["運営からご連絡", "日程や参加方法について、Voluntell運営からご連絡します。"],
  ["インターンに参加", "当日は企業の担当者が迎えます。分からないことは事前に運営へ相談できます。"]
];

// 印（公式情報／モデル）
const CHIP_OFFICIAL = '<span class="src-chip src-official">公式情報</span>';
const CHIP_MODEL = '<span class="src-chip src-model">モデル（仮）</span>';

function list(items) {
  return '<ul class="check-list">' + items.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>";
}

function rows(pairs) {
  return pairs
    .filter(function (p) { return p[1]; })
    .map(function (p) { return "<div><dt>" + esc(p[0]) + "</dt><dd>" + esc(p[1]) + "</dd></div>"; })
    .join("");
}

function block(title, chip, body) {
  return '<section class="detail-block"><h2>' + esc(title) + (chip || "") + "</h2>" + body + "</section>";
}

// 申込みボタン。受付中のときだけ表示し、それ以外は受付できない理由を表示します
function applyAction(state, applyUrl, extraClass) {
  if (state.accepting) {
    return '<a href="' + esc(applyUrl) + '" class="btn btn-primary btn-large btn-block ' + extraClass + '">このインターンに申し込む</a>';
  }
  return '<p class="apply-unavailable" data-state="' + state.key + '">' + esc(state.notice) + "</p>";
}

function renderDetail(job) {
  const m = job.model;
  const o = job.official;
  const isMonitor = job.listingType === "monitor";
  const state = jobState(job);
  const applyUrl = "apply.html?job=" + encodeURIComponent(job.id);

  const logo = job.logoUrl
    ? '<img src="' + esc(job.logoUrl) + '" alt="' + esc(job.company) + '">'
    : esc(job.logoText);
  const tags = job.targets.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("");

  // 1. 会社名・募集タイトル・基本情報・応募ボタン
  let html =
    '<section class="detail-top">' +
      jobImage(job) +
      '<p class="' + state.css + '" data-state="' + state.key + '">' + esc(state.label) + "</p>" +
      '<div class="job-head"><div class="logo">' + logo + '</div><p class="company">' + esc(job.company) + "</p></div>" +
      '<h1 class="detail-title">' + esc(job.title) + "</h1>" +
      '<div class="tags">' + tags + "</div>" +
      (isMonitor ? '<p class="notice-monitor">' + esc(MONITOR_NOTICE) + "</p>" : "") +
      '<dl class="detail-info">' +
        rows([
          ["対象学生", job.targets.join("・")],
          ["勤務地", job.prefecture + " " + job.city],
          ["勤務形態", job.workStyle],
          ["期間", job.period],
          ["応募締切", deadlineText(job)]
        ]).replace("<dd>調整中</dd>", '<dd class="deadline">調整中</dd>') +
      "</dl>" +
      applyAction(state, applyUrl, "detail-apply-top") +
    "</section>";

  // 2. このインターンで体験できること
  html += block("このインターンで体験できること", isMonitor ? CHIP_MODEL : "", "<p>" + esc(m.lead) + "</p>" + list(m.experiences));

  // 3. こんな学生におすすめ
  html += block("こんな学生におすすめ", isMonitor ? CHIP_MODEL : "", list(m.recommended));

  // 4. モデルプログラム／当日の流れ
  html += block(
    isMonitor ? "モデルプログラム（当日の流れ）" : "当日の流れ",
    isMonitor ? CHIP_MODEL : "",
    '<ol class="flow-list">' +
      m.program.map(function (p) { return "<li><strong>" + esc(p[0]) + "</strong>" + esc(p[1]) + "</li>"; }).join("") +
    "</ol>" +
    (isMonitor ? '<p class="note">※ 実際の内容は、企業と相談のうえ決定します。</p>' : "")
  );

  // 5. 募集要項
  const r = m.requirements;
  html += block(
    "募集要項",
    isMonitor ? CHIP_MODEL : "",
    '<dl class="company-info">' +
      rows([
        ["対象", r.target],
        ["期間", r.period],
        ["実施場所", r.place],
        ["実施形式", r.style],
        ["募集人数", r.capacity],
        ["応募締切", deadlineText(job)],
        ["服装・持ち物", r.belongings],
        ["交通費・報酬", r.pay]
      ]) +
    "</dl>"
  );

  // 6. 企業について（公式情報だけ）
  html += block(
    "企業について",
    CHIP_OFFICIAL,
    '<dl class="company-info">' +
      rows([
        ["企業名", job.company],
        ["所在地", o.address],
        ["事業内容", o.business],
        ["設立", o.established]
      ]) +
    "</dl>" +
    '<p class="note">出典：企業の公式サイト（' + esc(formatDate(o.checkedAt)) + " 確認）</p>"
  );

  // 7. 企業公式サイトへのリンク
  html += block(
    "企業の公式サイト",
    "",
    '<a href="' + esc(job.officialUrl) + '" class="btn btn-outline btn-block btn-external" target="_blank" rel="noopener noreferrer">' +
      "企業公式サイトを見る" +
      '<svg class="ext-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    "</a>" +
    '<p class="note">外部サイトが別のタブで開きます。</p>'
  );

  // 8. 応募後の流れ
  html += block(
    "応募後の流れ",
    "",
    '<ol class="flow-list">' +
      AFTER_APPLY.map(function (s, i) {
        return "<li><strong>STEP " + (i + 1) + "</strong>" + esc(s[0]) + "<br><span class=\"flow-sub\">" + esc(s[1]) + "</span></li>";
      }).join("") +
    "</ol>"
  );

  // 9. 応募ボタン（画面の下にも固定表示されます）
  html += block(
    "このインターンに申し込む",
    "",
    (state.accepting ? "<p>ご不明な点があっても、まずは気軽にお申し込みください。</p>" : "") +
    applyAction(state, applyUrl, "")
  );

  return html;
}

const jobId = new URLSearchParams(location.search).get("job");
const detailJob = JOBS.find(function (j) { return j.id === jobId; });
const root = document.getElementById("detail-root");

if (detailJob) {
  root.innerHTML = renderDetail(detailJob);
  document.title = detailJob.title + "｜" + detailJob.company + "｜Voluntell インターンシップNAVI";
  document.getElementById("apply-bar-link").href = "apply.html?job=" + encodeURIComponent(detailJob.id);
  document.getElementById("apply-bar").hidden = !jobState(detailJob).accepting;
} else {
  root.innerHTML =
    '<section class="detail-block"><h1 class="detail-title">募集が見つかりません</h1>' +
    "<p>お探しの募集は、掲載が終了したか、アドレスが正しくない可能性があります。</p>" +
    '<a href="list.html" class="btn btn-outline btn-block">募集一覧を見る</a></section>';
}
