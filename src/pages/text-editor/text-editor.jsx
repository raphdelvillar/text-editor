import React, { useEffect, useState } from "react";
import MenuBar from "../../components/menu-bar";
import { Input } from "antd";
const { TextArea } = Input;

function TextEditor() {
    const [currentEditorValue, setCurrentEditorValue] = useState("");
    const [isEditorFocused, setIsEditorFocused] = useState(true);
    const [currentCommandList, setCurrentCommandList] = useState([]);
    const [currentHistoryPosition, setCurrentHistoryPosition] =  useState(-1);
    const items = [
        {
            label: 'File',
            key: 'file',
            children: [
                {
                    label: 'New',
                    key: 'file:new',
                },
                {
                    label: 'Exit',
                    key: 'file:exit'
                },
            ],
        },
        {
            label: 'Edit',
            key: 'edit',
            children: [
                {
                    label: 'Undo',
                    key: 'edit:undo'
                },
                {
                    label: 'Redo',
                    key: 'edit:redo'
                }
            ],
        },
        {
            label: 'View',
            key: 'view',
            disabled: true
        }
    ];

    useEffect(() => {
        document.addEventListener('keydown', keydownHandler);
        return () => {
            document.removeEventListener('keydown', keydownHandler);
        }
    }, [isEditorFocused, currentCommandList, currentHistoryPosition])

    function keydownHandler(event) {
        if (!isEditorFocused) return;

        // this is to prevent the default undo/redo in the browser
        if ((event.ctrlKey && event.key == "z") || (event.ctrlKey && event.key == "y")) {
            event.preventDefault();
        }

        if (event.ctrlKey && event.key == "<") {
            handleUndoEvent(event);
            return;
        }

        if (event.ctrlKey && event.key == ">") {
            handleRedoEvent(event);
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

        commandList = commandList.splice(0, historyPosition);
        historyPosition++;
        commandList.push(command);
        setCurrentCommandList(commandList);
        setCurrentHistoryPosition(historyPosition);
    }

    function handleUndoEvent(event) {
        if (!isEditorFocused) return;
        console.log("undo")
        let historyPosition = currentHistoryPosition;

        // nothing to undo
        if (historyPosition == -1) {
            console.log("there is nothing to undo");
            return;
        };

        let commandList = currentCommandList;
        let editorValue = event.srcElement.value;
        let currentCommand = commandList[historyPosition];
        if (currentCommand["type"] == "add") {
            let position = currentCommand["start"];
            editorValue = editorValue.slice(0, position)
        }

        historyPosition--;
        setCurrentEditorValue(editorValue);
        setCurrentHistoryPosition(historyPosition);
    }

    function handleRedoEvent(event) {
        if (!isEditorFocused) return;
        console.log("redo")

        let commandList = currentCommandList;
        let historyPosition = currentHistoryPosition;

        // nothing to redo
        if (historyPosition + 1 == currentCommandList.length) {
            console.log("there is nothing to redo");
            return;
        }

        let editorValue = event.srcElement.value;

        historyPosition++;
        let currentCommand = commandList[historyPosition];
        if (currentCommand["type"] == "add") {
            let position = currentCommand["start"];
            let value = currentCommand["value"];
            editorValue = `${editorValue.substring(0, position)}${value}${editorValue.substring(position)}`;
        }

        setCurrentEditorValue(editorValue);
        setCurrentHistoryPosition(historyPosition);
    }

    return (
        <div className="container">
            <MenuBar mode={"horizontal"} items={items} />
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
