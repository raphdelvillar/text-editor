import { render, screen, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import TextEditor from "./TextEditor";
import React from 'react';

global.React = React;
global.alert = jest.fn();

const setup = async () => {
    render(<TextEditor />);
    let input = "";
    await waitFor(() => {
        input = screen.getByLabelText("text-editor-area");
        expect(input).toBeInTheDocument();
    });

    return { input }
}

test("text editor page should render", async () => {
    render(<TextEditor />);
    await waitFor(() => {
        const input = screen.getByLabelText("text-editor-area");
        expect(input).toBeInTheDocument();
    });
});

test("user should be able to type in the text area", async () => {
    const { input } = await setup();
    await userEvent.type(input, "Hello World!");
    expect(input.value).toBe("Hello World!");
});

test("user should be able to undo their change", async () => {
    const { input } = await setup();
    await userEvent.type(input, "Hello World!a");

    await userEvent.keyboard("{Control>}{Shift>}{,}");
    expect(input.value).toBe("Hello World!");
});

test("user shouldn't be able to undo if they haven't done any change", async () => {
    const { input } = await setup();
    await userEvent.keyboard("{Control>}{Shift>}{,}");
    expect(input.value).toBe("");
});

test("user should be able to redo their change after undoing it", async () => {
    const { input } = await setup();
    await userEvent.type(input, "Hello World!");
    await userEvent.keyboard("{Control>}{Shift>}{,}");
    await userEvent.keyboard("{Control>}{Shift>}{.}");
    expect(input.value).toBe("Hello World!");
});

test("user should not be able to redo if they haven't done any change", async () => {
    const { input } = await setup();
    await userEvent.keyboard("{Control>}{Shift>}{.}");
    expect(input.value).toBe("");
});

test("user should not be able to redo after they added new changes after undoing", async () => {
    const { input } = await setup();
    await userEvent.type(input, "Hello World!");
    await userEvent.keyboard("{Control>}{Shift>}{,}");
    await userEvent.type(input, ".");
    await userEvent.keyboard("{Control>}{Shift>}{.}");
    expect(input.value).toBe("Hello World.");
});
