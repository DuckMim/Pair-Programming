const ROOM_CODE = sessionStorage.getItem("roomCode");
const THIS_PLAYER_ID = sessionStorage.getItem("playerID");
const THIS_ENEMY_ID = sessionStorage.getItem("enemyID");

const PLAYER_PROFILE_ICON = document.getElementById("playerIcon");
const PLAYER_PROFILE_NAME = document.getElementById("playerName");
const PLAYER_PROFILE_SCORE = document.getElementById("playerScore");
const ENEMY_PROFILE_ICON = document.getElementById("enemyIcon");
const ENEMY_PROFILE_NAME = document.getElementById("enemyName");
const ENEMY_PROFILE_SCORE = document.getElementById("enemyScore");

Start();

async function Start() {
    let allPlayersResponse = await SendPost("RoomManager", "GetAllPlayers", { roomCode: ROOM_CODE });
    let roomInfoPost = await SendPost("RoomManager", "GetRoomInfo", { roomCode: ROOM_CODE });
    let roomInfo = roomInfoPost.roomInfo;

    if (allPlayersResponse.status == 404 && allPlayersResponse.description == "No room with this code!") window.location.href = "index.html";

    SetUpProfiles(allPlayersResponse.players, roomInfo);
}

function SetUpProfiles(allPlayers, roomInfo) {
    let playerScore = allPlayers[THIS_PLAYER_ID].score;
    let enemyScore = allPlayers[THIS_ENEMY_ID].score;
    let maxPossibleScore = roomInfo.maxTasks * 100;

    let playerName = allPlayers[THIS_PLAYER_ID].name;
    let enemyName = allPlayers[THIS_ENEMY_ID].name;
    let playerIcon = allPlayers[THIS_PLAYER_ID].icon;
    let enemyIcon = allPlayers[THIS_ENEMY_ID].icon;

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
}