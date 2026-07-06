let script = JSON.parse(localStorage.getItem("currentScript"));

const scriptTitle = document.getElementById("scriptTitle");
const scriptStatus = document.getElementById("scriptStatus");
const scriptInputTitle = document.getElementById("scriptInputTitle");
const scriptHook = document.getElementById("scriptHook");
const scriptAct1 = document.getElementById("scriptAct1");
const scriptAct2 = document.getElementById("scriptAct2");
const scriptAct3 = document.getElementById("scriptAct3");
const scriptEnding = document.getElementById("scriptEnding");
const scriptNotes = document.getElementById("scriptNotes");
const saveScriptBtn = document.getElementById("saveScriptBtn");
const addPromptBtn = document.getElementById("addPromptBtn");
const promptList = document.getElementById("promptList");
const promptLibraryList = document.getElementById("promptLibraryList");

const promptLibrary = [
    { name: "Google", text: "Create a cinematic, high-detail visual concept for Google-inspired branding, with clean composition, vibrant lighting, and polished modern aesthetics." },
    { name: "Flow", text: "Generate a sleek, story-driven visual prompt with smooth motion, cinematic framing, and rich detail for a motion design sequence." },
    { name: "ChatGPT", text: "Create a polished, professional AI-generated artwork prompt that feels modern, clear, and visually striking for content creation." },
    { name: "Gemini", text: "Design a futuristic, high-quality concept image with soft lighting, layered depth, and premium digital textures." },
    { name: "Midjourney", text: "Produce a dramatic, artistic, high-fashion visual concept with cinematic lighting, detailed textures, and strong composition." },
    { name: "Flux", text: "Create a refined, detailed image prompt with realism, balanced lighting, and strong subject clarity for social media content." },
    { name: "Runway", text: "Generate a dynamic video-style prompt with motion energy, visual storytelling, and cinematic camera movement." },
    { name: "Kling", text: "Create a high-impact AI video prompt with expressive motion, dramatic atmosphere, and professional visual polish." }
];

function updateStatus(message) {
    scriptStatus.textContent = message;
}

function renderPromptLibrary() {
    if (!promptLibraryList) return;

    promptLibraryList.innerHTML = promptLibrary.map((item) => `
        <button class="prompt-library-btn" type="button" data-template="${item.text}">${item.name}</button>
    `).join("");

    promptLibraryList.querySelectorAll(".prompt-library-btn").forEach((button) => {
        button.onclick = async () => {
            const template = button.getAttribute("data-template");
            const targetCard = promptList.querySelector(".prompt-card") || null;

            if (targetCard) {
                const textarea = targetCard.querySelector(".prompt-textarea");
                if (textarea) {
                    textarea.value = template;
                    textarea.focus();
                }
            }

            try {
                await navigator.clipboard.writeText(template);
                updateStatus(`${button.textContent} copied ✓`);
            } catch (error) {
                updateStatus("Copy failed");
            }
        };
    });
}

function getPromptCards() {
    if (!script) return [];
    if (!Array.isArray(script.images)) {
        script.images = [];
    }
    return script.images;
}

function renderPrompts() {
    const prompts = getPromptCards();

    if (!prompts.length) {
        prompts.push({ title: "Prompt 1", prompt: "" });
    }

    promptList.innerHTML = prompts.map((prompt, index) => `
        <div class="prompt-card">
            <div class="prompt-card-header">
                <input class="prompt-title-input" value="${prompt.title || `Prompt ${index + 1}`}" />
                <button class="copy-prompt-btn" type="button">Copy</button>
            </div>
            <textarea class="prompt-textarea" placeholder="Write your image prompt here...">${prompt.prompt || ""}</textarea>
            <div class="prompt-actions">
                <button class="save-prompt-btn" type="button">Save</button>
                <button class="copy-prompt-btn secondary" type="button">Copy</button>
            </div>
        </div>
    `).join("");

    promptList.querySelectorAll(".save-prompt-btn").forEach((button) => {
        button.onclick = () => saveScript();
    });

    promptList.querySelectorAll(".copy-prompt-btn").forEach((button) => {
        button.onclick = () => {
            const card = button.closest(".prompt-card");
            const textarea = card.querySelector(".prompt-textarea");
            navigator.clipboard.writeText(textarea.value);
            updateStatus("Copied ✓");
        };
    });

    promptList.querySelectorAll(".prompt-title-input, .prompt-textarea").forEach((field) => {
        field.addEventListener("input", () => {
            updateStatus("Typing...");
        });
    });
}

function saveScript() {
    if (!script) return;

    updateStatus("Saving...");

    script.title = scriptInputTitle.value.trim() || script.title;
    script.hook = scriptHook.value;
    script.act1 = scriptAct1.value;
    script.act2 = scriptAct2.value;
    script.act3 = scriptAct3.value;
    script.ending = scriptEnding.value;
    script.notes = scriptNotes.value;

    const promptCards = promptList.querySelectorAll(".prompt-card");
    script.images = Array.from(promptCards).map((card, index) => ({
        title: card.querySelector(".prompt-title-input").value.trim() || `Prompt ${index + 1}`,
        prompt: card.querySelector(".prompt-textarea").value
    }));

    const workspaces = JSON.parse(localStorage.getItem("workspaces")) || [];
    const workspace = JSON.parse(localStorage.getItem("currentWorkspace"));

    if (workspace) {
        const index = workspaces.findIndex((item) => item.id === workspace.id);
        if (index !== -1) {
            const targetScript = workspaces[index].scripts.find((item) => item.id === script.id);
            if (targetScript) {
                Object.assign(targetScript, script);
            }
            localStorage.setItem("workspaces", JSON.stringify(workspaces));
        }
    }

    localStorage.setItem("currentScript", JSON.stringify(script));
    scriptTitle.textContent = script.title;
    updateStatus("Saved ✓");
}

if (script) {
    scriptTitle.textContent = script.title;
    scriptStatus.textContent = script.status;
    scriptInputTitle.value = script.title;
    scriptHook.value = script.hook || "";
    scriptAct1.value = script.act1 || "";
    scriptAct2.value = script.act2 || "";
    scriptAct3.value = script.act3 || "";
    scriptEnding.value = script.ending || "";
    scriptNotes.value = script.notes || "";
    if (!Array.isArray(script.images) || !script.images.length) {
        script.images = [{ title: "Prompt 1", prompt: "" }];
    }
}

renderPromptLibrary();
renderPrompts();

document.getElementById("backBtn").onclick = () => {
    window.location.href = "workspace.html";
};

saveScriptBtn.onclick = saveScript;

const editorFields = [scriptInputTitle, scriptHook, scriptAct1, scriptAct2, scriptAct3, scriptEnding, scriptNotes];

editorFields.forEach((field) => {
    field.addEventListener("input", () => {
        updateStatus("Typing...");
    });
});

addPromptBtn.onclick = () => {
    const prompts = getPromptCards();
    prompts.push({ title: `Prompt ${prompts.length + 1}`, prompt: "" });
    script.images = prompts;
    renderPrompts();
    updateStatus("Typing...");
};

setInterval(() => {
    if (!script) return;
    saveScript();
}, 2000);

