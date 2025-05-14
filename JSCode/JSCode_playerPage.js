const ROOM_CODE = sessionStorage.getItem("roomCode");
const THIS_PLAYER_INDEX = sessionStorage.getItem("playerIndex");

const PLAYER_DIV_LIST = document.getElementById("playersGrid");
const CHOOSE_IMAGE_GRID = document.getElementById("chooseImageGrid");

var currentRoomPlayers = 0;
let divToPlayer = [];

Loop();


async function Loop() {
    while (true) {
        await SomeAsyncFunction();
        await Delay(100);
    }
}

function Delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function SomeAsyncFunction() {
    let payload = await LoadData();

    if (payload.roomsCodes.length < 1) window.location.href = "index.html";

    if (payload.rooms[ROOM_CODE].isActive)
    {
        await sessionStorage.setItem("gradeNum", payload.rooms[ROOM_CODE].grade);
        await sessionStorage.setItem("setOfTasks", payload.rooms[ROOM_CODE].numberOfTasksSet);
        await sessionStorage.setItem("playerIndex", THIS_PLAYER_INDEX);

        window.location.href = "chooseTasksPage.html";
    }

    for (let i = 0; i < divToPlayer.length; i++)
        UpdatePlayerSkin(payload, i);

    while (payload.rooms[ROOM_CODE].players.length > currentRoomPlayers) {
        NewPlayerIcon(payload, currentRoomPlayers);
        currentRoomPlayers++;
    }

    console.log(THIS_PLAYER_INDEX);
}

function UpdatePlayerSkin(payload, playerIndex) {
    let playerDiv = divToPlayer[playerIndex];

    let playerSkin = payload.rooms[ROOM_CODE].players[playerIndex].skin;
    let playerName = payload.rooms[ROOM_CODE].players[playerIndex].name;

    let imgInsideDiv = playerDiv.querySelector("img");
    let pInsideDiv = playerDiv.querySelector("p");
    imgInsideDiv.src = `./Icons/icon_${playerSkin}.png`;
    if (playerIndex == THIS_PLAYER_INDEX)
        pInsideDiv.textContent = playerName + " (Ти)";
    else
        pInsideDiv.textContent = playerName;
}

function NewPlayerIcon(payload, playerIndex) {
    let playerBox = document.createElement("div");
    playerBox.setAttribute('class', 'player_grid_item');

    let playerBoxSkinImage = document.createElement("img");
    playerBoxSkinImage.src = "./Icons/icon_0.png";
    playerBoxSkinImage.setAttribute('class', 'universal_iconImage');

    let playerBoxName = document.createElement("p");
    if (playerIndex == THIS_PLAYER_INDEX)
        playerBoxName.textContent = payload.rooms[ROOM_CODE].players[playerIndex].name + " (Ти)";
    else
        playerBoxName.textContent = payload.rooms[ROOM_CODE].players[playerIndex].name;

    playerBox.appendChild(playerBoxSkinImage);
    playerBox.appendChild(playerBoxName);

    divToPlayer[playerIndex] = playerBox;

    PLAYER_DIV_LIST.appendChild(playerBox);
}

function SkinMenu() {
    if (CHOOSE_IMAGE_GRID.style.display === "none")
        CHOOSE_IMAGE_GRID.style.display = "grid";
    else
        CHOOSE_IMAGE_GRID.style.display = "none";
}

async function ChooseSkin(skinIndex) {
    let payload = await LoadData();

    payload.rooms[ROOM_CODE].players[THIS_PLAYER_INDEX].skin = skinIndex;

    await SaveData(payload);
}