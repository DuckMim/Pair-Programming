const JOIN_ROOM_CODE_INPUT = document.getElementById('joinRoomCodeInput');
const NICKNAME_INPUT = document.getElementById('nicknameInput');

sessionStorage.clear();

async function JoinRoom() {
    let joinRoomCodeValue = JOIN_ROOM_CODE_INPUT.value;
    let nicknameValue = NICKNAME_INPUT.value;

    if (joinRoomCodeValue.length < 4) return PopUpWindow("Incorrect code type (must be 4 numbers)");
    if (nicknameValue.length < 1) return PopUpWindow("Incorrect nickname type (at least 1 symbol)");

    for (let i = 0; i < joinRoomCodeValue.length; i++) {
        let charCode = joinRoomCodeValue.charCodeAt(i);
        if (charCode < 48 || charCode > 57) return PopUpWindow("Incorrect code type (must be 4 numbers)");
    }

    let res = await SendPost("RoomManager", "JoinRoom", {roomCode: joinRoomCodeValue, name: nicknameValue});

    if (res.status != 200) return PopUpWindow(res.description);

    await sessionStorage.clear();

    await sessionStorage.setItem("roomCode", joinRoomCodeValue);
    await sessionStorage.setItem("playerIndex", res.playerIndex);
    window.location.href = "playerPage.html";
}