const ROOM_CODE = sessionStorage.getItem("roomCode");
const SET_OF_TASKS = sessionStorage.getItem("setOfTasks");
const THIS_PLAYER_ID = sessionStorage.getItem("playerID");
const THIS_ENEMY_ID = sessionStorage.getItem("enemyID");

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

EDITOR.innerText = "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n\n}";

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
        await MainLoop();
        await Delay(125);
    }
}

function Delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function MainLoop() {
    let allPlayersResponse = await SendPost("RoomManager", "GetAllPlayers", { roomCode: ROOM_CODE });
    let roomInfoPost = await SendPost("RoomManager", "GetRoomInfo", { roomCode: ROOM_CODE });
    let roomInfo = roomInfoPost.roomInfo;

    if (roomInfoPost.status == 404 && roomInfoPost.description == "No room with this code!") window.location.href = "index.html";
    if (allPlayersResponse.status != 200) PopUpWindow(allPlayersResponse.description);
    if (roomInfoPost.status != 200) PopUpWindow(roomInfoPost.description);

    let allPlayers = allPlayersResponse.players;

    SetTimer(roomInfo);

    isSendingTask = allPlayers[THIS_PLAYER_ID].sendedTasks;
    WAITING_GEARS.style.display = ((isSendingTask)?"inline-block":"none");

    myTasks = allPlayers[THIS_PLAYER_ID].tasks;
    enemyTasks = allPlayers[THIS_ENEMY_ID].tasks;
    resultScoresOnTasks = allPlayers[THIS_PLAYER_ID].scoreOnTask;
    resultErrorOnTasks = allPlayers[THIS_PLAYER_ID].errorOnTask;

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
    let playerScore = allPlayers[THIS_PLAYER_ID].score;
    let enemyScore = allPlayers[THIS_ENEMY_ID].score;
    let maxPossibleScore = roomInfo.maxTasks * 100;

    PLAYER_PROFILE_SCORE.innerHTML = `${playerScore}/${maxPossibleScore}`;
    ENEMY_PROFILE_SCORE.innerHTML = `${enemyScore}/${maxPossibleScore}`;

    if (playerScore == maxPossibleScore && enemyScore == maxPossibleScore) window.location.href = "resultPage.html";

    if (setUpProfiles) return;
    setUpProfiles = true;

    let playerName = allPlayers[THIS_PLAYER_ID].name;
    let enemyName = allPlayers[THIS_ENEMY_ID].name;
    let playerIcon = allPlayers[THIS_PLAYER_ID].icon;
    let enemyIcon = allPlayers[THIS_ENEMY_ID].icon;

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

    currentTask = allPlayers[THIS_PLAYER_ID].tasks[0];

    SetUpUI(allPlayers[THIS_PLAYER_ID].tasks);
}

async function SetUpUI(tasks) {
    for (let currentChar of tasks) {
        let taskButton = document.createElement("button");
        taskButton.innerText = currentChar;
        taskButton.addEventListener("click", () => NewTask(currentChar));

        resultTextOnTasks.set(currentChar, "0/100");
        codeOnTasks.set(currentChar, "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n\n}");
        tasksButtons[currentChar] = taskButton;

        TASK_BUTTONS_FIELD.appendChild(taskButton);
    }

    NewTask(tasks[0]);
}

async function NewTask(taskChar) {
    const CURRENT_TASK_NAME = sessionStorage.getItem(`Name ${taskChar}`);
    const CURRENT_TASK_LIMITS = sessionStorage.getItem(`Limits ${taskChar}`);
    const CURRENT_TASK_DESCRIPTION = sessionStorage.getItem(`Description ${taskChar}`); 
    const CURRENT_TASK_INPUT_EXPLANATION = sessionStorage.getItem(`InputExplanation ${taskChar}`);
    const CURRENT_TASK_OUTPUT_EXPLANATION = sessionStorage.getItem(`OutputExplanation ${taskChar}`);
    const CURRENT_TASK_EXAMPLES = JSON.parse(sessionStorage.getItem(`Examples ${taskChar}`));

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

    taskLetterAndName.innerHTML = `<font size="4"> Задача ${taskChar}</font> <br> <font size="6"><b>${CURRENT_TASK_NAME}</b></font>`;
    taskLimits.innerHTML = `<font size="4"> <em>${CURRENT_TASK_LIMITS}</em></font>`;
    taskCondition.innerHTML = CURRENT_TASK_DESCRIPTION;
    taskInputExplanation_Title.innerHTML = `<font size="5"><b>Вхідні файли</b></font>`;
    taskInputExplanation.innerHTML = CURRENT_TASK_INPUT_EXPLANATION;
    taskOutputExplanation_Title.innerHTML = `<font size="5"><b>Вихідні файли</b></font>`;
    taskOutputExplanation.innerHTML = CURRENT_TASK_OUTPUT_EXPLANATION;
    taskExample_Title.innerHTML = `<font size="5"><b>Приклади:</b></font>`;

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

    let res = await SendPost("CPPCompiler", "SendTask", { roomCode:ROOM_CODE, playerID:THIS_PLAYER_ID, taskSet:SET_OF_TASKS, task:currentTask, code:cleanedCode });

    if (res.status != 200) return PopUpWindow(res.description);
}

function CleanCode(rawCode) {
    let withoutBom = rawCode.replace(new RegExp(`^${BOM_CHAR}`), '');
    let normalized = withoutBom.normalize('NFKC');
    return normalized;
}

