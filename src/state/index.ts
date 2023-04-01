import config, {MonacoSettings, RuntimeType} from "@services/config";
import {LayoutType} from "~/styles/modal";
import {isDarkModeEnabled, supportsPreferColorScheme, ThemeVariant} from "~/utils/theme";
import {editor} from "monaco-editor";
import {EvalEvent} from "@services/api";
import {on} from "use-minimal-state";
import {DEFAULT_FONT} from "@services/fonts";
export const getInitialThemeVariant = (wantsDarkMode: boolean, useSystemTheme:boolean): ThemeVariant => {
    if (useSystemTheme && supportsPreferColorScheme()) {
        return isDarkModeEnabled() ? ThemeVariant.dark : ThemeVariant.light
    }
    return  wantsDarkMode ? ThemeVariant.dark : ThemeVariant.light
};

const defaultMonacoSettings: MonacoSettings = {
    fontFamily: DEFAULT_FONT,
    fontLigatures: false,
    cursorBlinking: 'blink',
    cursorStyle: 'line',
    selectOnLineNumbers: true,
    minimap: false,
    contextMenu: true,
    smoothScrolling: true,
    mouseWheelZoom: true,
};

export const appState = {
    UI: {
        shareCreated: false,
        snippetId: null,
        panel: {
            height: 300,
            width: 300,
            collapsed: false,
            layout:LayoutType.Vertical,
        }
    },
    editor: {
        fileName:  "notebook.md",
        code: "",
        args: [] as [any?],
        jsonArgs: [] as [any?],
    },
    status: {
        loading: false,
        lastError: "",
        events: [] as  EvalEvent[],
        markers: [] as editor.IMarker[],
    },
    monaco:  defaultMonacoSettings,
    settings: {
        darkMode:  false,
        useSystemTheme: false,
        autoFormat:  false,
        runtime:  RuntimeType.FlowTestnet,
    },
}

export const saveState = (section: string, m: any) =>
{
    localStorage.setItem(section, JSON.stringify(m));
}


on(appState, 'UI', c => saveState("UI", c));
on(appState, 'editor', c => saveState("editor", c));
on(appState, 'monaco', c => saveState("monaco", c));
on(appState, 'settings', c => saveState("settings", c));

export const loadConfig = ()=> {
    const ui = loadState("UI")
    if (!!ui){
        appState.UI = ui
    }

    const editor = loadState("editor")
    if (!!editor) {
        appState.editor = loadState("editor")
    }

    const monaco =  loadState("monaco")
    if (!!monaco){
        appState.monaco = monaco
    }
    const settings =  loadState("settings")
    if (!!settings){
        appState.settings = settings
    }

}
export const loadState = (section: string) =>
{
    const val = localStorage.getItem(section);
    if (!val) {
        return null;
    }

    try {
        const parsed = JSON.parse(val);
        if (!parsed) {
            return null;
        }
        return parsed;

    } catch (_) {
        return null;
    }
}
