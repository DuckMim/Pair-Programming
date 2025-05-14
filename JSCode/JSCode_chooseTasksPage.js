const ROOM_CODE = sessionStorage.getItem("roomCode");
const THIS_PLAYER_INDEX = sessionStorage.getItem("playerIndex");
const GRADE_NUM = sessionStorage.getItem("gradeNum");
const SET_OF_TASKS = sessionStorage.getItem("setOfTasks");

const PLAYER_PROFILE_ICON = document.getElementById("playerIcon");
const PLAYER_PROFILE_NAME = document.getElementById("playerName");
const ENEMY_PROFILE_ICON = document.getElementById("enemyIcon");
const ENEMY_PROFILE_NAME = document.getElementById("enemyName");

const DIV_LIST_OF_CARDS = document.getElementById("cardsList");
const ENEMY_SPAN_LIST_OF_TASKS = document.getElementById("enemy_taskLetters");
const PLAYER_SPAN_LIST_OF_TASKS = document.getElementById("player_taskLetters");

var listOfCardsLetter = [];
var listOfPlayerLetter = [];
var listOfEnemyLetter = [];

var cardMade = false;
var cardIsOpen = false;

Loop();


async function SetUpProfiles(payload) {
    let playerProfile = payload.rooms[ROOM_CODE].players[THIS_PLAYER_INDEX];
    let enemyProfile = payload.rooms[ROOM_CODE].players[playerProfile.enemy];

    PLAYER_PROFILE_ICON.src = `./Icons/icon_${playerProfile.skin}.png`;
    PLAYER_PROFILE_NAME.innerHTML = playerProfile.name + " (Ти)";
    ENEMY_PROFILE_ICON.src = `./Icons/icon_${enemyProfile.skin}.png`;
    ENEMY_PROFILE_NAME.innerHTML = enemyProfile.name;
}

async function Loop() {
    while (true) {
        await SomeAsyncFunction();
        await Delay(75);
    }
}

function Delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function SomeAsyncFunction() {
    let payload = await LoadData();

    if (payload.roomsCodes.length < 1) window.location.href = "index.html";

    let myTasks = payload.rooms[ROOM_CODE].players[THIS_PLAYER_INDEX].tasks;
    let enemyTasks = payload.rooms[ROOM_CODE].players[payload.rooms[ROOM_CODE].players[THIS_PLAYER_INDEX].enemy].tasks;

    if (myTasks.length == payload.rooms[ROOM_CODE].maxCountOfTasks && enemyTasks.length == payload.rooms[ROOM_CODE].maxCountOfTasks) {
        await sessionStorage.setItem("gradeNum", payload.rooms[ROOM_CODE].grade);
        await sessionStorage.setItem("setOfTasks", payload.rooms[ROOM_CODE].numberOfTasksSet);
        await sessionStorage.setItem("playerIndex", THIS_PLAYER_INDEX);
        await sessionStorage.setItem("enemyIndex", payload.rooms[ROOM_CODE].players[THIS_PLAYER_INDEX].enemy);

        window.location.href = "programmingPage.html";
    }

    for (let myCurrentTaskIndex = 0; myCurrentTaskIndex < myTasks.length; myCurrentTaskIndex++) {
        let myCurrentTask = myTasks[myCurrentTaskIndex];
        for (let currentTaskIndex = 0; currentTaskIndex < listOfCardsLetter.length; currentTaskIndex++) {
            if (myCurrentTask == listOfCardsLetter[currentTaskIndex].id) {
                listOfCardsLetter[currentTaskIndex].remove();
                listOfCardsLetter.splice(currentTaskIndex, currentTaskIndex);

                if (!listOfPlayerLetter.includes(myCurrentTask)) {
                    let playerTaskLatter = document.createElement("span");
                    playerTaskLatter.innerHTML = myCurrentTask;
                    PLAYER_SPAN_LIST_OF_TASKS.appendChild(playerTaskLatter);
                    listOfPlayerLetter.push(myCurrentTask);
                }

                break;
            }
        }
    }

    console.log(listOfPlayerLetter.length + " " + myTasks.length);


    if (!cardMade) {
        SetUpProfiles(payload);

        for (let i = 0; i < 16; i++) {
            let taskChar = String.fromCharCode('A'.charCodeAt(0) + i);
            let res = await FetchTask(GRADE_NUM, SET_OF_TASKS, taskChar);
            CreateCardWithTask(res, taskChar);
        }
        cardMade = !cardMade;
    }
}

