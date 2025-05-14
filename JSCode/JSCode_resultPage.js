const ROOM_CODE = sessionStorage.getItem("roomCode");
const THIS_PLAYER_INDEX = sessionStorage.getItem("playerIndex");
const THIS_ENEMY_INDEX = sessionStorage.getItem("enemyIndex");

const PLAYER_PROFILE_ICON = document.getElementById("playerIcon");
const PLAYER_PROFILE_NAME = document.getElementById("playerName");
const PLAYER_PROFILE_SCORE = document.getElementById("playerScore");
const ENEMY_PROFILE_ICON = document.getElementById("enemyIcon");
const ENEMY_PROFILE_NAME = document.getElementById("enemyName");
const ENEMY_PROFILE_SCORE = document.getElementById("enemyScore");

Start();

async function Start() {
    let payload = await LoadData();

    if (payload.roomsCodes.length < 1) window.location.href = "index.html";

    SetUpProfiles(payload);
}

function SetUpProfiles(payload) {
    let playerScore = payload.rooms[ROOM_CODE].players[THIS_PLAYER_INDEX].score;
    let enemyScore = payload.rooms[ROOM_CODE].players[THIS_ENEMY_INDEX].score;
    let maxPosibleScore = payload.rooms[ROOM_CODE].maxCountOfTasks * 100;

    let playerName = payload.rooms[ROOM_CODE].players[THIS_PLAYER_INDEX].name;
    let enemyName = payload.rooms[ROOM_CODE].players[THIS_ENEMY_INDEX].name;
    let playerIcon = payload.rooms[ROOM_CODE].players[THIS_PLAYER_INDEX].skin;
    let enemyIcon = payload.rooms[ROOM_CODE].players[THIS_ENEMY_INDEX].skin;

    PLAYER_PROFILE_SCORE.innerHTML = `${playerScore}/${maxPosibleScore}`;
    ENEMY_PROFILE_SCORE.innerHTML = `${enemyScore}/${maxPosibleScore}`;

    PLAYER_PROFILE_ICON.src = `./Icons/icon_${playerIcon}.png`;
    PLAYER_PROFILE_NAME.innerHTML = playerName + " (Ти)";
    ENEMY_PROFILE_ICON.src = `./Icons/icon_${enemyIcon}.png`;
    ENEMY_PROFILE_NAME.innerHTML = enemyName;
}