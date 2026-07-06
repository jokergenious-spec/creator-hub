let workspaces = JSON.parse(localStorage.getItem("workspaces")) || [];

const workspaceList = document.getElementById("workspaceList");

function saveWorkspaces(){

    localStorage.setItem(
        "workspaces",
        JSON.stringify(workspaces)
    );

}

function renderWorkspaces(){

    workspaceList.innerHTML = "";

    workspaces.forEach((workspace)=>{

        const card = document.createElement("div");
        card.className = "workspace-card";
        card.innerHTML = `

            <h3>${workspace.name}</h3>

            <p>${workspace.type}</p>

        `;
        card.style.cursor = "pointer";
        card.onclick = () => {

            localStorage.setItem("currentWorkspace", JSON.stringify(workspace));

            window.location.href = "workspace.html";

        };

        workspaceList.appendChild(card);

    });

}

const modal = document.getElementById("workspaceModal");

const addBtn = document.getElementById("addWorkspaceBtn");

const cancelBtn = document.getElementById("cancelBtn");

const createBtn = document.getElementById("createBtn");

addBtn.onclick = () => {

    modal.classList.remove("hidden");

}

cancelBtn.onclick = () => {

    modal.classList.add("hidden");

}

createBtn.onclick = () => {

    const name = document.getElementById("workspaceName").value;

    const type = document.getElementById("workspaceType").value;

    if(name==="") return;

    workspaces.push({

        id: Date.now(),
        name,
        type,
        scripts: []

    });

    saveWorkspaces();

    renderWorkspaces();

    updateDashboard();

    document.getElementById("workspaceName").value="";

    modal.classList.add("hidden");

}

renderWorkspaces();

if (typeof updateDashboard === "function") {
    updateDashboard();
}