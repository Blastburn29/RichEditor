import { useState, useEffect } from 'react';
import { Editor, EditorState, Modifier, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import './RichTextEditor.css';
import 'draft-js/dist/Draft.css';

const styleMap = {
    RED: {
        color: 'red',
    },
};

export const RichTextEditor = () => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    useEffect(() => {
        const savedContent = localStorage.getItem('editorContent');
        if (savedContent) {
            setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent))));
        }
    }, []);

    // Save content to localStorage on Save button click
    const handleSave = () => {
        const contentState = editorState.getCurrentContent();
        localStorage.setItem('editorContent', JSON.stringify(convertToRaw(contentState)));
        alert('Content saved!');
    };

    const handleKeyCommand = (command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
            return 'handled';
        }
        return 'not-handled';
    };

    const handleBeforeInput = (chars) => {

        const currentContent = editorState.getCurrentContent();
        const selection = editorState.getSelection();
        const blockKey = selection.getStartKey();
        const block = currentContent.getBlockForKey(blockKey);
        const blockText = block.getText();
        // console.log(editorState.getCurrentInlineStyle().toArray())


        if (chars === ' ' && blockText.startsWith('#')) {
            // Remove the '#' character
            blockStyling(editorState, currentContent, selection, blockText, 'header-one');

            return 'handled';
        }

        if (chars === ' ' && blockText === '*') {
            // Remove the '#' character
            inlineStyling(editorState, currentContent, selection, blockText, 'BOLD');

            return 'handled';
        }

        if (chars === ' ' && blockText === '**') {
            // Remove the '#' character
            inlineStyling(editorState, currentContent, selection, blockText, 'RED');


            return 'handled';
        }

        if (chars === ' ' && blockText === '***') {
            // Remove the '#' character
            inlineStyling(editorState, currentContent, selection, blockText, 'UNDERLINE');

            return 'handled';
        }

        return 'not-handled';
    };

    const blockStyling = (editorState, currentContent, selection, blockText, styling) => {
        const newContentState = Modifier.removeRange(
            currentContent,
            selection.merge({
                anchorOffset: 0, // Position to start removing
                focusOffset: blockText.length, // End position
            }),
            'backward' // Direction of removal
        );
        const newEditorState = EditorState.push(editorState, newContentState, 'remove-range');
        const newState = RichUtils.toggleBlockType(newEditorState, styling);
        setEditorState(newState);
    }

    const inlineStyling = (editorState, currentContent, selection, blockText, styling) => {
        const newContentState = Modifier.removeRange(
            currentContent,
            selection.merge({
                anchorOffset: 0, // Position to start removing
                focusOffset: blockText.length, // End position
            }),
            'backward' // Direction of removal
        );
        const newEditorState = EditorState.push(editorState, newContentState, 'remove-range');
        const newState = RichUtils.toggleInlineStyle(newEditorState, styling);
        setEditorState(newState);
    }

    return (
        <div>
            <div className='headings'>
                <h1>Demo editor by Shivam Gada</h1>
                <button onClick={handleSave}>Save</button>
            </div>

            <div className='editor'>
                <Editor
                    customStyleMap={styleMap}
                    editorState={editorState}
                    // handleReturn={handleReturn}
                    handleBeforeInput={handleBeforeInput}
                    handleKeyCommand={handleKeyCommand}
                    onChange={setEditorState}
                    placeholder="Enter some text..."
                />
            </div>
        </div>
    );
};