console.log("Popup script loaded");

document
  .getElementById("fetchDetailsBtn")
  .addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript(
      { target: { tabId: tab.id }, func: scrapeLinkedInInfo },

      async (injectionResults) => {
        if (!injectionResults || !injectionResults[0].result) {
          document.getElementById("result").innerHTML =
            "<p class='no-data'>No Data Found</p>";
          return;
        }

        const profileData = injectionResults[0].result;
        console.log("Scraped Data: ", profileData);
        const email = await fetchEmailFromHunter(profileData);

        document.getElementById("result").innerHTML = `
           <p class="detail"><b>Name:</b> ${profileData.name || "NA"}</p>
           <p class="detail"><b>Designation:</b> ${
             profileData.designation || "NA"
           }</p>
           <p class="detail"><b>Email:</b> ${email || "No Data Found"}</p>
           <p class="detail"><b>Organisation:</b> ${
             profileData.company || "NA"
           }</p>
        `;
      }
    );
  });

function scrapeLinkedInInfo() {
  const name = document.querySelector("h1")?.innerText || "";

  const designation =
    document.querySelector(".text-body-medium")?.innerText || "";

  const company = document.querySelector(
    ".inline-show-more-text--is-collapsed"
  )?.innerText;

  return { name, designation, company };
}

async function fetchEmailFromHunter(profileData) {
  const apiKey = "71ef88c3ea29e9c6e229dcced7065c40d582d303";
  const domain = profileData.company;
  console.log("Domain: ", domain);

  const company = profileData.company;

  if (!company) {
    console.log("No company found");
    return null;
  }

  try {
    const fetchedDomain = company.replace(/\s+/g, "").toLowerCase() + ".com";
    const url = `https://api.hunter.io/v2/domain-search?domain=${fetchedDomain}&api_key=${apiKey}`;
    console.log("Fetching from URL: ", url);

    const res = await fetch(url);
    const data = await res.json();
    console.log("API Data Response: ", data);
  } catch (error) {
    console.error("Hunter API fetch failed:", error);
    return null;
  }
}
