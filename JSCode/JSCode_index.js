const JOIN_ROOM_CODE_INPUT = document.getElementById('joinRoomCodeInput');
const NICKNAME_INPUT = document.getElementById('nicknameInput');
const MAKE_ROOM_CODE_INPUT = document.getElementById('makeRoomCodeInput');
const COUNT_OF_PLAYERS_INPUT = document.getElementById('countOfPlayersInput');


async function JoinRoom() {
    let joinRoomCodeValue = JOIN_ROOM_CODE_INPUT.value;
    let nicknameValue = NICKNAME_INPUT.value;

    if (joinRoomCodeValue.length < 4) return PopUpWindowOfError("Incorrect code type");
    if (nicknameValue.length < 1) return PopUpWindowOfError("Incorrect nickname type");

    for (let i = 0; i < joinRoomCodeValue.length; i++) {
        let charCode = joinRoomCodeValue.charCodeAt(i);
        if (charCode < 48 || charCode > 57) return PopUpWindowOfError("Incorrect code type");
    }

    let payload = await LoadData();

    if (payload.roomsCodes.includes(joinRoomCodeValue)) {
        if (payload.rooms[joinRoomCodeValue].countOfPlayers <= payload.rooms[joinRoomCodeValue].players.length)
            return PopUpWindowOfError("Too many players in room");
        if (payload.rooms[joinRoomCodeValue].isActive)
            return PopUpWindowOfError("The game has started in this room");

        for (let currentPlayer of payload.rooms[joinRoomCodeValue].players)
            if (currentPlayer.name == nicknameValue)
                return PopUpWindowOfError("Nickname is already taken!");

        const newPlayer = {
            "name": nicknameValue,
            "skin": 0,
            "enemy": -1,
            "tasks": "",
            "score": 0,
            "canChoose": false
        }
        payload.rooms[joinRoomCodeValue].players.push(newPlayer);
    }
    else return PopUpWindowOfError("Wrong room code");

    await SaveData(payload);

    await sessionStorage.setItem("roomCode", joinRoomCodeValue);
    await sessionStorage.setItem("playerIndex", payload.rooms[joinRoomCodeValue].players.length-1);
    window.location.href = "playerPage.html";
}