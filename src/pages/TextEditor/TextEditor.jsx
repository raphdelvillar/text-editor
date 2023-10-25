import { lazy, useEffect, useState } from "react";
import { Input } from "antd";
import menuItems from "./menuItems";
const { TextArea } = Input;

const MenuBar = lazy(() => import("../../components/TextEditor/MenuBar"))

const ADD = "add";
const DELETE = "delete";

function TextEditor() {
    const [currentEditorValue, setCurrentEditorValue] = useState("");
    const [isEditorFocused, setIsEditorFocused] = useState(true);
    const [currentCommandList, setCurrentCommandList] = useState([]);
    const [currentHistoryPosition, setCurrentHistoryPosition] = useState(-1);

    useEffect(() => {
        document.addEventListener('keydown', keydownHandler);
        return () => {
            document.removeEventListener('keydown', keydownHandler);
        }
    }, [currentEditorValue, isEditorFocused, currentCommandList, currentHistoryPosition])

    const handleNew = () => {
        setCurrentEditorValue("");
        setIsEditorFocused(true);
        setCurrentCommandList([]);
        setCurrentHistoryPosition(-1);
    }

    const keydownHandler = (event) => {
        if (!isEditorFocused) return;

        // this is to prevent the default undo/redo in the browser
        if ((event.ctrlKey && event.key == "z") || (event.ctrlKey && event.key == "y")) {
            event.preventDefault();
            return;
        }

        if ((event.ctrlKey && event.key == "<") || (event.ctrlKey && event.shiftKey && event.key == ",")) {
            handleUndoEvent(isEditorFocused);
            return;
        }

        if ((event.ctrlKey && event.key == ">") || (event.ctrlKey && event.shiftKey && event.key == ".")) {
            handleRedoEvent(isEditorFocused);
            return;
        }

        // we don't record copy event
        if (event.ctrlKey && event.key == "c") {
            return;
        }

        if (event.ctrlKey && event.key == "v") {
            handlePasteEvent(event);
            return;
        }

        if (event.key == "Backspace") {
            handleDeleteEvent(event);
            return;
        }

        if (event.key == "Enter") {
            handleEnterEvent(event);
            return;
        }

        if (event.ctrlKey && event.key == "x") {
            handleCutEvent(event);
            return;
        }

        if (event.key.length == 1) {
            handleTypeEvent(event);
            return;
        }
    }

    const handleSetCommand = (commands) => {
        let commandList = currentCommandList;
        let historyPosition = currentHistoryPosition + commands.length;
        commandList = commandList.splice(0, historyPosition);
        commandList = commandList.concat(commands);
        setCurrentCommandList(commandList);
        setCurrentHistoryPosition(historyPosition);
    }

    const handleEnterEvent = (event) => {
        let command = {
            "start": event.srcElement.selectionStart,
            "end": event.srcElement.selectionEnd,
            "type": ADD,
            "value": "\n"
        };

        handleSetCommand([command]);
    }

    const handleTypeEvent = (event) => {
        if (window.getSelection().toString() != "") {
            handleSelectionChangeEvent(event);
            return;
        }

        let command = {
            "start": event.srcElement.selectionStart,
            "end": event.srcElement.selectionEnd,
            "type": ADD,
            "value": event.key
        };

        handleSetCommand([command]);
    }

    const handleCutEvent = (event) => {
        if (window.getSelection().toString() == "") return;

        let command = {
            "start": event.srcElement.selectionStart,
            "end": event.srcElement.selectionEnd,
            "type": DELETE,
            "value": window.getSelection().toString()
        };

        handleSetCommand([command]);
    }

    const handleSelectionChangeEvent = (event) => {
        if (window.getSelection().toString() == "") return;

        let commands = [
            {
                "start": event.srcElement.selectionStart,
                "end": event.srcElement.selectionEnd,
                "type": DELETE,
                "value": window.getSelection().toString()
            },
            {
                "start": event.srcElement.selectionStart,
                "end": event.srcElement.selectionStart,
                "type": ADD,
                "value": event.key
            }
        ];

        handleSetCommand(commands);
    }

    const handleDeleteEvent = (event) => {
        let command = {
            "start": event.srcElement.selectionStart,
            "end": event.srcElement.selectionEnd,
            "type": DELETE
        }

        let commandList = currentCommandList;
        if (window.getSelection().toString() == "") {
            command["value"] = commandList[commandList.length - 1]
        } else {
            command["value"] = window.getSelection().toString();
        }

        handleSetCommand([command]);
    }

    const handlePasteEvent = (event) => {
        navigator.clipboard.readText().then((copiedText) => {
            if (copiedText == "") return;

            let command = {
                "start": event.srcElement.selectionStart,
                "end": event.srcElement.selectionEnd,
                "type": ADD,
                "value": copiedText
            }

            handleSetCommand([command]);
        }).catch(_ => {
            console.log("error copying text")
        })
    }

    const handleUndoEvent = (isEnabled) => {
        if (!isEnabled) return;
        // nothing to undo
        if (currentHistoryPosition == -1) {
            window.alert("There is nothing to undo");
            return;
        };

        let historyPosition = currentHistoryPosition;
        let commandList = currentCommandList;
        let editorValue = currentEditorValue;
        let currentCommand = commandList[historyPosition];
        if (currentCommand["type"] == ADD) {
            let value = currentCommand["value"];
            let position = currentCommand["start"];

            if (value.length == 1) editorValue = `${editorValue.slice(0, position)}${editorValue.slice(position + 1)}`;
            else {
                value = value.replaceAll(/(?:\r\n|\r|\n)/g, " ");
                let initialPosition = position - value.length;
                editorValue = `${editorValue.slice(0, initialPosition)}${editorValue.substring(position)}`
            }

        } else if (currentCommand["type"] == DELETE) {
            let position = currentCommand["start"];
            let value = currentCommand["value"];
            editorValue = `${editorValue.substring(0, position)}${value}${editorValue.substring(position)}`;
        }

        historyPosition--;
        setCurrentEditorValue(editorValue);
        setCurrentHistoryPosition(historyPosition);
    }

    const handleRedoEvent = (isEnabled) => {
        if (!isEnabled) return;
        // nothing to redo
        if (currentHistoryPosition == currentCommandList.length - 1) {
            window.alert("There is nothing to redo");
            return;
        }

        let commandList = currentCommandList;
        let historyPosition = currentHistoryPosition + 1;
        let editorValue = currentEditorValue;
        let currentCommand = commandList[historyPosition];

        if (currentCommand["type"] == ADD) {
            let position = currentCommand["start"];
            let value = currentCommand["value"];
            editorValue = `${editorValue.substring(0, position)}${value}${editorValue.substring(position)}`;
        } else if (currentCommand["type"] == DELETE) {
            let startPosition = currentCommand["start"];
            let endPosition = currentCommand["end"];
            editorValue = `${editorValue.slice(0, startPosition)}${editorValue.slice(endPosition, editorValue.length)}`;
        }

        setCurrentEditorValue(editorValue);
        setCurrentHistoryPosition(historyPosition);
    }

    const menuBarItems = menuItems(handleNew, handleUndoEvent, handleRedoEvent);

    return (
        <div className="container">
            <MenuBar mode={"horizontal"} items={menuBarItems} />
            <TextArea aria-label="text-editor-area" className="text-editor-area"
                value={currentEditorValue}
                autoFocus
                showCount
                onChange={(event) => setCurrentEditorValue(event.target.value)}
                onFocus={() => setIsEditorFocused(true)}
                onBlur={() => setIsEditorFocused(false)}
            />
        </div>
    )
}

export default TextEditor;
