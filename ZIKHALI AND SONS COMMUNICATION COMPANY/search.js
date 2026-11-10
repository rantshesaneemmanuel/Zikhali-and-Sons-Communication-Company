const searchForm = document.getElementById("siteSearch");
const searchInput = document.getElementById("searchInput");
const searchFeedback = document.getElementById("searchFeedback");

// All main website pages
const websitePages = [
    "index.html",
    "about%20us.html",
    "services.html",
    "projects.html",
    "contacts.html"
];

let searchablePages = [];

// Read the actual content of every HTML page
async function loadWebsitePages() {

    searchablePages = [];

    const pagePromises = websitePages.map(async (url) => {

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Page could not be loaded: " + url);
            }

            const html = await response.text();

            const parser = new DOMParser();

            const pageDocument = parser.parseFromString(
                html,
                "text/html"
            );

            // Remove elements that should not be searched
            pageDocument.querySelectorAll(
                "script, style, nav, form, button, " +
                ".search-feedback, .search-results"
            ).forEach(element => element.remove());

            // Get all remaining page text
            const pageContent = pageDocument.body.innerText ||
                                pageDocument.body.textContent || "";

            const pageTitle =
                pageDocument.querySelector("title")?.textContent.trim() ||
                url;

            return {
                title: pageTitle,
                url: url,
                content: pageContent.replace(/\s+/g, " ").trim()
            };

        } catch (error) {

            console.error(error);

            return null;
        }

    });

    const loadedPages = await Promise.all(pagePromises);

    searchablePages = loadedPages.filter(page => page !== null);

    return searchablePages;
}


// Find a useful text preview for each result
function getSearchSnippet(content, queryWords) {

    const lowerContent = content.toLowerCase();

    let position = -1;

    for (const word of queryWords) {

        position = lowerContent.indexOf(word);

        if (position !== -1) {
            break;
        }
    }

    if (position === -1) {
        return content.substring(0, 160) + "...";
    }

    const start = Math.max(0, position - 65);

    const end = Math.min(
        content.length,
        position + 110
    );

    return (start > 0 ? "..." : "") +
           content.substring(start, end) +
           (end < content.length ? "..." : "");
}


// Search all website pages
if (searchForm && searchInput && searchFeedback) {

    searchForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const query = searchInput.value.trim().toLowerCase();

        searchFeedback.hidden = false;
        searchFeedback.innerHTML = "";

        if (!query) {

            searchFeedback.textContent =
                "Please enter something to search.";

            return;
        }

        // Wait until all pages have been read
        searchFeedback.textContent =
            "Searching the website...";

        await loadWebsitePages();

        if (searchablePages.length === 0) {

            searchFeedback.textContent =
                "The website pages could not be loaded. " +
                "Please check your file names and run the website " +
                "using VS Code Live Server.";

            return;
        }

        const queryWords = query.split(/\s+/);

        // Compare the search with actual page content
        const results = searchablePages.map(page => {

            const title = page.title.toLowerCase();
            const content = page.content.toLowerCase();

            let score = 0;

            // Give extra importance to exact phrase matches
            if (content.includes(query)) {
                score += 10;
            }

            if (title.includes(query)) {
                score += 20;
            }

            // Check every individual search word
            queryWords.forEach(word => {

                if (title.includes(word)) {
                    score += 5;
                }

                if (content.includes(word)) {
                    score += 2;
                }

            });

            return {
                ...page,
                score: score
            };

        })
        .filter(page => page.score > 0)
        .sort((a, b) => b.score - a.score);

        searchFeedback.innerHTML = "";

        if (results.length === 0) {

            searchFeedback.textContent =
                "No results found. Please try another search.";

            return;
        }

        const heading = document.createElement("p");

        heading.textContent =
            results.length + " matching page(s) found:";

        searchFeedback.appendChild(heading);

        // Display clickable results
        results.forEach(page => {

            const resultItem = document.createElement("div");

            resultItem.className = "search-result-item";

            const link = document.createElement("a");

            link.href = page.url;
            link.className = "search-result-link";
            link.textContent = page.title;

            const snippet = document.createElement("p");

            snippet.className = "search-result-snippet";

            snippet.textContent = getSearchSnippet(
                page.content,
                queryWords
            );

            resultItem.appendChild(link);
            resultItem.appendChild(snippet);

            searchFeedback.appendChild(resultItem);

        });

    });

}