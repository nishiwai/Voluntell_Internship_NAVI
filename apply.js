// 申込フォームページ：
//   1. アドレスの ?job=募集ID から、申し込む募集を探して表示する
//   2. 学生専用Apps Scriptへ申込内容を送り、保存成功時だけ完了ページへ移動する

// 画面に表示している同意文の版（apply.html の同意文を変えたら、ここも変える）
const CONSENT_VERSION = "student-application-v1";

const params = new URLSearchParams(location.search);
const jobId = params.get("job");
const localHosts = ["localhost", "127.0.0.1", "[::1]"];
const testMode = location.protocol === "http:" && localHosts.includes(location.hostname) &&
  jobId === "__TEST__" && params.get("test") === "1";
const testJob = {
  id: "__TEST__",
  listingType: "test",
  company: "架空テスト企業",
  title: "架空の動作確認用募集"
};
const job = testMode ? testJob : JOBS.find(function (j) { return j.id === jobId; });
const applyForm = document.getElementById("apply-form");
const submitError = document.getElementById("apply-submit-error");
const submitButton = applyForm.querySelector("button[type='submit']");
const submitLabel = submitButton.textContent;
const endpointValue = testMode ? APPLY_TEST_API_URL : APPLY_API_URL;
let applicationEndpoint = null;
try {
  if (endpointValue) applicationEndpoint = new URL(endpointValue, location.href);
} catch (error) {
  applicationEndpoint = null;
}
const secureRemoteEndpoint = applicationEndpoint && applicationEndpoint.protocol === "https:" &&
  !localHosts.includes(applicationEndpoint.hostname);
const localTestEndpoint = testMode && applicationEndpoint && localHosts.includes(applicationEndpoint.hostname);
const applicationAvailable = Boolean(secureRemoteEndpoint || localTestEndpoint);
let sending = false;

// 送信先（Apps Script）の応答を待つ時間。保存後の応答が遅れることがあるため長めにしている
const REQUEST_TIMEOUT_MS = 45000;

// 時間切れでも、受付が完了している場合がある。同じ画面で押し直せば、受付キーが同じなので二重には登録されない
function showTimeoutError() {
  submitError.textContent = "通信エラー [REQUEST_TIMEOUT]: 送信先から時間内に応答がありませんでした。" +
    "受付が完了している可能性があります。同じ画面のまま、もう一度「この内容で申し込む」を押して再確認してください。" +
    "別のタブや別のブラウザーから、もう一度応募しないでください。";
  submitError.hidden = false;
}

