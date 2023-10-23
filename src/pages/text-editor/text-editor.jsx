import React, { useEffect, useState } from "react";
import MenuBar from "../../components/menu-bar";
import { Input } from "antd";
const { TextArea } = Input;

function TextEditor() {
    const [currentEditorValue, setCurrentEditorValue] = useState("");
    const [isEditorFocused, setIsEditorFocused] = useState(true);
    const [currentCommandList, setCurrentCommandList] = useState([]);
    const [currentHistoryPosition, setCurrentHistoryPosition] = useState(-1);
    const items = [
        {
            label: 'File',
            key: 'file',
            children: [
                {
                    label: 'New',
                    key: 'file:new',
                    onClick: () => {
                        handleNew()
                    }
                }
            ],
        },
        {
            label: 'Edit',
            key: 'edit',
            children: [
                {
                    label: 'Undo',
                    key: 'edit:undo',
                    onClick: () => {
                        handleUndoEvent(true);
                    }
                },
                {
                    label: 'Redo',
                    key: 'edit:redo',
                    onClick: () => {
                        handleRedoEvent(true);
                    }
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

    const handleUndoEvent = (isFocused) => {
        if (!isFocused) return;
        console.log("undo")
        let historyPosition = currentHistoryPosition;

        // nothing to undo
        if (historyPosition == -1) {
            console.log("there is nothing to undo");
            return;
        };

        let commandList = currentCommandList;
        let editorValue = currentEditorValue;
        let currentCommand = commandList[historyPosition];
        if (currentCommand["type"] == "add") {
            let position = currentCommand["start"];
            editorValue = editorValue.slice(0, position);
        } else if (currentCommand["type"] == "delete") {
            let position = currentCommand["start"];
            let value = currentCommand["value"];
            editorValue = `${editorValue.substring(0, position)}${value}${editorValue.substring(position)}`;
        }

        console.log(commandList, historyPosition);

        historyPosition--;
        setCurrentEditorValue(editorValue);
        setCurrentHistoryPosition(historyPosition);
    }

    const handleRedoEvent = (isFocused) => {
        if (!isFocused) return;
        console.log("redo")

        let commandList = currentCommandList;
        let historyPosition = currentHistoryPosition;

        // nothing to redo
        if (historyPosition + 1 == currentCommandList.length) {
            console.log("there is nothing to redo");
            return;
        }

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
