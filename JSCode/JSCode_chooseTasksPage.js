const ROOM_CODE = sessionStorage.getItem("roomCode");
const THIS_PLAYER_INDEX = sessionStorage.getItem("playerIndex");
const THIS_PLAYER_ENEMY_INDEX = sessionStorage.getItem("enemyIndex");
const GRADE_NUM = sessionStorage.getItem("gradeNum");
const SET_OF_TASKS = sessionStorage.getItem("setOfTasks");

const PLAYER_PROFILE_ICON = document.getElementById("playerIcon");
const PLAYER_PROFILE_NAME = document.getElementById("playerName");
const ENEMY_PROFILE_ICON = document.getElementById("enemyIcon");
const ENEMY_PROFILE_NAME = document.getElementById("enemyName");
const PLAYER_PROFILE_GEARS = document.getElementById("playerGears");
const ENEMY_PROFILE_GEARS = document.getElementById("enemyGears");

const DIV_LIST_OF_CARDS = document.getElementById("cardsList");
const ENEMY_SPAN_LIST_OF_TASKS = document.getElementById("enemy_taskLetters");
const PLAYER_SPAN_LIST_OF_TASKS = document.getElementById("player_taskLetters");

var listOfCardsLetter = [];
var listOfPlayerLetter = [];
var listOfEnemyLetter = [];

var cardMade = false;
var cardIsOpen = false;

(async function() {
    await SetUpProfiles();
    Loop();
})();

async function SetUpProfiles() {
    let allPlayers = await SendPost("RoomManager", "GetAllPlayers", { roomCode: ROOM_CODE });

    let playerProfile = allPlayers.players[THIS_PLAYER_INDEX];
    let enemyProfile = allPlayers.players[THIS_PLAYER_ENEMY_INDEX];

    if (playerProfile.icon >= 0)
        PLAYER_PROFILE_ICON.src = ICONS_LIST[playerProfile.icon];
    else
        PLAYER_PROFILE_ICON.src = SPECIAL_ICONS_LIST[(-playerProfile.icon)-1];

    if (enemyProfile.icon >= 0)
        ENEMY_PROFILE_ICON.src = ICONS_LIST[enemyProfile.icon];
    else
        ENEMY_PROFILE_ICON.src = SPECIAL_ICONS_LIST[(-enemyProfile.icon)-1];

    PLAYER_PROFILE_NAME.innerHTML = playerProfile.name + " (Ти)";
    ENEMY_PROFILE_NAME.innerHTML = enemyProfile.name;
}

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
    let allPlayers = await SendPost("RoomManager", "GetAllPlayers", { roomCode: ROOM_CODE });
    let roomInfoPost = await SendPost("RoomManager", "GetRoomInfo", { roomCode: ROOM_CODE });

    if (roomInfoPost.status == 404 && roomInfoPost.description == "No room with this code!") window.location.href = "index.html";
    if (allPlayers.status != 200) PopUpWindow(allPlayers.description);
    if (roomInfoPost.status != 200) PopUpWindow(roomInfoPost.description);

    let myTasks = allPlayers.players[THIS_PLAYER_INDEX].tasks;
    let enemyTasks = allPlayers.players[THIS_PLAYER_ENEMY_INDEX].tasks;
    let roomInfo = roomInfoPost.roomInfo;
    let playerOrder = allPlayers.players[THIS_PLAYER_INDEX].isOrder;

    if (playerOrder) {
        PLAYER_PROFILE_GEARS.style.display = "block";
        ENEMY_PROFILE_GEARS.style.display = "none";
    } else {
        PLAYER_PROFILE_GEARS.style.display = "none";
        ENEMY_PROFILE_GEARS.style.display = "block";
    }

    if (myTasks.length == roomInfo.maxTasks && enemyTasks.length == roomInfo.maxTasks) {
        window.location.href = "programmingPage.html";
    }

    if (allPlayers.players[THIS_PLAYER_INDEX].cardGive) {
        let myCurrentTask = myTasks[myTasks.length - 1];

        let cards = DIV_LIST_OF_CARDS.children;

        for (let currentCard of cards) {
            if (currentCard.querySelector('#taskLetter').innerHTML == `<font size="3"> Задача ${myCurrentTask} </font>`) {
                currentCard.remove();
                break;
            }
        }

        let playerTaskLatter = document.createElement("span");
        playerTaskLatter.innerHTML = myCurrentTask;
        PLAYER_SPAN_LIST_OF_TASKS.appendChild(playerTaskLatter);
        listOfPlayerLetter.push(myCurrentTask);

        let res = await SendPost("RoomManager", "ReceiveTask", { roomCode: ROOM_CODE, playerIndex: parseInt(THIS_PLAYER_INDEX) });

        if (res.status != 200) return PopUpWindow(res.description);

        startedTime = new Date();
    }

    if (!cardMade) {
        let tasksInformation = await SendPost("CPPCompiler", "GetTasks", { taskGrade: GRADE_NUM, taskSet: SET_OF_TASKS });
        let letter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];

        if (tasksInformation.status != 200) return PopUpWindow(tasksInformation.description);

        for (let i = 0; i < 16; i++) {
            CreateCardWithTask(tasksInformation.tasks[i], letter[i]);
        }
        cardMade = !cardMade;
    }
}

