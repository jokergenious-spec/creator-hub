const assetCategories = ["Characters", "Backgrounds", "Music", "SFX", "Fonts", "Videos", "Logos", "References"];

function getCurrentWorkspaceAssets() {
  const workspace = JSON.parse(localStorage.getItem("currentWorkspace")) || null;
  if (!workspace) return [];
  return workspace.assets || [];
}

function saveCurrentWorkspaceAssets(assets) {
  const workspace = JSON.parse(localStorage.getItem("currentWorkspace")) || null;
  if (!workspace) return;

  workspace.assets = assets;
  localStorage.setItem("currentWorkspace", JSON.stringify(workspace));

  const workspaces = JSON.parse(localStorage.getItem("workspaces")) || [];
  const index = workspaces.findIndex((item) => item.id === workspace.id);
  if (index !== -1) {
    workspaces[index].assets = assets;
    localStorage.setItem("workspaces", JSON.stringify(workspaces));
  }
}

function createAssetObject(file, category) {
  return {
    id: Date.now() + Math.random(),
    name: file.name,
    category,
    type: file.type || "file",
    size: file.size,
    preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    dataUrl: ""
  };
}
