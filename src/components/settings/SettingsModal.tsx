import React, {useState} from 'react';
import {
    Checkbox,
    Dropdown,
    IconButton,
    IDropdownOption,
    Modal, useTheme
} from '@fluentui/react';

import {Pivot, PivotItem} from '@fluentui/react/lib/Pivot';
import {MessageBar, MessageBarType} from '@fluentui/react/lib/MessageBar';

import {getContentStyles, getIconButtonStyles} from '~/styles/modal';
import SettingsProperty from './SettingsProperty';
import {RuntimeType} from '~/services/config';
import {DEFAULT_FONT, getAvailableFonts} from '~/services/fonts';
import {update, use} from "use-minimal-state";
import {appState} from "~/state";

const NETWORK_OPTIONS: IDropdownOption[] = [
    {
        key: RuntimeType.FlowMainnet,
        text: 'Flow Mainnet'
    },
    {
        key: RuntimeType.FlowTestnet,
        text: 'Flow Testnet'
    },
    {
        key: RuntimeType.FlowEmulator,
        text: 'Local Emulator',
        disabled: false // disable on not detect
    },
];

const CURSOR_BLINK_STYLE_OPTS: IDropdownOption[] = [
    {key: 'blink', text: 'Blink (default)'},
    {key: 'smooth', text: 'Smooth'},
    {key: 'phase', text: 'Phase'},
    {key: 'expand', text: 'Expand'},
    {key: 'solid', text: 'Solid'},
];

const CURSOR_LINE_OPTS: IDropdownOption[] = [
    {key: 'line', text: 'Line (default)'},
    {key: 'block', text: 'Block'},
    {key: 'underline', text: 'Underline'},
    {key: 'line-thin', text: 'Line thin'},
    {key: 'block-outline', text: 'Block outline'},
    {key: 'underline-thin', text: 'Underline thin'},
];

const FONT_OPTS: IDropdownOption[] = [
    {key: DEFAULT_FONT, text: 'System default'},
    ...getAvailableFonts().map(f => ({
        key: f.family,
        text: f.label,
    }))
];


export interface SettingsProps {
    isOpen?: boolean
    onClose: (changes: any) => void
}


