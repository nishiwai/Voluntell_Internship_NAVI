// 募集一覧ページ：jobs-data.js の募集を、新着順のカードにして表示します
// （カードの作り方は cards.js にあります）

const jobsInOrder = sortedJobs();
const jobList = document.getElementById("job-list");
const jobCount = document.getElementById("job-count");
const searchInput = document.getElementById("job-search");
const emptyState = document.getElementById("job-empty");

function renderJobs() {
	const query = searchInput.value.trim().toLocaleLowerCase();
	const filteredJobs = jobsInOrder.filter(function (job) {
		const searchableText = [
			job.company,
			job.title,
			job.industry,
			job.jobCategory,
			job.prefecture,
			job.city,
			job.workStyle,
			job.targets.join(" ")
		].join(" ").toLocaleLowerCase();
		return searchableText.includes(query);
	});

	jobList.innerHTML = filteredJobs.map(makeCard).join("");
	jobCount.textContent = query ? filteredJobs.length + "件" : "全" + jobsInOrder.length + "件";
	emptyState.hidden = filteredJobs.length !== 0;
}

searchInput.addEventListener("input", renderJobs);
renderJobs();
