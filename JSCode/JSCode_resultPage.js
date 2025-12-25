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
    let allPlayers = await SendPost("RoomManager", "GetAllPlayers", { roomCode: ROOM_CODE });
    let roomInfoPost = await SendPost("RoomManager", "GetRoomInfo", { roomCode: ROOM_CODE });
    let roomInfo = roomInfoPost.roomInfo;

    if (allPlayers.status == 404 && allPlayers.description == "No room with this code!") window.location.href = "index.html";

    SetUpProfiles(allPlayers.players, roomInfo);
}

function SetUpProfiles(allPlayers, roomInfo) {
    let playerScore = allPlayers[THIS_PLAYER_INDEX].score;
    let enemyScore = allPlayers[THIS_ENEMY_INDEX].score;
    let maxPossibleScore = roomInfo.maxTasks * 100;

    let playerName = allPlayers[THIS_PLAYER_INDEX].name;
    let enemyName = allPlayers[THIS_ENEMY_INDEX].name;
    let playerIcon = allPlayers[THIS_PLAYER_INDEX].icon;
    let enemyIcon = allPlayers[THIS_ENEMY_INDEX].icon;

    PLAYER_PROFILE_SCORE.innerHTML = `${playerScore}/${maxPossibleScore}`;
    ENEMY_PROFILE_SCORE.innerHTML = `${enemyScore}/${maxPossibleScore}`;

    if (playerIcon >= 0)
        PLAYER_PROFILE_ICON.src = ICONS_LIST[playerIcon];
    else
        PLAYER_PROFILE_ICON.src = SPECIAL_ICONS_LIST[(-playerIcon)-1];

    PLAYER_PROFILE_NAME.innerHTML = playerName + " (Ти)";

    if (enemyIcon >= 0)
        ENEMY_PROFILE_ICON.src = ICONS_LIST[enemyIcon];
    else
        ENEMY_PROFILE_ICON.src = SPECIAL_ICONS_LIST[(-enemyIcon)-1];

    ENEMY_PROFILE_NAME.innerHTML = enemyName;

    sessionStorage.clear();
}