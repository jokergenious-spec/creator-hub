function getCurrentWorkspaceData() {
  return JSON.parse(localStorage.getItem("currentWorkspace")) || null;
}

function saveWorkspaceCharacters(characters) {
  const workspace = getCurrentWorkspaceData();
  if (!workspace) return;

  workspace.characters = characters;
  localStorage.setItem("currentWorkspace", JSON.stringify(workspace));

  const workspaces = JSON.parse(localStorage.getItem("workspaces")) || [];
  const index = workspaces.findIndex((item) => item.id === workspace.id);
  if (index !== -1) {
    workspaces[index].characters = characters;
    localStorage.setItem("workspaces", JSON.stringify(workspaces));
  }
}

function createCharacterTemplate(name = "New Character") {
  return {
    id: Date.now(),
    name,
    role: "",
    appearance: "",
    personality: "",
    voice: "",
    referencePrompt: "",
    negativePrompt: "",
    expressions: "",
    notes: ""
  };
}
