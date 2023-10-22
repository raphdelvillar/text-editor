import React, { useEffect, useState } from "react";
import MenuBar from "../components/menu-bar";
import { Input } from "antd";
const { TextArea } = Input;

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

function TextEditor() {
    useEffect(() => {
        document.addEventListener('keydown', keydownHandler);
        return () => {
            document.removeEventListener('keydown', keydownHandler);
        }
    }, [])

    function keydownHandler(event) {
        if (event.ctrlKey && event.shiftKey && event.which == 188) {
            handleUndoEvent();
            return;
        }

        if (event.ctrlKey && event.shiftKey && event.which == 190) {
            handleRedoEvent();
            return;
        }

        // console.log(window.getSelection().toString());
    }

    function handleUndoEvent() {
        console.log("undo")
    }

    function handleRedoEvent() {
        console.log("redo")
    }

    return (
        <div className="container">
            <MenuBar mode={"horizontal"} items={items} />
            <TextArea className="text-editor-area"
                autoFocus
                showCount
                onChange={(event) => console.log(event.target.value)}
            />
        </div>
    )
}

export default TextEditor;
