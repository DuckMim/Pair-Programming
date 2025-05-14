const ROOM_CODE = sessionStorage.getItem("roomCode");
const GRADE_NUM = sessionStorage.getItem("gradeNum");
const SET_OF_TASKS = sessionStorage.getItem("setOfTasks");
const THIS_PLAYER_INDEX = sessionStorage.getItem("playerIndex");
const THIS_ENEMY_INDEX = sessionStorage.getItem("enemyIndex");

const EDITOR = document.getElementById("editor");
const TASK_FIELD = document.getElementById("tasksField");
const TASK_BUTTONS_FIELD = document.getElementById("tasksButtons");
const RESULT_FIELD = document.getElementById("resultField");
const TIMER_FIELD = document.getElementById("timer");

const PLAYER_PROFILE_ICON = document.getElementById("playerIcon");
const PLAYER_PROFILE_NAME = document.getElementById("playerName");
const PLAYER_PROFILE_SCORE = document.getElementById("playerScore");
const ENEMY_PROFILE_ICON = document.getElementById("enemyIcon");
const ENEMY_PROFILE_NAME = document.getElementById("enemyName");
const ENEMY_PROFILE_SCORE = document.getElementById("enemyScore");

const BOM_CHAR = '\uFEFF';

let myTasks;
let enemyTasks;

let currentTask = "A";

let setUpProfiles = false;

let resultScoresOnTasks = new Map();
let resultTextOnTasks = new Map();
let codeOnTasks = new Map();

Loop();


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

    SetTimer(payload);

    myTasks = payload.rooms[ROOM_CODE].players[THIS_PLAYER_INDEX].tasks;
    enemyTasks = payload.rooms[ROOM_CODE].players[THIS_ENEMY_INDEX].tasks;

    RESULT_FIELD.innerText = resultTextOnTasks.get(currentTask);

    SetUpProfiles(payload);
}

function SetTimer(payload) {
    const START_TIME = new Date(payload.rooms[ROOM_CODE].startTimeForTasks);
    const TIME_FOR_TASKS = payload.rooms[ROOM_CODE].maxTimeForTasks;
    let currentTime = new Date();
    let elapsedMilliseconds = currentTime - START_TIME;
    
    let totalSeconds = TIME_FOR_TASKS*60 - Math.floor(elapsedMilliseconds / 1000);

    if (totalSeconds <= 0) window.location.href = "resultPage.html";

    let currentMinutes = Math.floor(totalSeconds / 60);
    let currentSeconds = totalSeconds % 60;

    let formattedMinutes = String(currentMinutes).padStart(2, '0');
    let formattedSeconds = String(currentSeconds).padStart(2, '0');

    TIMER_FIELD.innerText = `${formattedMinutes}:${formattedSeconds}`;
}

async function SaveNewScore() {
    let payload = await LoadData();

    const TASKS = payload.rooms[ROOM_CODE].players[THIS_PLAYER_INDEX].tasks;
    let thisPlayerScore = 0;

    for (let currentChar of TASKS) 
        thisPlayerScore += resultScoresOnTasks.get(currentChar);

    payload.rooms[ROOM_CODE].players[THIS_PLAYER_INDEX].score = thisPlayerScore;

    await SaveData(payload);
}

function SetUpProfiles(payload) {
    let playerScore = payload.rooms[ROOM_CODE].players[THIS_PLAYER_INDEX].score;
    let enemyScore = payload.rooms[ROOM_CODE].players[THIS_ENEMY_INDEX].score;
    let maxPosibleScore = payload.rooms[ROOM_CODE].maxCountOfTasks * 100;

    PLAYER_PROFILE_SCORE.innerHTML = `${playerScore}/${maxPosibleScore}`;
    ENEMY_PROFILE_SCORE.innerHTML = `${enemyScore}/${maxPosibleScore}`;

    if (setUpProfiles) return;
    setUpProfiles = true;

    let playerName = payload.rooms[ROOM_CODE].players[THIS_PLAYER_INDEX].name;
    let enemyName = payload.rooms[ROOM_CODE].players[THIS_ENEMY_INDEX].name;
    let playerIcon = payload.rooms[ROOM_CODE].players[THIS_PLAYER_INDEX].skin;
    let enemyIcon = payload.rooms[ROOM_CODE].players[THIS_ENEMY_INDEX].skin;

    PLAYER_PROFILE_ICON.src = `./Icons/icon_${playerIcon}.png`;
    PLAYER_PROFILE_NAME.innerHTML = playerName + " (Ти)";
    ENEMY_PROFILE_ICON.src = `./Icons/icon_${enemyIcon}.png`;
    ENEMY_PROFILE_NAME.innerHTML = enemyName;

    currentTask = payload.rooms[ROOM_CODE].players[THIS_PLAYER_INDEX].tasks[0];

    SetUpUI(payload);
    NewTask(currentTask);
}

