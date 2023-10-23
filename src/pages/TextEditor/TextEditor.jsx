import React, { useEffect, useState } from "react";
import { Input } from "antd";
import menuItems from "./menuItems";
const { TextArea } = Input;

const MenuBar = React.lazy(() => import("../../components/MenuBar"))

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
        }

        if (event.ctrlKey && event.key == "<") {
            handleUndoEvent(isEditorFocused);
            return;
        }

        if (event.ctrlKey && event.key == ">") {
            handleRedoEvent(isEditorFocused);
            return;
        }

        if (event.key != "Backspace" && event.key.length != 1) return;

        let command = {
            "start": event.srcElement.selectionStart,
            "end": event.srcElement.selectionEnd
        }

        let commandList = currentCommandList;
        let historyPosition = currentHistoryPosition;
        if (event.key == "Backspace") {
            command["type"] = "delete";

            if (window.getSelection().toString() == "") {
                command["value"] = commandList[commandList.length - 1].value;
            } else {
                command["value"] = window.getSelection().toString();
            }
        } else if (event.key.length == 1) {
            command["type"] = "add";
            command["value"] = event.key;
        }

        historyPosition++;
        commandList = commandList.splice(0, historyPosition);
        commandList.push(command);
        console.log(commandList, historyPosition);
        setCurrentCommandList(commandList);
        setCurrentHistoryPosition(historyPosition);
    }

    const handleUndoEvent = (isEnabled) => {
        if (!isEnabled) return;
        console.log("undo")
        // nothing to undo
        if (currentHistoryPosition == -1) {
            console.log("there is nothing to undo");
            return;
        };

        let historyPosition = currentHistoryPosition;
        let commandList = currentCommandList;
        let editorValue = currentEditorValue;
        let currentCommand = commandList[historyPosition];
        if (currentCommand["type"] == "add") {
            let position = currentCommand["start"];
            editorValue = editorValue.slice(0, position);
        } else if (currentCommand["type"] == "delete") {
            let position = currentCommand["start"];
            let value = currentCommand["value"];
            console.log(editorValue);
            editorValue = `${editorValue.substring(0, position)}${value}${editorValue.substring(position)}`;
            console.log(editorValue);
        }

        console.log(commandList, historyPosition);

        historyPosition--;
        setCurrentEditorValue(editorValue);
        setCurrentHistoryPosition(historyPosition);
    }

    const handleRedoEvent = (isEnabled) => {
        if (!isEnabled) return;
        console.log("redo")
        // nothing to redo
        if (currentHistoryPosition == currentCommandList.length - 1) {
            console.log("there is nothing to redo");
            return;
        }

        let commandList = currentCommandList;
        let historyPosition = currentHistoryPosition;
        let editorValue = currentEditorValue;
        historyPosition++;
        let currentCommand = commandList[historyPosition];
        if (currentCommand["type"] == "add") {
            let position = currentCommand["start"];
            let value = currentCommand["value"];
            editorValue = `${editorValue.substring(0, position)}${value}${editorValue.substring(position)}`;
        } else if (currentCommand["type"] == "delete") {
            let startPosition = currentCommand["start"];
            let endPosition = currentCommand["end"];
            editorValue = `${editorValue.slice(0, startPosition)}${editorValue.slice(endPosition, editorValue.length)}`;
        }

        console.log(commandList, historyPosition);

        setCurrentEditorValue(editorValue);
        setCurrentHistoryPosition(historyPosition);
    }

    const menuBarItems = menuItems(handleNew, handleUndoEvent, handleRedoEvent);

    return (
        <div className="container">
            <MenuBar mode={"horizontal"} items={menuBarItems} />
            <TextArea className="text-editor-area"
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
