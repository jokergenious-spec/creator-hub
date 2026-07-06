let script = JSON.parse(localStorage.getItem("currentScript"));

const storyboardTitle = document.getElementById("storyboardTitle");
const storyboardStatus = document.getElementById("storyboardStatus");
const sceneList = document.getElementById("sceneList");
const addSceneBtn = document.getElementById("addSceneBtn");

function saveStoryboard() {
  if (!script) return;

  const scenes = Array.from(sceneList.querySelectorAll(".scene-card")).map((card) => ({
    duration: Number(card.querySelector(".scene-duration").value || 5),
    image: card.querySelector(".scene-image").value,
    motion: card.querySelector(".scene-motion").value,
    voice: card.querySelector(".scene-voice").value,
    reference: card.querySelector(".scene-reference").value,
    status: card.querySelector(".scene-status").value || "Draft"
  }));

  script.storyboard = scenes;
  localStorage.setItem("currentScript", JSON.stringify(script));

  const workspaces = JSON.parse(localStorage.getItem("workspaces")) || [];
  const workspace = JSON.parse(localStorage.getItem("currentWorkspace"));

  if (workspace) {
    const index = workspaces.findIndex((item) => item.id === workspace.id);
    if (index !== -1) {
      const targetScript = workspaces[index].scripts.find((item) => item.id === script.id);
      if (targetScript) {
        targetScript.storyboard = scenes;
      }
      localStorage.setItem("workspaces", JSON.stringify(workspaces));
    }
  }

  storyboardStatus.textContent = "Saved ✓";
}

async function copySceneToClipboard(scene, index) {
  const text = [
    `Scene ${index + 1}`,
    `Voiceover: ${scene.voice || ""}`,
    `Image Prompt: ${scene.image || ""}`,
    `Motion Prompt: ${scene.motion || ""}`,
    `Reference: ${scene.reference || ""}`,
    `Duration: ${scene.duration || 5}s`,
    `Status: ${scene.status || "Draft"}`
  ].join("\n");

  try {
    await navigator.clipboard.writeText(text);
    storyboardStatus.textContent = "Copied ✓";
  } catch (error) {
    storyboardStatus.textContent = "Copy failed";
  }
}

function renderStoryboard() {
  if (!script) {
    sceneList.innerHTML = "<p>No script selected.</p>";
    return;
  }

  const scenes = Array.isArray(script.storyboard) && script.storyboard.length
    ? script.storyboard
    : [{ duration: 5, image: "", motion: "", voice: "", reference: "", status: "Draft" }];

  storyboardTitle.textContent = script.title || "Storyboard";
  storyboardStatus.textContent = script.status || "Draft";

  sceneList.innerHTML = scenes.map((scene, index) => `
    <div class="scene-card">
      <div class="scene-card-header">
        <div>
          <h4 class="scene-card-title">Scene ${index + 1}</h4>
          <p class="scene-card-meta">Storyboard card</p>
        </div>
        <div class="scene-card-actions">
          <select class="scene-status">
            <option value="Draft" ${scene.status === "Draft" ? "selected" : ""}>Draft</option>
            <option value="Review" ${scene.status === "Review" ? "selected" : ""}>Review</option>
            <option value="Approved" ${scene.status === "Approved" ? "selected" : ""}>Approved</option>
          </select>
          <button class="copy-prompt-btn scene-copy-btn" type="button">Copy</button>
        </div>
      </div>

      <div class="scene-card-grid">
        <div>
          <label>Duration (sec)</label>
          <input class="scene-duration" type="number" min="1" value="${scene.duration || 5}" />
        </div>
        <div>
          <label>Reference</label>
          <input class="scene-reference" type="text" value="${scene.reference || ""}" />
        </div>
      </div>

      <label>Voiceover</label>
      <textarea class="scene-voice">${scene.voice || ""}</textarea>
      <label>Image Prompt</label>
      <textarea class="scene-image">${scene.image || ""}</textarea>
      <label>Motion Prompt</label>
      <textarea class="scene-motion">${scene.motion || ""}</textarea>
    </div>
  `).join("");

  sceneList.querySelectorAll(".scene-copy-btn").forEach((button, index) => {
    button.onclick = () => {
      const scene = scenes[index];
      copySceneToClipboard(scene, index);
      saveStoryboard();
    };
  });

  sceneList.querySelectorAll("input, textarea, select").forEach((field) => {
    field.addEventListener("input", () => {
      storyboardStatus.textContent = "Typing...";
    });
  });
}

addSceneBtn.onclick = () => {
  if (!script) return;
  if (!Array.isArray(script.storyboard)) {
    script.storyboard = [];
  }
  script.storyboard.push({ duration: 5, image: "", motion: "", voice: "", reference: "", status: "Draft" });
  localStorage.setItem("currentScript", JSON.stringify(script));
  renderStoryboard();
};

document.getElementById("backBtn").onclick = () => {
  window.location.href = "workspace.html";
};

renderStoryboard();