function CreateCardWithTask(task, taskPeriod) {
    let taskCard = document.createElement("div");
    taskCard.setAttribute('class', 'chooseTasks_cardOfTask');
    taskCard.id = taskPeriod;

    let selectButton = document.createElement("button");
    let infoButton = document.createElement("button");
    let taskLetter = document.createElement("p");
    let taskName = document.createElement("p");

    taskLetter.innerHTML = `<font size="3"> Задача ${taskPeriod} </font>`;
    taskName.innerHTML = `<font size="4"> ${task.name} </font>`;

    selectButton.innerHTML = "✓";
    selectButton.setAttribute('class', 'chooseTasks_cardOfTask_button_select');
    selectButton.onclick = async function () {
        let payload = await LoadData();

        const ENEMY_INDEX = payload.rooms[ROOM_CODE].players[THIS_PLAYER_INDEX].enemy;

        let canPlayerChoose = payload.rooms[ROOM_CODE].players[THIS_PLAYER_INDEX].canChoose;
        console.log(canPlayerChoose + " " + THIS_PLAYER_INDEX);

        if (!canPlayerChoose) return;

        let myTasks = payload.rooms[ROOM_CODE].players[THIS_PLAYER_INDEX].tasks;

        if (listOfEnemyLetter.includes(taskPeriod)) return;
        if (listOfPlayerLetter.includes(taskPeriod)) return;

        for (let myCurrentTaskIndex = 0; myCurrentTaskIndex < myTasks.length; myCurrentTaskIndex++) {
            let myCurrentTask = myTasks[myCurrentTaskIndex];
            if (myCurrentTask == taskPeriod) {
                return;
            }
        }

        payload.rooms[ROOM_CODE].players[ENEMY_INDEX].tasks += taskPeriod;
        listOfEnemyLetter.push(taskPeriod);

        let enemyTaskLatter = document.createElement("span");
        enemyTaskLatter.innerHTML = taskPeriod;
        ENEMY_SPAN_LIST_OF_TASKS.appendChild(enemyTaskLatter);

        payload.rooms[ROOM_CODE].players[THIS_PLAYER_INDEX].canChoose = !canPlayerChoose;
        payload.rooms[ROOM_CODE].players[ENEMY_INDEX].canChoose = canPlayerChoose;

        taskCard.remove();

        await SaveData(payload);
    };
    infoButton.innerHTML = "I";
    infoButton.setAttribute('class', 'chooseTasks_cardOfTask_button_info');
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
    fullTask.setAttribute('class', 'chooseTasks_fullTask');

    let closeButton = document.createElement("button");
    let taskLetter = document.createElement("p");
    let taskName = document.createElement("p");
    let taskCondition = document.createElement("p");

    taskLetter.innerHTML = ` <font size="3"> Задача ${taskPeriod} </font> `;
    taskName.innerHTML = ` <font size="4"> ${task.name} </font> `;
    taskCondition.innerHTML = ` <font size="3"> ${task.description} </font> `;

    taskLetter.setAttribute('class', 'chooseTasks_fullTask_p_letter');
    taskName.setAttribute('class', 'chooseTasks_fullTask_p_name');
    taskCondition.setAttribute('class', 'chooseTasks_fullTask_p_condition');

    closeButton.innerHTML = "✕";
    closeButton.onclick = function () {
        fullTask.remove();
        cardIsOpen = false;
    };
    closeButton.setAttribute('class', 'chooseTasks_fullTask_button_close');

    fullTask.appendChild(taskLetter);
    fullTask.appendChild(taskName);
    fullTask.appendChild(taskCondition);
    fullTask.appendChild(closeButton);

    document.body.appendChild(fullTask);
    cardIsOpen = true;
}
