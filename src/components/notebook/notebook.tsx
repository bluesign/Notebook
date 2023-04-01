import React, {useEffect, useState} from 'react';
import CellView from "@components/notebook/cell/cell";
import {Link} from "@fluentui/react";
import {integer} from "monaco-languageclient";
import dedent from "dedent";
import runCadence from "../../services/flow"
import {appState} from "~/state";
import {update, use} from "use-minimal-state";
class Cell {
    public language: string
    public content: string

    constructor(props) {
        this.language = props.language
        this.content = props.content
    }

}

export default function Notebook({loaderRef}) {
    const [cells, setCells] = useState<Cell[]>([])
    const [selectedCell, setSelectedCell] = useState<integer>(1)
    const [oldState, setOldState] = useState<string>("")
    const handleMouseEnter = (cell: Cell) => {
        setSelectedCell(cells.indexOf(cell));
    };

    use(appState, "editor")

    const loadNotebook = (code)=>{
        console.log("load")
        var markdown = code
        markdown = dedent(markdown)
        let cells:Array<Cell> = []
        const pieces = markdown.split("---")
        for (let i = 0; i < pieces.length; i++) {
            let piece = pieces[i]
            if (piece.indexOf("``")>-1) {
                cells.push(new Cell({language: "cadence", content: piece.replaceAll("`", "").trim()}))
            } else {
                cells.push(new Cell({language: "markdown", content: piece.trim()}))
            }
        }
        console.log(cells.length)
        setCells(cells)

        updateNotebook(cells)
    }

    loaderRef.current = loadNotebook
    const updateNotebook = (cells)=>{

        console.log("updateNotebook", cells)
        const codes = cells.map((cell:Cell)=>{
            if (cell.language==='cadence'){
                return "```\n" + cell.content + "\n```"
            }
            else{
                return cell.content
            }
        })
        appState.editor.code = codes.join("\n---\n")
        update(appState, "editor")
    }


    return (
        <div>
            {
                cells.map(
                    (cell) => (
                        <div key={cells.indexOf(cell)} onMouseEnter={() => handleMouseEnter(cell)}>
                            <CellView
                                hasFocus={selectedCell === cells.indexOf(cell)}
                                language={cell.language}
                                updateCell = {(content)=>{
                                    cell.content = content
                                    //update notebook code
                                    updateNotebook(cells)
                                }
                                }
                                runCell={async (content)=>{
                                    const result = await runCadence(oldState, content)
                                    setOldState(result.oldCode)
                                    return {data:result.data, method:result.method}
                                }}
                                value={cell.content}/>
                        </div>
                    )
                )
            }

            <div style={{marginLeft: "50px"}}>
                <Link>Add Cell</Link>
            </div>
        </div>
    );
}