import {saveAs} from 'file-saver';
import * as fcl from "@onflow/fcl"
import {EvalEvent} from '@services/api';
import config, {RuntimeType} from '@services/config';
import {appState} from "~/state/index";
import {update} from "use-minimal-state";
import dedent from "dedent"

export const saveFileAction = async (fileName, code) => {
    try {
        const blob = new Blob([code], {type: 'text/plain;charset=utf-8'});
        saveAs(blob, fileName);
    } catch (err) {
        alert(`Failed to save a file: ${err}`)
    }
};


function cadenceValueToDict(payload, brief): any {
    if (!payload) return null

    if (payload["type"] === "Array") {
        return cadenceValueToDict(payload["value"], brief)
    }

    if (payload["type"] === "Dictionary") {
        var resDict = {}
        payload["value"].forEach(element => {

            var skey = cadenceValueToDict(element["key"], brief)

            if (brief && skey) {
                if (skey.toString().indexOf("A.") === 0) {
                    skey = skey.toString().split(".").slice(2).join(".")
                }
                resDict[skey] = cadenceValueToDict(element["value"], brief)

            } else {
                resDict[cadenceValueToDict(element["key"], brief)] = cadenceValueToDict(element["value"], brief)
            }
        });
        return resDict
    }

    if (payload["kind"] === "Reference") {
        return "&" + payload["type"]["typeID"]
    }


    if (payload["type"] === "Optional") {
        return cadenceValueToDict(payload["value"], brief)
    }
    if (payload["type"] === "Type") {
        return cadenceValueToDict(payload["value"]["staticType"], brief)
    }

    if (payload["type"] === "Address") {
        return payload["value"]
    }


    if (payload["kind"] && payload["kind"] === "Capability") {
        return payload["type"]["type"]["typeID"]
    }
    if (payload["type"] === "Capability") {
        var res = {}
        res["address"] = payload["value"]["address"]
        res["path"] = cadenceValueToDict(payload["value"]["path"], brief)
        res["borrowType"] = cadenceValueToDict(payload["value"]["borrowType"], brief)
        return {"<Capability>": res}
    }

    if (payload["type"] === "Path") {
        return payload["value"]["domain"] + "/" + payload["value"]["identifier"]
    }

    if (payload["type"] === "UInt64") {
        return payload["value"]
    }

    if (payload["type"] && payload["type"].indexOf("Int") > -1) {
        return parseInt(payload["value"])
    }

    if (Array.isArray(payload)) {
        var resArray: [any?] = []
        for (const i in payload) {
            var d = cadenceValueToDict(payload[i], brief)
            resArray.push(d)
        }
        return resArray
    }


    if (payload["type"] === "Struct" || payload["type"] === "Resource") {
        return cadenceValueToDict(payload["value"], brief)
    }

    if (payload["id"] != null && (payload["id"].indexOf("A.") === 0 || payload["id"].indexOf("s.") === 0)) {

        res = {}
        for (const f in payload["fields"]) {
            res[payload["fields"][f]["name"]] = cadenceValueToDict(payload["fields"][f]["value"], brief)
        }
        var res2 = {}
        if (brief) {
            res2[payload["id"].split(".").slice(2).join(".")] = res
        } else {
            res2[payload["id"]] = res
        }
        return res2
    }

    return payload["value"]

}

export const getTxStatus= async (txId) => {
    await fcl.config(config.networkConfig[RuntimeType.FlowMainnet])
    appState.settings.runtime = RuntimeType.FlowMainnet
    update(appState, "settings")

    try{
        var res = await fcl.send([fcl.getTransaction(txId)]).then(fcl.decode).then((info)=>{
            appState.editor.code = dedent(info.script)
            appState.settings.runtime = RuntimeType.FlowMainnet
            update(appState, "settings")
            update(appState, "editor")
            return true
        })
        if (res){
            return
        }
    }
    catch{
    }

    await fcl.config(config.networkConfig[RuntimeType.FlowTestnet])
    appState.settings.runtime = RuntimeType.FlowTestnet
    update(appState, "settings")
    try{
        var res = await fcl.send([fcl.getTransaction(txId)]).then(fcl.decode).then((info)=>{
            appState.editor.code = dedent(info.script)
            update(appState, "editor")
            return true
        })
        if (res){
            return
        }
    }
    catch{
    }

}

export const runFileAction = async () => {
    const evalStart =  () => {
        appState.status.lastError = ""
        appState.status.events = []
        appState.status.loading = true
        update(appState, "status")
    }

    const evalEvent =  (events: EvalEvent[]) => {
        appState.status.events = [...appState.status.events, ...events]

        update(appState, "status")
    }

    const evalEnd =  () => {
        appState.status.loading = false
        update(appState, "status")
    }

    try {
        await fcl.config(config.networkConfig[appState.settings.runtime])
        const args = appState.editor.jsonArgs
        const code = appState.editor.code

        evalStart()
        var rawArgs = [] as any[]
        if (args) {
            rawArgs = args.map((item) => {
                return fcl.arg(item, (v) => JSON.parse(item))
            })
        }

        if (code.indexOf("transaction") === -1) {

            const res = await fcl.send([
                fcl.args(rawArgs),
                fcl.script(code),
            ])

            var result = {}
            result[res.encodedData["type"]] = cadenceValueToDict(res.encodedData, true)
            await evalEvent([{Kind: "Result", Data: result}]);
            evalEnd()

        } else {
            const currentUser = await fcl.currentUser.snapshot()
            if (!currentUser) {
                var res = await fcl.authenticate()
                alert(res)
            }

            const transactionId = await fcl.mutate({
                cadence: code,
                args: (arg, t) => rawArgs,
                proposer: fcl.currentUser,
                payer: fcl.currentUser,
                limit: 1000
            })
            console.log(transactionId)

            await evalEvent([{Kind: "Transaction ID", Data: transactionId}])

            const transaction = await fcl.tx(transactionId).onceSealed()

            console.log(transaction)
            evalEvent(
                [{
                    Kind: "Transaction Result",
                    Data: transaction,
                }]
            )
            evalEnd()

        }


    } catch (err: any) {
        var m = err.error || err.errorMessage || err.message || err.toString()

        if (m.indexOf("error caused by:")>-1) {
            m = m.split("error caused by:")[1]
        }

        appState.status.lastError = m
        appState.status.loading = false
        appState.status.events =[]
        update(appState, "status")
    }
};








