import React, {useState} from 'react';
import MonacoEditor from "react-monaco-editor";
import * as monaco from 'monaco-editor';
import {editor} from 'monaco-editor';

import configureCadence from "@components/notebook/editor/Cadence/cadence";
import {appState} from "~/state";
import {use} from "use-minimal-state";

export default function Editor({value, language, onChange}) {
    const [height, setHeight] = useState(0);
    const [editor, setEditor] = useState<editor.IStandaloneCodeEditor | null>(null)
    const settings = use(appState, "settings")

    const editorDidMount = (editorInstance: editor.IStandaloneCodeEditor, m: monaco.editor.IEditorConstructionOptions) => {
        setEditor(editorInstance)
        monaco.editor.defineTheme('vs-light-x', {
            base: 'vs',
            inherit: true,
            rules: [],
            colors: {
              //  "editor.foreground": "#000000",
              //  "editor.background": "#fbfbfb",
                "editorCursor.foreground": "#00d1b2ba",
                "editor.lineHighlightBackground": "#33333308",
                "editorLineNumber.foreground": "#ccc",
                "editorLineNumber.activeForeground": "#999",
                "editor.selectionBackground": "#00000010",
                "editor.inactiveSelectionBackground": "#00000008",
                "scrollbarSlider.background": "#ff0000",
                "scrollbarSlider.hoverBackground": "#00d1b280",
                "scrollbarSlider.activeBackground": "#00d1b2f0",


            },
        });
        monaco.editor.defineTheme('vs-dark-x', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
              //  "editor.foreground": "#000000",
              //  "editor.background": "#fbfbfb",
                "editorCursor.foreground": "#00d1b2ba",
                "editor.lineHighlightBackground": "#33333308",
                "editorLineNumber.foreground": "#ccc",
                "editorLineNumber.activeForeground": "#999",
                "editor.selectionBackground": "#FFFFFF10",
                "editor.inactiveSelectionBackground": "#FFFFFF08",
                "scrollbarSlider.background": "#ff0000",
                "scrollbarSlider.hoverBackground": "#00d1b280",
                "scrollbarSlider.activeBackground": "#00d1b2f0",


            },
        });
        if (!!value.current)
            editorInstance.setValue(value.current)

        editorInstance.onDidContentSizeChange(() => {
            setHeight(Math.max(0, editorInstance.getContentHeight()));
            editorInstance.layout();
        });
        configureCadence(m);

        // Register custom actions
        // actions.forEach(action => editorInstance.addAction(action));
      // editorInstance.focus();
        editorInstance.layout();

    }
        window.onresize = () => {
            console.log('Window resize');
            editor?.layout();
        };

    const onContentChange = (newValue: string, _: editor.IModelContentChangedEvent)=>{
        value.current = newValue
        onChange(newValue)
    }

    return (
            <MonacoEditor
                theme={settings.darkMode ? 'vs-dark-x' : 'vs-light-x'}
                language={language}
                height={height}
                width={"auto"}
                className={"cellEditor"}
                options={{
                    fontSize: 13,
                    lineNumbersMinChars: 3,
                    scrollBeyondLastLine: false,
                    minimap: {
                        enabled: false
                    },
                    overviewRulerLanes: 0,
                    scrollbar: {
                        vertical:"hidden",
                        horizontal: "hidden",
                    },
                    automaticLayout: true,

                }}
                editorDidMount={(e, m: any) => editorDidMount(e, m)}
                onChange={(newVal, e) => onContentChange(newVal, e)}

            >
            </MonacoEditor>
    );
}