const submissionsApi = `https://leetcode.com/api/submissions`;
const limit = 20;
const gapTime = 2500;

async function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  });
}

async function allSubmissions() {
  let submissions = [];
  let offset = 0;
  let hasNext = true;
  let time = gapTime;
  while (hasNext) {
    try {
      const data = await fetch(`${submissionsApi}?offset=${offset}&limit=${limit}`);
      const json = await data.json();
      let currentSubmissions = json["submissions_dump"];
      currentSubmissions = currentSubmissions.filter(
        (submission) => submission.status_display === "Accepted"
      );
      currentSubmissions.forEach((submission) => {
        submission.timestamp *= 1000;
      });
      submissions = [...submissions, ...currentSubmissions];
      hasNext = json.has_next;
      offset += 20;
      console.log(`Submissions collected so far: ${offset}`);
      await sleep(gapTime);
    } catch (error) {
      time += 100;
      await sleep(time);
      console.log(error.response.data);
    }
  }
  return submissions;
}

const saveTemplateAsFile = (filename, dataObjToWrite) => {
  const blob = new Blob([JSON.stringify(dataObjToWrite)], { type: "text/json" });
  const link = document.createElement("a");

  link.download = filename;
  link.href = window.URL.createObjectURL(blob);
  link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");

  const evt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
  });

  link.dispatchEvent(evt);
  link.remove()
};

async function main() {
  const submissions = await allSubmissions();
  saveTemplateAsFile('submissions.json', submissions);
}

main();