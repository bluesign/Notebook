import * as fcl from "@onflow/fcl"
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


 const runCell: any = async (oldCode, codeToRun: string) => {
    if (oldCode===""){
        oldCode = `
        pub fun main(): AnyStruct{
        //NEXT_CONTEXT
        return "Executed"
        }
        `
    }
    var shouldSave = true

    var codeWrapped = `
        if true{
          ${codeToRun}
          //NEXT_CONTEXT
        }
      `
    if (codeToRun.startsWith("#reset")) {
        oldCode = ""
        shouldSave = false
        codeToRun = `return "Reset Done"`
    }


    if (codeToRun.startsWith("#print")){
        codeWrapped = `
        if true{
           return ${codeToRun.substring(6)} as AnyStruct
        }
     `
        shouldSave = false
        codeToRun = oldCode.replace("//NEXT_CONTEXT", codeWrapped )

    }else {
        codeToRun = oldCode.replace("//NEXT_CONTEXT", codeWrapped)
    }


/*
    fcl.config(
        {
            "env": "mainnet",
            "accessNode.api": "https://rest-mainnet.onflow.org",
            "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
            "fcl.eventsPollRate": 2500,
            "0xLockedTokens": "0x8d0e87b65159ae63",
            "0xFungibleToken": "0xf233dcee88fe0abe",
            "0xNonFungibleToken": "0x1d7e57aa55817448",
            "0xMetadataViews": "0x1d7e57aa55817448",
            "0xFUSD": "0x3c5959b568896393",
            // "discovery.wallet.method": "POP/RPC",
            "0xFIND": "0x097bafa4e0b48eef"
        })
*/
    const regex = /import (.*?) from (.*)[^a-fA-F0-9x]/g;
    const imports = codeToRun.match(regex);
    var impheader = ""
    imports && imports.map((imp)=>{
        if (impheader.indexOf(imp)===-1)
            impheader = impheader + imp + "\n"
        codeToRun = codeToRun.replace(imp, "")
    })
    codeToRun =  impheader + codeToRun


    var val = ""
    try {
        val = await fcl.query({
            cadence: codeToRun
        })
    }catch(e:any){
        var msg = e.errorMessage || e.toString()
        if (msg.indexOf("error caused by:")>-1){
            msg = msg.split("error caused by:")[1].split("\n").slice(1).join("\n")
        }
        if (msg.indexOf("-->")>-1){
            msg = msg.split("-->")[0]
        }
        msg = msg.trim()
        return {
            method: "error",
            data: [msg],
            oldCode: oldCode
        }
    }

    if (shouldSave) {
        oldCode = codeToRun
    }


     return {
        method: "result",
        data: [val],
        oldCode: oldCode
    }

}

export default runCell
