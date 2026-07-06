function getStoredWorkspaces() {
    return JSON.parse(localStorage.getItem("workspaces")) || [];
}

function saveWorkspaces(workspaces) {
    localStorage.setItem("workspaces", JSON.stringify(workspaces));
}

function getCurrentWorkspace() {
    const current = JSON.parse(localStorage.getItem("currentWorkspace"));
    if (!current) return null;
    return current;
}

function saveCurrentWorkspace(workspace) {
    const workspaces = getStoredWorkspaces();
    const index = workspaces.findIndex(item => item.id === workspace.id);

    if (index !== -1) {
        workspaces[index] = workspace;
        saveWorkspaces(workspaces);
    }

    localStorage.setItem("currentWorkspace", JSON.stringify(workspace));
    return workspace;
}

function addScriptToWorkspace(title, status, stage = "Ideas") {
    const workspace = getCurrentWorkspace();

    if (!workspace) return null;

    const script = {
        id: Date.now(),
        title,
        status,
        stage,
        created: new Date().toISOString().slice(0, 10)
    };

    workspace.scripts = workspace.scripts || [];
    workspace.scripts.unshift(script);

    return saveCurrentWorkspace(workspace);
}
