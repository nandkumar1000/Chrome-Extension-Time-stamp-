document.getElementById("saveTimestamp").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getCurrentTime
  }, async (results) => {
    const { url, title } = tab;
    const time = results[0].result;
    const timestampUrl = `${url.split('&')[0]}&t=${time}s`;

    chrome.storage.sync.get(["ytBookmarks"], (result) => {
      const bookmarks = result.ytBookmarks || [];
      bookmarks.push({ title, time, url: timestampUrl });
      chrome.storage.sync.set({ ytBookmarks: bookmarks }, renderBookmarks);
    });
  });
});

function getCurrentTime() {
  const video = document.querySelector("video");
  return Math.floor(video?.currentTime || 0);
}

function renderBookmarks() {
  chrome.storage.sync.get(["ytBookmarks"], (result) => {
    const bookmarks = result.ytBookmarks || [];
    const list = document.getElementById("bookmarksList");
    list.innerHTML = "";

    bookmarks.forEach((bookmark, index) => {
      const li = document.createElement("li");
      li.textContent = `${bookmark.title} - ${bookmark.time}s`;
      li.addEventListener("click", () => {
        chrome.tabs.create({ url: bookmark.url });
      });
      list.appendChild(li);
    });
  });
}

document.addEventListener("DOMContentLoaded", renderBookmarks);