if (testMode) {
  document.querySelector(".proto-note").textContent = "テスト専用画面です。実在する個人情報は入力せず、架空データだけを使用してください。";
  document.getElementById("apply-company").textContent = job.company;
  document.getElementById("apply-title").textContent = job.title;
  document.getElementById("apply-job").hidden = false;
  document.querySelector(".consent-text").textContent = "このテストでは入力内容を専用のテスト用シートに保存します。実在する個人情報は入力しないでください。";
  if (applicationAvailable) {
    applyForm.hidden = false;
  } else {
    const errorBox = document.getElementById("apply-error");
    errorBox.textContent = "テスト送信先が設定されていません。site-config.js の APPLY_TEST_API_URL を設定してください。";
    errorBox.hidden = false;
  }
} else if (job && job.listingType === "official") {
  document.getElementById("apply-company").textContent = job.company;
  document.getElementById("apply-title").textContent = job.title;
  document.getElementById("apply-job").hidden = false;
  if (applicationAvailable) {
    applyForm.hidden = false;
  } else {
    const errorBox = document.getElementById("apply-error");
    errorBox.textContent = "現在、学生申込の受付準備中です。受付開始後にあらためてお申し込みください。";
    errorBox.hidden = false;
  }
} else if (job) {
  const errorBox = document.getElementById("apply-error");
  errorBox.textContent = "この募集は掲載イメージのサンプルのため、現在は申込を受け付けていません。";
  errorBox.hidden = false;
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
const guardianField = document.getElementById("guardian-field");
const guardianCheck = document.getElementById("guardian");

categorySelect.addEventListener("change", function () {
  // 高校生を選んだときだけ、保護者への確認欄を表示して必須にする（応募者の自己申告）
  const isHighSchool = categorySelect.value === "高校生";
  guardianField.hidden = !isHighSchool;
  guardianCheck.required = isHighSchool;
  if (!isHighSchool) guardianCheck.checked = false;

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

applyForm.addEventListener("submit", async function (event) {
  event.preventDefault(); // ここで止めて、下の処理で完了ページへ進む
  if (!job || (!testMode && job.listingType !== "official") || sending) return;

  const studentTypes = {
    "大学生": "university",
    "短大生": "junior_college",
    "専門学生": "vocational",
    "高校生": "high_school"
  };
  const category = document.getElementById("category").value;
  const isHighSchool = category === "高校生";
  if (isHighSchool && !guardianCheck.checked) {
    submitError.textContent = "高校生の方は、「保護者に応募を伝え、了承を得ています」にチェックを入れてください。";
    submitError.hidden = false;
    return;
  }
  let requestKey;
  try {
    const storageKey = "navi-application-request:" + job.id;
    requestKey = sessionStorage.getItem(storageKey);
    if (!requestKey) {
      if (!window.crypto || typeof window.crypto.randomUUID !== "function") {
        throw new Error("Secure request IDs are unavailable.");
      }
      requestKey = window.crypto.randomUUID();
      sessionStorage.setItem(storageKey, requestKey);
    }
  } catch (error) {
    submitError.textContent = "安全に送信を準備できませんでした。ブラウザーの設定を確認して、もう一度お試しください。";
    submitError.hidden = false;
    return;
  }

  const payload = {
    requestKey: requestKey,
    job_id: job.id,
    job_name: job.title,
    name: document.getElementById("name").value.trim(),
    school_name: document.getElementById("school").value.trim(),
    student_type: studentTypes[category] ? category : "",
    grade: document.getElementById("grade").value,
    email: document.getElementById("email").value.trim(),
    phone_number: document.getElementById("phone").value.trim(),
    reason: document.getElementById("message").value.trim(),
    consent: document.getElementById("consent").checked,
    consent_version: CONSENT_VERSION,
    guardian_confirmed: isHighSchool && guardianCheck.checked
  };
  if (testMode) payload.testMode = true;

  sending = true;
  submitButton.disabled = true;
  submitButton.textContent = "送信中…";
  submitError.hidden = true;

  const controller = new AbortController();
  const timer = setTimeout(function () { controller.abort(); }, REQUEST_TIMEOUT_MS);

  try {
    let response;
    try {
      response = await fetch(applicationEndpoint.href, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } catch (error) {
      if (error.name === "AbortError") {
        showTimeoutError();
        return;
      }
      submitError.textContent = "通信エラー [NETWORK_ERROR]: 送信先へ接続できませんでした。ネットワークを確認してください。";
      submitError.hidden = false;
      return;
    }

    let result;
    try {
      result = await response.json();
    } catch (error) {
      if (error.name === "AbortError") {
        // 応答の本文を読んでいる途中で時間切れになった場合も、保存済みの可能性がある
        showTimeoutError();
        return;
      }
      submitError.textContent = "応答エラー [INVALID_RESPONSE]: 送信先の応答を読み取れませんでした。設定とアクセス権を確認してください。";
      submitError.hidden = false;
      return;
    }

    if (result && result.ok === false) {
      const errorCode = typeof result.errorCode === "string" && /^[A-Z0-9_]{1,40}$/.test(result.errorCode)
        ? result.errorCode
        : "SERVER_REJECTED";
      const description = typeof result.description === "string"
        ? result.description.slice(0, 300)
        : (typeof result.error === "string" ? result.error.slice(0, 300) : "送信先が申込を受け付けませんでした。");
      submitError.textContent = "受付エラー [" + errorCode + "]: " + description;
      submitError.hidden = false;
      return;
    }
    if (!response.ok || !result || result.ok !== true || typeof result.applicationId !== "string") {
      submitError.textContent = "応答エラー [INVALID_RESPONSE]: 保存成功を確認できる応答ではありませんでした。";
      submitError.hidden = false;
      return;
    }

    try {
      sessionStorage.setItem("navi-application-saved:" + job.id, result.applicationId);
      sessionStorage.removeItem("navi-application-request:" + job.id);
    } catch (error) {
      submitError.textContent = "申込の保存は確認できましたが、完了状態を保持できませんでした。重複送信を避けるため再送せず、運営へお問い合わせください。";
      submitError.hidden = false;
      return;
    }

    // 個人情報をURLへ含めず、保存成功後に募集IDだけを引き継ぐ
    location.href = "complete.html?job=" + encodeURIComponent(job.id) + (testMode ? "&test=1" : "");
  } finally {
    clearTimeout(timer);
    sending = false;
    submitButton.disabled = false;
    submitButton.textContent = submitLabel;
  }
});
