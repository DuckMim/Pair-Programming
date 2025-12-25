const ROOM_CODE = sessionStorage.getItem("roomCode");
const THIS_PLAYER_INDEX = sessionStorage.getItem("playerIndex");
const THIS_PLAYER_ENEMY_INDEX = sessionStorage.getItem("enemyIndex");
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

let tasksInformation;

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

    listOfPlayerLetter = playerProfile.tasks.split("");
    listOfEnemyLetter = enemyProfile.tasks.split("");

    for (let playerTask of listOfPlayerLetter) {
        let playerTaskLatter = document.createElement("span");
        playerTaskLatter.innerHTML = playerTask;
        PLAYER_SPAN_LIST_OF_TASKS.appendChild(playerTaskLatter);
    }
    for (let playerTask of listOfEnemyLetter) {
        let playerTaskLatter = document.createElement("span");
        playerTaskLatter.innerHTML = playerTask;
        ENEMY_SPAN_LIST_OF_TASKS.appendChild(playerTaskLatter);
    }
}

async function Loop() {
    while (true) {
        await MainLoop();
        await Delay(100);
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
            if (currentCard.querySelector('#taskLetter').innerHTML == `<font size="4"> ${myCurrentTask} </font>`) {
                currentCard.remove();

                let currentTaskInformation = tasksInformation[myCurrentTask.charCodeAt(0)-'A'.charCodeAt(0)];

                await sessionStorage.setItem(`Name {myCurrentTask}`, currentTaskInformation.name);
                await sessionStorage.setItem(`Limits {myCurrentTask}`, currentTaskInformation.limits);
                await sessionStorage.setItem(`Description {myCurrentTask}`, currentTaskInformation.description);
                await sessionStorage.setItem(`InputExplanation {myCurrentTask}`, currentTaskInformation.inputExplanation);
                await sessionStorage.setItem(`OutputExplanation {myCurrentTask}`, currentTaskInformation.outputExplanation);
                await sessionStorage.setItem(`Examples {myCurrentTask}`, currentTaskInformation.examples);
                
                break;
            }
        }

        let playerTaskLatter = document.createElement("span");
        playerTaskLatter.innerHTML = myCurrentTask;
        PLAYER_SPAN_LIST_OF_TASKS.appendChild(playerTaskLatter);
        listOfPlayerLetter.push(myCurrentTask);

        let res = await SendPost("RoomManager", "ReceiveTask", { roomCode: ROOM_CODE, playerIndex: THIS_PLAYER_INDEX });

        if (res.status != 200) return PopUpWindow(res.description);

        startedTime = new Date();
    }

    if (!cardMade) {
        tasksInformation = await SendPost("CPPCompiler", "GetTasks", { taskSet: SET_OF_TASKS });
        let letter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];

        if (tasksInformation.status != 200) return PopUpWindow(tasksInformation.description);

        for (let i = 0; i < 16; i++) {
            if (listOfPlayerLetter.includes(letter[i]) || listOfEnemyLetter.includes(letter[i])) continue;
            
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

    taskName.style.margin = "10px";
    taskName.style.fontWeight = "bold";

    taskLetter.innerHTML = `<font size="4"> ${taskPeriod} </font>`;
    taskLetter.id = 'taskLetter';
    taskName.innerHTML = `<font size="4"> ${task.name} </font>`;

    selectButton.innerHTML = `<svg style="margin-bottom: -20%;" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.2426 16.3137L6 12.071L7.41421 10.6568L10.2426 13.4853L15.8995 7.8284L17.3137 9.24262L10.2426 16.3137Z"fill="currentColor"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12ZM12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z" fill="currentColor"/> </svg>`;
    selectButton.onclick = async function () {
        let res = await SendPost("RoomManager", "GiveTaskToPlayer", { roomCode: ROOM_CODE, playerIndex: parseInt(THIS_PLAYER_ENEMY_INDEX), task: taskPeriod });

        if (res.status != 200) return PopUpWindow(res.description);

        taskCard.remove();

        let enemyTaskLatter = document.createElement("span");
        enemyTaskLatter.innerHTML = taskPeriod;
        ENEMY_SPAN_LIST_OF_TASKS.appendChild(enemyTaskLatter);

        enemyTime = new Date();
    };
    infoButton.innerHTML = `<svg style="margin-bottom: -20%;" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 10.9794C11 10.4271 11.4477 9.97937 12 9.97937C12.5523 9.97937 13 10.4271 13 10.9794V16.9794C13 17.5317 12.5523 17.9794 12 17.9794C11.4477 17.9794 11 17.5317 11 16.9794V10.9794Z" fill="currentColor"/>
    <path d="M12 6.05115C11.4477 6.05115 11 6.49886 11 7.05115C11 7.60343 11.4477 8.05115 12 8.05115C12.5523 8.05115 13 7.60343 13 7.05115C13 6.49886 12.5523 6.05115 12 6.05115Z" fill="currentColor"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12Z" fill="currentColor"/> </svg>`;
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

    closeButton.innerHTML = `<svg style="margin-bottom: -20%;" width="18" height="18"  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.3394 9.32245C16.7434 8.94589 16.7657 8.31312 16.3891 7.90911C16.0126 7.50509 15.3798 7.48283 14.9758 7.85938L12.0497 10.5866L9.32245 7.66048C8.94589 7.25647 8.31312 7.23421 7.90911 7.61076C7.50509 7.98731 7.48283 8.62008 7.85938 9.0241L10.5866 11.9502L7.66048 14.6775C7.25647 15.054 7.23421 15.6868 7.61076 16.0908C7.98731 16.4948 8.62008 16.5171 9.0241 16.1405L11.9502 13.4133L14.6775 16.3394C15.054 16.7434 15.6868 16.7657 16.0908 16.3891C16.4948 16.0126 16.5171 15.3798 16.1405 14.9758L13.4133 12.0497L16.3394 9.32245Z" fill="currentColor"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12ZM12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z" fill="currentColor" /> </svg>`;
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
