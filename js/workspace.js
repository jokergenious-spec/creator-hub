let workspace = getCurrentWorkspace();

const workspaceTitle = document.getElementById("workspaceTitle");
const workspaceHeading = document.getElementById("workspaceHeading");
const workspaceDetailType = document.getElementById("workspaceDetailType");
const scriptsList = document.getElementById("scriptsList");
const characterList = document.getElementById("characterList");
const scriptModal = document.getElementById("scriptModal");
const newScriptBtn = document.getElementById("newScriptBtn");
const addCharacterBtn = document.getElementById("addCharacterBtn");
const cancelScriptBtn = document.getElementById("cancelScriptBtn");
const createScriptBtn = document.getElementById("createScriptBtn");
const scriptTitleInput = document.getElementById("scriptTitle");
const scriptStatusSelect = document.getElementById("scriptStatus");
const tabButtons = document.querySelectorAll(".tab-btn");
const workspaceSections = document.querySelectorAll(".workspace-detail > *");
const kanbanBoard = document.getElementById("kanbanBoard");
const kanbanStages = ["Ideas", "Writing", "Storyboard", "Voice", "Editing", "Thumbnail", "Published"];
let draggedScriptId = null;

function renderScripts() {
    if (!workspace) {
        scriptsList.innerHTML = "<p>No workspace selected.</p>";
        return;
    }

    const scripts = workspace.scripts || [];

    if (!scripts.length) {
        scriptsList.innerHTML = "<p>No scripts yet.</p>";
        return;
    }

    scriptsList.innerHTML = scripts.map((script) => `
        <div class="script-card" data-script-id="${script.id}">
            <h4>${script.title}</h4>
            <p>${script.status}</p>
        </div>
    `).join("");

    document.querySelectorAll(".script-card").forEach((card) => {
        card.onclick = () => {
            const scriptId = Number(card.getAttribute("data-script-id"));
            const selectedScript = workspace.scripts.find((item) => item.id === scriptId);

            if (selectedScript) {
                localStorage.setItem("currentScript", JSON.stringify(selectedScript));
                window.location.href = "script.html";
            }
        };
    });
}

function renderKanban() {
    if (!workspace || !kanbanBoard) return;

    const scripts = workspace.scripts || [];

    kanbanBoard.innerHTML = kanbanStages.map((stage) => {
        const stageScripts = scripts.filter((script) => (script.stage || "Ideas") === stage);

        return `
            <div class="kanban-column" data-stage="${stage}">
                <div class="kanban-column-header">
                    <h4>${stage}</h4>
                    <span>${stageScripts.length}</span>
                </div>
                <div class="kanban-column-body">
                    ${stageScripts.length ? stageScripts.map((script) => `
                        <div class="kanban-card" draggable="true" data-script-id="${script.id}">
                            <strong>${script.title}</strong>
                            <p>${script.status || "Draft"}</p>
                        </div>
                    `).join("") : '<p class="kanban-empty">Drop here</p>'}
                </div>
            </div>
        `;
    }).join("");

    document.querySelectorAll(".kanban-card").forEach((card) => {
        card.addEventListener("dragstart", (event) => {
            draggedScriptId = Number(card.getAttribute("data-script-id"));
            event.dataTransfer.setData("text/plain", String(draggedScriptId));
        });
    });

    document.querySelectorAll(".kanban-column").forEach((column) => {
        column.addEventListener("dragover", (event) => {
            event.preventDefault();
            column.classList.add("drag-over");
        });

        column.addEventListener("dragleave", () => {
            column.classList.remove("drag-over");
        });

        column.addEventListener("drop", (event) => {
            event.preventDefault();
            column.classList.remove("drag-over");

            const stage = column.getAttribute("data-stage");
            const scriptId = Number(event.dataTransfer.getData("text/plain") || draggedScriptId);

            if (!scriptId || !workspace) return;

            const targetScript = workspace.scripts.find((item) => item.id === scriptId);
            if (targetScript) {
                targetScript.stage = stage;
                saveCurrentWorkspace(workspace);
                renderKanban();
                renderScripts();
            }
        });
    });
}