export const SettingsModal: React.FC<SettingsProps> = ({isOpen, onClose}) => {

    const titleID = 'Settings';
    const subtitleID = 'SettingsSubText';

    const [changes, setChanges] = useState({})
    const theme = useTheme()
    const settings = use(appState, "settings")
    const monaco = use(appState, "monaco")

    const onCloseMe = () => {
        onClose({...changes});
        setChanges({})
    }





    const contentStyles = getContentStyles(theme);
    const iconButtonStyles = getIconButtonStyles(theme);

    return (
        <Modal
            titleAriaId={titleID}
            subtitleAriaId={subtitleID}
            isOpen={!!isOpen}
            onDismiss={() => onCloseMe()}
            containerClassName={contentStyles.container}
        >
            <div className={contentStyles.header}>
                <span id={titleID}>Settings</span>
                <IconButton
                    iconProps={{iconName: 'Cancel'}}
                    styles={iconButtonStyles}
                    ariaLabel="Close popup modal"
                    onClick={() => onCloseMe()}
                />
            </div>
            <div id={subtitleID} className={contentStyles.body}>
                <Pivot aria-label='Settings'>
                    <PivotItem headerText='Editor'>
                        <SettingsProperty
                            key='fontFamily'
                            title='Font Family'
                            description='Controls editor font family'
                            control={(
                                <Dropdown
                                    options={FONT_OPTS}
                                    defaultSelectedKey={monaco?.fontFamily ?? DEFAULT_FONT}
                                    onChange={(_, num) => {
                                        if (!num){
                                            return
                                        }
                                        monaco.fontFamily = num.key.toString()
                                        update(appState,"monaco")

                                    }}
                                />
                            )}
                        />
                        <SettingsProperty
                            key='autoDetectTheme'
                            title='Use System Theme'
                            control={(
                                <Checkbox
                                    label='Follow system dark mode preference instead of manual toggle.'
                                    defaultChecked={settings?.useSystemTheme}
                                    onChange={(_, val) => {
                                        settings.useSystemTheme = !!val
                                        update(appState, "settings")
                                    }}
                                />
                            )}
                        />
                        <SettingsProperty
                            key='fontLigatures'
                            title='Font Ligatures'
                            control={(
                                <Checkbox
                                    label='Enable programming font ligatures in supported fonts'
                                    defaultChecked={monaco?.fontLigatures}
                                    onChange={(_, val) => {
                                        if (!val){
                                            return
                                        }
                                        monaco.fontLigatures = val
                                        update(appState,"monaco")
                                    }}
                                />
                            )}
                        />
                    </PivotItem>
                    <PivotItem headerText='Flow Network' style={{paddingBottom: '64px'}}>
                        <SettingsProperty
                            key='runtime'
                            title='Network'
                            description='This option lets you choose which network your scripts and transactions should be executed.'
                            control={<Dropdown
                                options={NETWORK_OPTIONS}
                                defaultSelectedKey={settings?.runtime}
                                onChange={(_, val) => {
                                    if (!val) {
                                        return;
                                    }
                                    settings.runtime = val.key as RuntimeType
                                    update(appState,"settings")

                                }}
                            />}
                        />
                        <div style={{marginTop: '10px'}}>
                            {settings.runtime === RuntimeType.FlowMainnet && (
                                <MessageBar isMultiline={true} messageBarType={MessageBarType.warning}>
                                    <b>Mainnet</b> transactions can be dangerous, please be careful when running
                                    transactions shared by others.
                                    Use it at your own risk.
                                </MessageBar>
                            )}
                            {settings.runtime === RuntimeType.FlowEmulator && (
                                <MessageBar isMultiline={true} messageBarType={MessageBarType.warning}>
                                    <b>Emulator</b> settings has to be like below:

                                    <p>
                                        <ul>
                                            <li>You must be running local emulator (on :8888)</li>
                                            <li>Dev wallet (on :8701/fcl/authn)</li>
                                        </ul>
                                    </p>
                                </MessageBar>
                            )}
                        </div>
                        <SettingsProperty
                            key='autoFormat'
                            title='Auto Format'
                            control={<Checkbox
                                label="Auto format code before build"
                                defaultChecked={settings?.autoFormat}
                                onChange={(_, val) => {
                                    settings.autoFormat = val ?? false
                                    update(appState,"settings")

                                }}
                            />}
                        />
                    </PivotItem>
                    <PivotItem headerText='Advanced'>
                        <SettingsProperty
                            key='cursorBlinking'
                            title='Cursor Blinking'
                            description='Set cursor animation style'
                            control={(
                                <Dropdown
                                    options={CURSOR_BLINK_STYLE_OPTS}
                                    defaultSelectedKey={monaco?.cursorBlinking}
                                    onChange={(_, num) => {
                                        if (!num){
                                            return
                                        }
                                        monaco.cursorBlinking = num.key! as ('blink' | 'smooth' | 'phase' | 'expand' | 'solid')
                                        update(appState,"monaco")
                                    }}
                                />
                            )}
                        />
                        <SettingsProperty
                            key='cursorStyle'
                            title='Cursor Style'
                            description='Set the cursor style'
                            control={(
                                <Dropdown
                                    options={CURSOR_LINE_OPTS}
                                    defaultSelectedKey={monaco?.cursorStyle}
                                    onChange={(_, num) => {
                                        if (!num){
                                            return
                                        }
                                        monaco.cursorStyle = num.key! as ('line' | 'block' | 'underline' | 'line-thin' | 'block-outline' | 'underline-thin')
                                        update(appState,"monaco")
                                    }}
                                />
                            )}
                        />
                        <SettingsProperty
                            key='selectOnLineNumbers'
                            title='Select On Line Numbers'
                            control={(
                                <Checkbox
                                    label="Select corresponding line on line number click"
                                    defaultChecked={monaco?.selectOnLineNumbers}
                                    onChange={(_, val) => {
                                        monaco.selectOnLineNumbers= val ?? false
                                        update(appState,"monaco")
                                    }}
                                />
                            )}
                        />
                        <SettingsProperty
                            key='minimap'
                            title='Mini Map'
                            control={(
                                <Checkbox
                                    label="Enable mini map on side"
                                    defaultChecked={monaco?.minimap}
                                    onChange={(_, val) => {
                                        monaco.minimap= val ?? false
                                        update(appState,"monaco")

                                    }}
                                />
                            )}
                        />
                        <SettingsProperty
                            key='contextMenu'
                            title='Context Menu'
                            control={(
                                <Checkbox
                                    label="Enable editor context menu (on right click)"
                                    defaultChecked={monaco?.contextMenu}
                                    onChange={(_, val) => {
                                        monaco.contextMenu= val ?? false
                                        update(appState,"monaco")
                                    }}
                                />
                            )}
                        />
                        <SettingsProperty
                            key='smoothScroll'
                            title='Smooth Scrolling'
                            control={(
                                <Checkbox
                                    label="Enable that the editor animates scrolling to a position"
                                    defaultChecked={monaco?.smoothScrolling}
                                    onChange={(_, val) => {
                                        monaco.smoothScrolling= val ?? false
                                        update(appState,"monaco")
                                    }}
                                />
                            )}
                        />
                        <SettingsProperty
                            key='mouseWheelZoom'
                            title='Mouse Wheel Zoom'
                            control={(
                                <Checkbox
                                    label="Zoom the font in the editor when using the mouse wheel in combination with holding Ctrl"
                                    defaultChecked={monaco?.mouseWheelZoom}
                                    onChange={(_, val) => {
                                        monaco.mouseWheelZoom= val ?? false
                                        update(appState,"monaco")
                                    }}
                                />
                            )}
                        />
                    </PivotItem>
                </Pivot>

            </div>
        </Modal>
    )
}

export default SettingsModal;


