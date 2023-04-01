import React, {useEffect, useState} from 'react';
import {CommandBar, ICommandBarItemProps} from '@fluentui/react/lib/CommandBar';
import SettingsModal from '~/components/settings/SettingsModal';
import {getSnippetsMenuItems, SnippetMenuItem} from '~/utils/headerutils';
import SharePopup from '~/components/utils/SharePopup';

import './Header.css';
import {appState, getInitialThemeVariant} from "~/state";
import {getThemeFromVariant} from "~/utils/theme";
import {IPartialTheme} from "@fluentui/react";
import client from "@services/api";
import { useHistory } from "react-router-dom";
import {use, set, update, on} from 'use-minimal-state';
import {runFileAction, saveFileAction} from "~/state/dispatch";

/**
 * Uniquie class name for share button to use as popover target.
 */
const BTN_SHARE_CLASSNAME = 'Header__btn--share';

const localState = {
    settings: {
        showShareMessage: false,
        showSettings: false,
        shareCreated: false,
        snippetID: "",
    }
}

export const Header = ({loaderRef}) => {

    const settings = use(appState, "settings")
    const editor = use(appState, "editor")
    const status = use(appState, "status")
    const localSettings = use(localState, "settings")

    const fileElement = document.createElement('input') as HTMLInputElement;
    fileElement.type = 'file';
    fileElement.accept = '.md';
    fileElement.addEventListener('change', () => onItemSelect());

    const [fileInput, setFileInput] = useState<any>(fileElement);
    const snippetMenuItems = getSnippetsMenuItems(i => onSnippetMenuItemClick(i));
    const [theme, setTheme] = useState<IPartialTheme | null>(null);

    useEffect(() => {
        setTheme(getThemeFromVariant(getInitialThemeVariant(settings.darkMode, settings.useSystemTheme)))
    }, [settings.darkMode, settings.useSystemTheme])

    const history = useHistory()

    const onItemSelect = () => {
        const file = fileInput?.files?.item(0);

        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = e => {

            editor.fileName = file.name
            editor.code = e.target?.result as string;
            console.log(file.name)

            console.log(e.target?.result)
            console.log(editor.code)
            update(appState, "editor")

            console.log("loaderref", loaderRef)
            loaderRef.current(editor.code)

        };

        reader.onerror = e => {
            alert(`Failed to import a file: ${e}`)
        };

        reader.readAsText(file, 'UTF-8');

    }

    const onSnippetMenuItemClick = (item: SnippetMenuItem) => {
        if (item.snippet) {
            history.replace(`/notebook/${item.snippet}`)
            return
        }
        editor.code = item.text as string;
        editor.fileName = item.label + ".md"
        update(appState, "editor")
        loaderRef.current(editor.code)
    }

    const menuItems = (): ICommandBarItemProps[] => {
        return [
            {
                key: 'openFile',
                text: 'Open',
                split: true,
                iconProps: {iconName: 'OpenFile'},
                disabled: status.loading,
                onClick: () => fileInput?.click(),
                subMenuProps: {
                    items: snippetMenuItems,
                },
            },
            /*
            {
                key: 'run',
                text: 'Run',
                ariaLabel: 'Run program (Ctrl+Enter)',
                title: 'Run program (Ctrl+Enter)',
                iconProps: {iconName: 'Play'},
                disabled: status.loading,
                onClick: () => {
                    runFileAction()
                }
            },*/
            {
                key: 'share',
                text: 'Share',
                className: BTN_SHARE_CLASSNAME,
                iconProps: {iconName: 'Share'},
                disabled: status.loading,
                onClick: () => {
                    localState.settings.showShareMessage = true
                    status.loading = true
                    update(appState,"status")
                    update(localState,"settings")

                    client.shareSnippet(editor.code, settings.runtime).then(
                        ({snippetID})  => {
                            if (snippetID){
                                history.push(`/notebook/${snippetID}`)
                                localSettings.shareCreated = true
                                localSettings.snippetID = snippetID
                                update(localState,"settings")
                            }
                            status.loading = false
                            update(appState,"status")
                        }
                        ).catch((err)=>{
                            status.loading = false
                            status.lastError = err.message
                            update(appState,"status")
                    })
                },
            },
            {
                key: 'download',
                text: 'Download',
                iconProps: {iconName: 'Download'},
                disabled: status.loading,
                onClick: () => {
                    saveFileAction(editor.fileName, editor.code)
                },
            },
            /*
            {
                key: 'settings',
                text: 'Settings',
                ariaLabel: 'Settings',
                iconProps: {iconName: 'Settings'},
                disabled: status.loading,
                onClick: () => {
                    localState.settings.showSettings = true
                    update(localState,"settings")
                }
            }*/
        ];
    }

    const asideItems = (): ICommandBarItemProps[] => {
        return [
            {
                key: 'toggleTheme',
                text: 'Toggle Dark Mode',
                ariaLabel: 'Toggle Dark Mode',
                iconOnly: true,
                hidden: settings.useSystemTheme,
                iconProps: {iconName: settings.darkMode ? 'Brightness' : 'ClearNight'},
                onClick: () => {
                    set(settings, "darkMode", !settings.darkMode)
                    update(appState,"settings")

                },
            }
        ];
    }

    const onSettingsClose = (changes) => {
        localSettings.showSettings = false
        update(localState,"settings")
    }

    return (
        <header
            className='header'
            style={{backgroundColor: theme?.palette?.white}}
        >
            <img
                style={{marginLeft: 20}}
                src='/flow.svg'
                className='header__logo'
                alt='Flow Logo'
            />
            <CommandBar
                className='header__commandBar'
                items={menuItems()}
                farItems={asideItems().filter(({hidden}) => !hidden)}
                ariaLabel='CodeEditor menu'
            />
            <SharePopup
                visible={!!(localSettings.showShareMessage && localSettings.shareCreated && localSettings.snippetID)}
                target={`.${BTN_SHARE_CLASSNAME}`}
                snippetId={localSettings && localSettings.snippetID ? localSettings.snippetID : undefined}
                onDismiss={() => {
                    localSettings.showShareMessage=false
                    update(localState,"settings")
                }}
            />
            <SettingsModal
                onClose={(args) => onSettingsClose(args)}
                isOpen={localSettings.showSettings}
            />


        </header>
    );
}

