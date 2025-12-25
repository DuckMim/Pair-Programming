const ROOM_CODE = sessionStorage.getItem("roomCode");
const THIS_PLAYER_INDEX = sessionStorage.getItem("playerIndex");

const PLAYER_DIV_LIST = document.getElementById("playersGrid");
const CHOOSE_IMAGE_GRID = document.getElementById("chooseImageGrid");
const SKIN_CODE_INPUT = document.getElementById("skineCodeInput");


var currentRoomPlayers = 0;
let divToPlayer = [];

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
    let allPlayers = await SendPost("RoomManager", "GetAllPlayers", { roomCode: ROOM_CODE });
    let roomInfoPost = await SendPost("RoomManager", "GetRoomInfo", { roomCode: ROOM_CODE });

    if (roomInfoPost.status == 404 && roomInfoPost.description == "No room with this code!") window.location.href = "index.html";
    if (allPlayers.status != 200) PopUpWindow(allPlayers.description);
    if (roomInfoPost.status != 200) PopUpWindow(roomInfoPost.description);

    let roomInfo = roomInfoPost.roomInfo;

    if (roomInfo.isStartedGame && allPlayers.players[THIS_PLAYER_INDEX].enemy != -1)
    {
        await sessionStorage.setItem("setOfTasks", roomInfo.taskSet);
        await sessionStorage.setItem("enemyIndex", allPlayers.players[THIS_PLAYER_INDEX].enemy);

        window.location.href = "chooseTasksPage.html";
    }

    for (let i = 0; i < divToPlayer.length; i++)
        UpdatePlayerSkin(allPlayers.players, i);

    while (allPlayers.players.length > currentRoomPlayers) {
        NewPlayerIcon(allPlayers.players, currentRoomPlayers);
        currentRoomPlayers++;
    }
}

function UpdatePlayerSkin(payload, playerIndex) {
    let playerDiv = divToPlayer[playerIndex];

    let playerSkin = payload[playerIndex].icon;
    let playerName = payload[playerIndex].name;

    let imgInsideDiv = playerDiv.querySelector("img");
    let pInsideDiv = playerDiv.querySelector("p");

    if (playerSkin >= 0)
        imgInsideDiv.src = ICONS_LIST[playerSkin];
    else
        imgInsideDiv.src = SPECIAL_ICONS_LIST[(-playerSkin)-1];

    if (playerIndex == THIS_PLAYER_INDEX)
        pInsideDiv.textContent = playerName + " (Ти)";
    else
        pInsideDiv.textContent = playerName;
}

function NewPlayerIcon(payload, playerIndex) {
    let playerBox = document.createElement("div");
    playerBox.setAttribute('class', 'classField_1 admin_player_playerIcon');

    let playerBoxSkinImage = document.createElement("img");
    playerBoxSkinImage.src = ICONS_LIST[0];
    playerBoxSkinImage.setAttribute('class', 'universal_iconImage');

    let playerBoxName = document.createElement("p");
    if (playerIndex == THIS_PLAYER_INDEX)
        playerBoxName.textContent = payload[playerIndex].name + " (Ти)";
    else
        playerBoxName.textContent = payload[playerIndex].name;
    playerBoxName.setAttribute('class', 'admin_player_playerIcon_name');

    playerBox.appendChild(playerBoxSkinImage);
    playerBox.appendChild(playerBoxName);

    divToPlayer[playerIndex] = playerBox;

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
    let ans = await SendPost("RoomManager", "ChangeIcon", { roomCode: ROOM_CODE, playerIndex: THIS_PLAYER_INDEX, newIcon: parseInt(skinIndex), code: "0000" });
    if (ans.status != 200) PopUpWindow(ans.description);
}

async function ChooseSkinCode() {
    let ans = await SendPost("RoomManager", "ChangeIcon", { roomCode: ROOM_CODE, playerIndex: THIS_PLAYER_INDEX, newIcon: parseInt(0), code: SKIN_CODE_INPUT.value });
    if (ans.status != 200) PopUpWindow(ans.description);
}
