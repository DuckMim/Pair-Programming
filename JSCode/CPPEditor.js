const INPUT_FIELD = document.getElementById('editor');

const LIST_OF_PARE_SYMBOLS = {'{':'}', '[':']', '(':')', '"':'"'};

INPUT_FIELD.addEventListener('keydown', GetAKey);



function GetAKey(currentKey) {
    if (currentKey.key === 'Tab') {
        currentKey.preventDefault();
        let currentCursorPos = GetCursorPosition();
        InsertTextAtPosition("    ", currentCursorPos);
        SetCursorAt(currentCursorPos + 4);
        INPUT_FIELD.focus();
    }
    else if (LIST_OF_PARE_SYMBOLS.hasOwnProperty(currentKey.key)) {
        currentKey.preventDefault();
        let currentSymbolIndex = currentKey.key.charCodeAt(0);
        let currentSymbol = String.fromCharCode(currentSymbolIndex);
        let nextSymbol = LIST_OF_PARE_SYMBOLS[currentSymbol];
        let currentCursorPos = GetCursorPosition();
        InsertTextAtPosition(currentSymbol+nextSymbol, currentCursorPos);
        SetCursorAt(currentCursorPos+1);
        INPUT_FIELD.focus();
    }
}

function GetCursorPosition() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return -1;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();

    preCaretRange.selectNodeContents(INPUT_FIELD);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    return preCaretRange.toString().length;
}

function SetCursorAt(position) {
    INPUT_FIELD.focus();

    let currentPosition = 0;
    const walker = document.createTreeWalker(
        INPUT_FIELD,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    while (walker.nextNode()) {
        const textNode = walker.currentNode;
        const textLength = textNode.textContent.length;

        if (currentPosition + textLength >= position) {
            const offset = position - currentPosition;

            const range = document.createRange();
            range.setStart(textNode, offset);
            range.collapse(true);

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            return;
        }

        currentPosition += textLength;
    }

    const range = document.createRange();
    range.selectNodeContents(INPUT_FIELD);
    range.collapse(false);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function InsertTextAtPosition(text) {
    INPUT_FIELD.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const insertedTextNode = document.createTextNode(text);
    range.insertNode(insertedTextNode);

    range.setStartAfter(insertedTextNode);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);
}
