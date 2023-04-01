import React, {useRef, useState} from 'react';
import Editor from "@components/notebook/editor/editor";
import Stack from "@components/notebook/stack";
import {Code, PlayCircle, Plus, Type} from 'react-bootstrap-icons';
import {Repeat} from 'react-bootstrap-icons';
import remarkBreaks from 'remark-breaks'

import {Console} from "console-feed";
import {Link} from "@fluentui/react";
import ReactMarkdown from 'react-markdown'
import {use} from "use-minimal-state";
import {appState} from "~/state";


export default function Cell({value, language, hasFocus, updateCell, runCell} ) {
    const [logs, setLogs] = useState([])
    const [isCode, setIsCode] = useState<boolean>(false)
    const content = useRef<string>(value)
    const settings = use(appState, "settings")

    // @ts-ignore
    const addLog = (log) => setLogs(currLogs => [...currLogs, log])

    /*
    type Methods =
  | 'log'
  | 'warn'
  | 'error'
  | 'info'
  | 'debug'
  | 'command'
  | 'result'
     */
    return (
        <div style={{padding:0, margin:0}}>
            <Stack>
                {language === 'cadence' &&
                    <div style={{
                        paddingRight: '10px',
                        paddingLeft: '25px',
                        display: 'inline-block',
                        alignSelf: 'flex-end'
                    }}>
                        <Stack direction="column">
                            <Link>
                                {logs.length > 0 && <Repeat onClick={async () => {
                                    setLogs([])
                                    const r = await runCell(content.current)
                                    addLog(r)
                                }}/>
                                }
                                {logs.length === 0 && <PlayCircle
                                    onClick={async () => {
                                        setLogs([])
                                        const r = await runCell(content.current)
                                        addLog(r)
                                    }}/>
                                }
                            </Link>

                        </Stack>
                    </div>
                }


                {language === 'markdown' && <div style={{
                    paddingRight: '10px',
                    paddingLeft: '25px',
                    display: 'inline-block',
                    alignSelf: 'flex-end'
                }}
                >

                    {isCode && <Type
                        onClick={() => setIsCode(!isCode)}
                    />}

                    {!isCode && <Code
                        onClick={() => setIsCode(!isCode)}/>
                    }


                </div>}

                {language === 'cadence' &&
                    <div style={{
                        padding: '1px',
                        width: '90%',

                    }}>
                        <Editor onChange={(content)=>updateCell(content)} value={content} language={language}/>

                        {logs.length > 0 && <div style={{
                            marginTop: '5px',
                            marginLeft: '15px',
                        }}>
                            <Console styles={{
                                BASE_BACKGROUND_COLOR: 'transparent',
                                LOG_RESULT_BACKGROUND: settings.darkMode?"#333":"#fdf7ef",
                                BASE_FONT_SIZE:'13px',
                                BASE_FONT_FAMILY:'monaco'}}
                                     logs={logs}
                                     variant={settings.darkMode?"dark":"light"}
                            />
                        </div>}
                    </div>
                }

                {language === 'markdown' &&
                    <div style={{
                        padding: '1px',
                        margin: '0',
                        width: '90%',
                    }}>
                        {isCode && <Editor onChange={(content)=>updateCell(content)} value={content} language={language}/>}
                        {!isCode &&
                            <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                                {content.current}
                            </ReactMarkdown>
                        }
                    </div>
                }








            </Stack>

            {hasFocus &&
                <div style={{color: "#999", width: '90%',  marginLeft: "50px"}}>
                    <Link>
                        <Plus/>
                    </Link>

                </div>
            }
            {!hasFocus &&
                <div style={{width: '90%',  marginLeft: "50px"}}>
                    &nbsp;
                </div>
            }

        </div>
    );
}