function CreateCardWithTask(task, taskPeriod) {
    let taskCard = document.createElement("div");
    taskCard.setAttribute('class', 'classField_1 chooseTasks_cardOfTask');
    taskCard.id = taskPeriod;

    let selectButton = document.createElement("button");
    let infoButton = document.createElement("button");
    let taskLetter = document.createElement("p");
    let taskName = document.createElement("p");

    taskLetter.innerHTML = `<font size="3"> Задача ${taskPeriod} </font>`;
    taskLetter.id = 'taskLetter';
    taskName.innerHTML = `<font size="4"> ${task.name} </font>`;

    selectButton.innerHTML = "✓";
    selectButton.onclick = async function () {
        let res = await SendPost("RoomManager", "GiveTaskToPlayer", { roomCode: ROOM_CODE, playerIndex: parseInt(THIS_PLAYER_ENEMY_INDEX), task: taskPeriod });

        if (res.status != 200) return PopUpWindow(res.description);

        taskCard.remove();

        let enemyTaskLatter = document.createElement("span");
        enemyTaskLatter.innerHTML = taskPeriod;
        ENEMY_SPAN_LIST_OF_TASKS.appendChild(enemyTaskLatter);

        enemyTime = new Date();
    };
    infoButton.innerHTML = "I";
    infoButton.onclick = () => FullTaskField(task, taskPeriod);

    taskCard.appendChild(taskLetter);
    taskCard.appendChild(taskName);
    taskCard.appendChild(selectButton);
    taskCard.appendChild(infoButton);

    listOfCardsLetter.push(taskCard);

    DIV_LIST_OF_CARDS.appendChild(taskCard);
}

function FullTaskField(task, taskPeriod) {
    if (cardIsOpen) return;

    let fullTask = document.createElement("div");
    fullTask.setAttribute('class', 'classField_2 chooseTasks_fullTask');

    let closeButton = document.createElement("button");
    let taskLetter = document.createElement("p");
    let taskName = document.createElement("p");
    let taskCondition = document.createElement("p");

    taskLetter.innerHTML = ` <font size="3"> Задача ${taskPeriod} </font> `;
    taskName.innerHTML = ` <font size="4"> ${task.name} </font> `;
    taskCondition.innerHTML = ` <font size="3"> ${task.description} </font> `;

    closeButton.innerHTML = "✕";
    closeButton.onclick = function () {
        fullTask.remove();
        cardIsOpen = false;
    };

    fullTask.appendChild(taskLetter);
    fullTask.appendChild(taskName);
    fullTask.appendChild(taskCondition);
    fullTask.appendChild(closeButton);

    document.body.appendChild(fullTask);
    cardIsOpen = true;
}
