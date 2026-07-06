const projectCard = document.querySelectorAll(".card span")[0];
const globalSearchInput = document.getElementById("globalSearchInput");
const searchResults = document.getElementById("searchResults");
const calendarGrid = document.getElementById("calendarGrid");

function updateDashboard(){
    const workspaces = JSON.parse(localStorage.getItem("workspaces")) || [];
    projectCard.innerText = workspaces.length;
    renderCalendar();
    renderSearchResults();
}

function renderCalendar() {
    if (!calendarGrid) return;

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const uploads = ["Script", "Storyboard", "Voice", "Edit", "Thumbnail", "Publish"];

    calendarGrid.innerHTML = days.map((day, index) => `
        <div class="calendar-day">
            <strong>${day}</strong>
            <span>${uploads[index % uploads.length]}</span>
        </div>
    `).join("");
}

function renderSearchResults() {
    if (!searchResults || !globalSearchInput) return;

    const query = globalSearchInput.value.trim().toLowerCase();
    const workspaces = JSON.parse(localStorage.getItem("workspaces")) || [];

    if (!query) {
        searchResults.innerHTML = "<p class=\"search-empty\">Search scripts, prompts, and workspaces.</p>";
        return;
    }

    const results = [];

    workspaces.forEach((workspace) => {
        if (workspace.name?.toLowerCase().includes(query)) {
            results.push({ type: "Workspace", label: workspace.name, detail: workspace.type || "Workspace" });
        }

        (workspace.scripts || []).forEach((script) => {
            if (script.title?.toLowerCase().includes(query) || script.notes?.toLowerCase().includes(query) || script.hook?.toLowerCase().includes(query)) {
                results.push({ type: "Script", label: script.title, detail: workspace.name });
            }

            (script.images || []).forEach((image) => {
                if (image.prompt?.toLowerCase().includes(query) || image.title?.toLowerCase().includes(query)) {
                    results.push({ type: "Prompt", label: image.title || "Prompt", detail: `${workspace.name} / ${script.title}` });
                }
            });
        });
    });

    if (!results.length) {
        searchResults.innerHTML = "<p class=\"search-empty\">No matches found.</p>";
        return;
    }

    searchResults.innerHTML = results.slice(0, 8).map((item) => `
        <div class="search-result-item">
            <strong>${item.label}</strong>
            <p>${item.type} • ${item.detail}</p>
        </div>
    `).join("");
}

if (globalSearchInput) {
    globalSearchInput.addEventListener("input", renderSearchResults);
}

updateDashboard();
