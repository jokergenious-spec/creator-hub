const assetCategories = ["Characters", "Backgrounds", "Music", "SFX", "Fonts", "Videos", "Logos", "References"];

let assetState = {
  assets: [],
  filter: "All",
  search: ""
};

function loadAssets() {
  const workspace = JSON.parse(localStorage.getItem("currentWorkspace")) || null;
  if (!workspace) return [];
  assetState.assets = workspace.assets || [];
  return assetState.assets;
}

function saveAssets() {
  const workspace = JSON.parse(localStorage.getItem("currentWorkspace")) || null;
  if (!workspace) return;

  workspace.assets = assetState.assets;
  localStorage.setItem("currentWorkspace", JSON.stringify(workspace));

  const workspaces = JSON.parse(localStorage.getItem("workspaces")) || [];
  const index = workspaces.findIndex((item) => item.id === workspace.id);
  if (index !== -1) {
    workspaces[index].assets = assetState.assets;
    localStorage.setItem("workspaces", JSON.stringify(workspaces));
  }
}

function renderAssetCategories() {
  const container = document.getElementById("assetCategories");
  if (!container) return;

  const chips = ["All", ...assetCategories].map((category) => `
    <button class="asset-chip ${assetState.filter === category ? "active" : ""}" data-category="${category}">${category}</button>
  `).join("");

  container.innerHTML = chips;

  container.querySelectorAll(".asset-chip").forEach((button) => {
    button.onclick = () => {
      assetState.filter = button.getAttribute("data-category");
      renderAssets();
      renderAssetCategories();
    };
  });
}

function renderAssets() {
  const list = document.getElementById("assetList");
  if (!list) return;

  const assets = assetState.assets.filter((asset) => {
    const matchCategory = assetState.filter === "All" || asset.category === assetState.filter;
    const matchSearch = asset.name.toLowerCase().includes(assetState.search.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (!assets.length) {
    list.innerHTML = "<p>No assets yet.</p>";
    return;
  }

  list.innerHTML = assets.map((asset) => `
    <div class="asset-card">
      <div class="asset-card-top">
        <strong>${asset.name}</strong>
        <span>${asset.category}</span>
      </div>
      <div class="asset-preview">
        ${asset.preview ? `<img src="${asset.preview}" alt="${asset.name}" />` : "📄"}
      </div>
      <div class="asset-actions">
        <button class="copy-prompt-btn secondary" data-action="preview">Preview</button>
        <button class="copy-prompt-btn" data-action="delete">Delete</button>
      </div>
    </div>
  `).join("");

  list.querySelectorAll("[data-action='delete']").forEach((button) => {
    button.onclick = () => {
      const card = button.closest(".asset-card");
      const assetName = card.querySelector("strong").textContent;
      assetState.assets = assetState.assets.filter((asset) => asset.name !== assetName);
      saveAssets();
      renderAssets();
    };
  });
}

function addAssets(files) {
  const category = assetState.filter === "All" ? "References" : assetState.filter;
  files.forEach((file) => {
    const asset = {
      id: Date.now() + Math.random(),
      name: file.name,
      category,
      type: file.type || "file",
      size: file.size,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : ""
    };
    assetState.assets.push(asset);
  });
  saveAssets();
  renderAssets();
}

function initAssetManager() {
  loadAssets();
  renderAssetCategories();
  renderAssets();

  const uploadBtn = document.getElementById("uploadAssetBtn");
  const searchInput = document.getElementById("assetSearch");
  const dropZone = document.getElementById("assetDropZone");

  uploadBtn.onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = () => addAssets(Array.from(input.files || []));
    input.click();
  };

  searchInput.addEventListener("input", (event) => {
    assetState.search = event.target.value;
    renderAssets();
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add("dragging");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove("dragging");
      if (eventName === "drop") {
        addAssets(Array.from(event.dataTransfer.files || []));
      }
    });
  });
}

window.addEventListener("DOMContentLoaded", initAssetManager);