function renderCharacters() {
    if (!workspace) {
        characterList.innerHTML = "<p>No workspace selected.</p>";
        return;
    }

    const characters = workspace.characters || [];

    if (!characters.length) {
        characterList.innerHTML = "<p>No characters yet.</p>";
        return;
    }

    characterList.innerHTML = characters.map((character) => `
        <div class="prompt-card">
            <div class="prompt-card-header">
                <strong>${character.name || "Character"}</strong>
                <span>${character.role || "Role"}</span>
            </div>
            <div class="character-fields">
                <p><strong>Appearance:</strong> ${character.appearance || ""}</p>
                <p><strong>Personality:</strong> ${character.personality || ""}</p>
                <p><strong>Voice:</strong> ${character.voice || ""}</p>
                <p><strong>Reference Prompt:</strong> ${character.referencePrompt || ""}</p>
                <p><strong>Negative Prompt:</strong> ${character.negativePrompt || ""}</p>
                <p><strong>Expressions:</strong> ${character.expressions || ""}</p>
                <p><strong>Notes:</strong> ${character.notes || ""}</p>
            </div>
        </div>
    `).join("");
}

if (workspace) {
    workspaceTitle.textContent = workspace.name;
    workspaceHeading.textContent = workspace.name;
    workspaceDetailType.textContent = workspace.type;
}

newScriptBtn.onclick = () => {
    scriptModal.classList.remove("hidden");
};

addCharacterBtn.onclick = () => {
    if (!workspace) return;

    if (!Array.isArray(workspace.characters)) {
        workspace.characters = [];
    }

    workspace.characters.push(createCharacterTemplate(`Character ${workspace.characters.length + 1}`));
    saveWorkspaceCharacters(workspace.characters);
    renderCharacters();
};

cancelScriptBtn.onclick = () => {
    scriptTitleInput.value = "";
    scriptStatusSelect.value = "Draft";
    scriptModal.classList.add("hidden");
};

createScriptBtn.onclick = () => {
    const title = scriptTitleInput.value.trim();

    if (!title) return;

    workspace = addScriptToWorkspace(title, scriptStatusSelect.value, "Ideas");

    if (workspace) {
        renderScripts();
        renderKanban();
        scriptTitleInput.value = "";
        scriptStatusSelect.value = "Draft";
        scriptModal.classList.add("hidden");
    }
};

document.getElementById("backBtn").onclick = () => {
    window.location.href = "index.html";
};

tabButtons.forEach((button) => {
    button.onclick = () => {
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        const view = button.getAttribute("data-view");

        workspaceSections.forEach((section) => {
            section.style.display = "none";
        });

        const target = document.querySelector(`[data-view-content="${view}"]`);
        if (target) {
            target.style.display = "block";
        } else {
            document.querySelector(".workspace-detail").style.display = "block";
        }
    };
});

function downloadText(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

document.querySelectorAll(".export-btn").forEach((button) => {
    button.onclick = () => {
        const type = button.getAttribute("data-export");
        const currentScript = JSON.parse(localStorage.getItem("currentScript")) || null;

        if (!currentScript) {
            alert("No script selected.");
            return;
        }

        if (type === "outline") {
            downloadText(`${currentScript.title || "script"}-outline.txt`, currentScript.hook || "");
        } else if (type === "script") {
            const text = [currentScript.title, "", currentScript.hook, "", currentScript.act1, "", currentScript.act2, "", currentScript.act3, "", currentScript.ending, "", currentScript.notes].join("\n\n");
            downloadText(`${currentScript.title || "script"}-script.txt`, text);
        } else if (type === "storyboard") {
            const text = (currentScript.storyboard || []).map((scene, index) => `Scene ${index + 1}\nDuration: ${scene.duration || 5} sec\nImage Prompt: ${scene.image || ""}\nMotion Prompt: ${scene.motion || ""}\nVoiceover: ${scene.voice || ""}`).join("\n\n");
            downloadText(`${currentScript.title || "script"}-storyboard.txt`, text);
        } else if (type === "images") {
            const text = (currentScript.images || []).map((image, index) => `Prompt ${index + 1}: ${image.title}\n${image.prompt || ""}`).join("\n\n");
            downloadText(`${currentScript.title || "script"}-image-prompts.txt`, text);
        } else if (type === "json") {
            downloadText(`${currentScript.title || "script"}.json`, JSON.stringify(currentScript, null, 2));
        }
    };
});

renderScripts();
renderKanban();
renderCharacters();