async function SetUpUI(payload) {
    const TASKS = payload.rooms[ROOM_CODE].players[THIS_PLAYER_INDEX].tasks;

    for (let currentChar of TASKS) {
        let taskButton = document.createElement("button");
        taskButton.innerText = currentChar;
        taskButton.addEventListener("click", () => NewTask(currentChar));

        resultScoresOnTasks.set(currentChar, 0);
        resultTextOnTasks.set(currentChar, "0/100");

        TASK_BUTTONS_FIELD.appendChild(taskButton);
    }
}

async function NewTask(taskChar) {
    const CURRENT_NEW_TASK = await FetchTask(GRADE_NUM, SET_OF_TASKS, taskChar);;
    const CURRENT_TASK_EXAMPLES = CURRENT_NEW_TASK.examples;

    currentTask = taskChar;

    TASK_FIELD.innerHTML = "";

    let taskLetterAndName = document.createElement("p");
    let taskLimits = document.createElement("p");
    let taskCondition = document.createElement("p");
    let taskInputExplanation_Title = document.createElement("p");
    let taskInputExplanation = document.createElement("p");
    let taskOutputExplanation_Title = document.createElement("p");
    let taskOutputExplanation = document.createElement("p");
    let taskExample_Title = document.createElement("p");

    taskLimits.setAttribute('class', 'programming_limits');

    taskLetterAndName.innerHTML = `<font size="4"> Задача ${taskChar}</font> <br> <font size="6"><b>${CURRENT_NEW_TASK.name}</b></font>`;
    taskLimits.innerHTML = `<font size="4"> <em>${CURRENT_NEW_TASK.limits}</em></font>`;
    taskCondition.innerText = CURRENT_NEW_TASK.description;
    taskInputExplanation_Title.innerHTML = `<font size="5"><b>Вхідні файли</b></font>`;
    taskInputExplanation.innerText = CURRENT_NEW_TASK.inputExplanation;
    taskOutputExplanation_Title.innerHTML = `<font size="5"><b>Вихідні файли</b></font>`;
    taskOutputExplanation.innerText = CURRENT_NEW_TASK.outputExplanation;
    taskExample_Title.innerHTML = `<font size="5"><b>Приклади</b></font>`;

    TASK_FIELD.appendChild(taskLetterAndName);
    TASK_FIELD.appendChild(taskLimits);
    TASK_FIELD.appendChild(taskCondition);
    TASK_FIELD.appendChild(taskInputExplanation_Title);
    TASK_FIELD.appendChild(taskInputExplanation);
    TASK_FIELD.appendChild(taskOutputExplanation_Title);
    TASK_FIELD.appendChild(taskOutputExplanation);
    TASK_FIELD.appendChild(taskExample_Title);

    for (let currentExampleIndex = 0; currentExampleIndex < CURRENT_TASK_EXAMPLES.length; currentExampleIndex++) {
        currentExample = CURRENT_TASK_EXAMPLES[currentExampleIndex];
        let exampleCount = document.createElement("p");
        let exampleInputTitle = document.createElement("span");
        let exampleInput = document.createElement("p");
        let exampleOutputTitle = document.createElement("span");
        let exampleOutput = document.createElement("p");

        exampleInput.setAttribute('class', 'programming_examples');
        exampleOutput.setAttribute('class', 'programming_examples');

        exampleCount.innerHTML = `<font size="4"><b>Приклад №${currentExampleIndex+1}</b></font>`;
        exampleInputTitle.innerHTML = `<b>Ввід:</b>`;
        exampleInput.innerText = currentExample.input;
        exampleOutputTitle.innerHTML = `<b>Вивід:</b>`;
        exampleOutput.innerText = currentExample.output;

        TASK_FIELD.appendChild(exampleCount);
        TASK_FIELD.appendChild(exampleInputTitle);
        TASK_FIELD.appendChild(exampleInput);
        TASK_FIELD.appendChild(exampleOutputTitle);
        TASK_FIELD.appendChild(exampleOutput);

        currentExampleIndex++;
    }
}

async function UploadSolution() {
    let currentNewCode = EDITOR.innerText;
    let cleanedCode = CleanCode(currentNewCode);

    let res = await SubmitSolution(GRADE_NUM, SET_OF_TASKS, currentTask, cleanedCode);
    console.log(res);

    if (!res.compiled) { resultTextOnTasks.set(currentTask, res.errors); return; }

    let countOfPassed = 0, countOfTests = res.results.length;

    for (let currentResultIndex = 0; currentResultIndex < res.results.length; currentResultIndex++) {
        if (res.results[currentResultIndex].passed) countOfPassed++;
    }

    resultScoresOnTasks.set(currentTask, Math.max(resultScoresOnTasks.get(currentTask), countOfPassed / countOfTests * 100));
    resultTextOnTasks.set(currentTask, `${countOfPassed / countOfTests * 100}/100`);

    SaveNewScore();
}

function CleanCode(rawCode) {
    let withoutBom = rawCode.replace(new RegExp(`^${BOM_CHAR}`), '');
    let normalized = withoutBom.normalize('NFKC');
    return normalized;
}

