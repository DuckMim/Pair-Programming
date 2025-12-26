const ROOM_CODE = sessionStorage.getItem("roomCode");
const THIS_PLAYER_ID = sessionStorage.getItem("playerID");

const PLAYER_DIV_LIST = document.getElementById("playersGrid");
const CHOOSE_IMAGE_GRID = document.getElementById("chooseImageGrid");
const SKIN_CODE_INPUT = document.getElementById("skineCodeInput");


var currentRoomPlayers = new Set();
let divToPlayer = {};
let playersIDs = [];

Loop();


async function Loop() {
    while (true) {
        await MainLoop();
        await Delay(1000);
    }
}

function Delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function MainLoop() {
    let allPlayersResponse = await SendPost("RoomManager", "GetAllPlayers", { roomCode: ROOM_CODE });
    let roomInfoPost = await SendPost("RoomManager", "GetRoomInfo", { roomCode: ROOM_CODE });

    if (roomInfoPost.status == 404 && roomInfoPost.description == "No room with this code!") window.location.href = "index.html";
    if (allPlayersResponse.status != 200) PopUpWindow(allPlayersResponse.description);
    if (roomInfoPost.status != 200) PopUpWindow(roomInfoPost.description);

    let roomInfo = roomInfoPost.roomInfo;
    let allPlayers = allPlayersResponse.players;

    if (roomInfo.isStartedGame && allPlayers[THIS_PLAYER_ID].enemy != -1)
    {
        sessionStorage.setItem("setOfTasks", roomInfo.taskSet);
        sessionStorage.setItem("enemyID", allPlayers[THIS_PLAYER_ID].enemy);

        window.location.href = "chooseTasksPage.html";
    }

    playersIDs = Object.keys(allPlayers);

    for (let currentPlayerID of playersIDs) {
        if (!currentRoomPlayers.has(currentPlayerID)) {
            NewPlayerIcon(allPlayers, currentPlayerID);
            currentRoomPlayers.add(currentPlayerID);
        }

        UpdatePlayerSkin(allPlayers, currentPlayerID);
    }
}

function UpdatePlayerSkin(allPlayers, playerID) {
    let playerDiv = divToPlayer[playerID];

    let playerIcon = allPlayers[playerID].icon;
    let playerName = allPlayers[playerID].name;

    let imgInsideDiv = playerDiv.querySelector("img");
    let pInsideDiv = playerDiv.querySelector("p");

    if (playerIcon >= 0)
        imgInsideDiv.src = ICONS_LIST[playerIcon];
    else
        imgInsideDiv.src = SPECIAL_ICONS_LIST[(-playerIcon)-1];

    if (playerID == THIS_PLAYER_ID)
        pInsideDiv.textContent = playerName + " (Ти)";
    else
        pInsideDiv.textContent = playerName;
}

function NewPlayerIcon(allPlayers, playerID) {
    let playerIcon = allPlayers[playerID].icon;
    let playerName = allPlayers[playerID].name;

    let playerBox = document.createElement("div");
    playerBox.setAttribute('class', 'classField_1 admin_player_playerIcon');

    let playerBoxSkinImage = document.createElement("img");
    playerBoxSkinImage.src = ICONS_LIST[playerIcon];
    playerBoxSkinImage.setAttribute('class', 'universal_iconImage');

    let playerBoxName = document.createElement("p");
    if (playerID == THIS_PLAYER_ID)
        playerBoxName.textContent = playerName + " (Ти)";
    else
        playerBoxName.textContent = playerName;
    playerBoxName.setAttribute('class', 'admin_player_playerIcon_name');

    playerBox.appendChild(playerBoxSkinImage);
    playerBox.appendChild(playerBoxName);

    divToPlayer[playerID] = playerBox;

    PLAYER_DIV_LIST.appendChild(playerBox);
}

function SkinMenu() {
    if (!CHOOSE_IMAGE_GRID.classList.contains("show")) {
        CHOOSE_IMAGE_GRID.classList.add("show");
    } else {
        CHOOSE_IMAGE_GRID.classList.remove("show");
    }
}

async function ChooseSkin(skinIndex) {
    let changeIconPost = await SendPost("RoomManager", "ChangeIcon", { roomCode: ROOM_CODE, playerID: THIS_PLAYER_ID, newIcon: parseInt(skinIndex), code: "0000" });
    if (changeIconPost.status != 200) PopUpWindow(changeIconPost.description);
}

async function ChooseSkinCode() {
    let changeIconPost = await SendPost("RoomManager", "ChangeIcon", { roomCode: ROOM_CODE, playerID: THIS_PLAYER_ID, newIcon: parseInt(0), code: SKIN_CODE_INPUT.value });
    if (changeIconPost.status != 200) PopUpWindow(changeIconPost.description);
}
