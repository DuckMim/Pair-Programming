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
const SEND_CODE_BUTTON = document.getElementById("sendCode");
const WAITING_GEARS = document.getElementById("waitingGears");

const PLAYER_PROFILE_ICON = document.getElementById("playerIcon");
const PLAYER_PROFILE_NAME = document.getElementById("playerName");
const PLAYER_PROFILE_SCORE = document.getElementById("playerScore");
const ENEMY_PROFILE_ICON = document.getElementById("enemyIcon");
const ENEMY_PROFILE_NAME = document.getElementById("enemyName");
const ENEMY_PROFILE_SCORE = document.getElementById("enemyScore");

const BOM_CHAR = '\uFEFF';

EDITOR.innerText = "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n}";

let myTasks;
let enemyTasks;

let currentTask = "A";

let setUpProfiles = false;
let isSendingTask = false;

let resultScoresOnTasks = {};
let resultErrorOnTasks = {};
let tasksButtons = {};
let resultTextOnTasks = new Map();
let codeOnTasks = new Map();

Loop();

async function Loop() {
    while (true) {
        await SomeAsyncFunction();
        await Delay(125);
    }
}

function Delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function SomeAsyncFunction() {
    let allPlayers = await SendPost("RoomManager", "GetAllPlayers", { roomCode: ROOM_CODE });
    let roomInfoPost = await SendPost("RoomManager", "GetRoomInfo", { roomCode: ROOM_CODE });
    let roomInfo = roomInfoPost.roomInfo;

    if (roomInfoPost.status == 404 && roomInfoPost.description == "No room with this code!") window.location.href = "index.html";
    if (allPlayers.status != 200) PopUpWindow(allPlayers.description);
    if (roomInfoPost.status != 200) PopUpWindow(roomInfoPost.description);

    SetTimer(roomInfo);

    isSendingTask = allPlayers.players[THIS_PLAYER_INDEX].sendedTasks;
    WAITING_GEARS.style.display = ((isSendingTask)?"inline-block":"none");

    myTasks = allPlayers.players[THIS_PLAYER_INDEX].tasks;
    enemyTasks = allPlayers.players[THIS_ENEMY_INDEX].tasks;
    resultScoresOnTasks = allPlayers.players[THIS_PLAYER_INDEX].scoreOnTask;
    resultErrorOnTasks = allPlayers.players[THIS_PLAYER_INDEX].errorOnTask;

    RESULT_FIELD.innerText = ((resultErrorOnTasks[currentTask] != "") ? resultErrorOnTasks[currentTask] : (resultScoresOnTasks[currentTask] + "/100"));
    resultTextOnTasks[currentTask] = ((resultErrorOnTasks[currentTask] != "") ? resultErrorOnTasks[currentTask] : (resultScoresOnTasks[currentTask] + "/100"));

    if (Object.keys(tasksButtons).length > 0) {
        for (let taskChar of myTasks) {
            if (resultScoresOnTasks[taskChar] == 100) {
                tasksButtons[taskChar].classList.add("programming_doneTask");
            }
        }
    }

    SetUpProfiles(allPlayers, roomInfo);
}

function SetTimer(roomInfo) {
    const START_TIME = new Date(roomInfo.startTime);
    const TIME_FOR_TASKS = roomInfo.maxTime;
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

function SetUpProfiles(allPlayers, roomInfo) {
    let playerScore = allPlayers.players[THIS_PLAYER_INDEX].score;
    let enemyScore = allPlayers.players[THIS_ENEMY_INDEX].score;
    let maxPossibleScore = roomInfo.maxTasks * 100;

    PLAYER_PROFILE_SCORE.innerHTML = `${playerScore}/${maxPossibleScore}`;
    ENEMY_PROFILE_SCORE.innerHTML = `${enemyScore}/${maxPossibleScore}`;

        if (playerScore == maxPossibleScore && enemyScore == maxPossibleScore) window.location.href = "resultPage.html";

    if (setUpProfiles) return;
    setUpProfiles = true;

    let playerName = allPlayers.players[THIS_PLAYER_INDEX].name;
    let enemyName = allPlayers.players[THIS_ENEMY_INDEX].name;
    let playerIcon = allPlayers.players[THIS_PLAYER_INDEX].icon;
    let enemyIcon = allPlayers.players[THIS_ENEMY_INDEX].icon;

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

    currentTask = allPlayers.players[THIS_PLAYER_INDEX].tasks[0];

    SetUpUI(allPlayers.players[THIS_PLAYER_INDEX].tasks);
}

async function SetUpUI(tasks) {
    for (let currentChar of tasks) {
        let taskButton = document.createElement("button");
        taskButton.innerText = currentChar;
        taskButton.addEventListener("click", () => NewTask(currentChar));

        resultTextOnTasks.set(currentChar, "0/100");
        codeOnTasks.set(currentChar, "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n}");
        tasksButtons[currentChar] = taskButton;

        TASK_BUTTONS_FIELD.appendChild(taskButton);
    }

    NewTask(tasks[0]);
}

async function NewTask(taskChar) {
    const CURRENT_NEW_TASK = (await SendPost("CPPCompiler", "GetTask", { taskGrade:GRADE_NUM, taskSet:SET_OF_TASKS, task:taskChar })).task;
    const CURRENT_TASK_EXAMPLES = CURRENT_NEW_TASK.examples; 
    codeOnTasks.set(currentTask, EDITOR.innerText);

    currentTask = taskChar;

    TASK_FIELD.innerHTML = "";
    EDITOR.innerText = codeOnTasks.get(currentTask);

    let taskLetterAndName = document.createElement("p");
    let taskLimits = document.createElement("p");
    let taskCondition = document.createElement("p");
    let taskInputExplanation_Title = document.createElement("p");
    let taskInputExplanation = document.createElement("p");
    let taskOutputExplanation_Title = document.createElement("p");
    let taskOutputExplanation = document.createElement("p");
    let taskExample_Title = document.createElement("p");

    taskLimits.setAttribute('class', 'classField_2 programming_limits');

    taskLetterAndName.innerHTML = `<font size="4"> Задача ${taskChar}</font> <br> <font size="6"><b>${CURRENT_NEW_TASK.name}</b></font>`;
    taskLimits.innerHTML = `<font size="4"> <em>${CURRENT_NEW_TASK.limits}</em></font>`;
    taskCondition.innerHTML = CURRENT_NEW_TASK.description;
    taskInputExplanation_Title.innerHTML = `<font size="5"><b>Вхідні файли</b></font>`;
    taskInputExplanation.innerHTML = CURRENT_NEW_TASK.inputExplanation;
    taskOutputExplanation_Title.innerHTML = `<font size="5"><b>Вихідні файли</b></font>`;
    taskOutputExplanation.innerHTML = CURRENT_NEW_TASK.outputExplanation;
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

        exampleInput.setAttribute('class', 'classField_2 programming_examples');
        exampleOutput.setAttribute('class', 'classField_2 programming_examples');

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
    if (isSendingTask) return;

    let currentNewCode = EDITOR.innerText;
    let cleanedCode = CleanCode(currentNewCode);

    let res = await SendPost("CPPCompiler", "SendTask", { roomCode:ROOM_CODE, playerIndex:parseInt(THIS_PLAYER_INDEX), taskGrade:GRADE_NUM, taskSet:SET_OF_TASKS, task:currentTask, code:cleanedCode });

    if (res.status != 200) return PopUpWindow(res.description);
}

function CleanCode(rawCode) {
    let withoutBom = rawCode.replace(new RegExp(`^${BOM_CHAR}`), '');
    let normalized = withoutBom.normalize('NFKC');
    return normalized;
}
