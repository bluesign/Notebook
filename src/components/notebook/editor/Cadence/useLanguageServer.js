import { useState, useEffect } from "react";
import { monaco } from "react-monaco-editor";
import { MonacoServices } from "monaco-languageclient/lib/monaco-services";
import * as fcl from "@onflow/fcl"
import { CadenceLanguageServer } from "./language-server";
import { createCadenceLanguageClient } from "./language-client";

let monacoServicesInstalled = false;

async function startLanguageServer(callbacks, getCode, options) {
  const { setLanguageServer, setCallbacks } = options;
  const server = await CadenceLanguageServer.create(callbacks);
  new Promise(() => {
    let checkInterval = setInterval(() => {
      // .toServer() method is populated by language server
      // if it was not properly started or in progress it will be "null"
      if (callbacks.toServer !== null) {
        clearInterval(checkInterval);
        callbacks.getAddressCode = getCode;
        setCallbacks(callbacks);
        setLanguageServer(server);
        console.log("%c LS: Is Up!", "color: #00FF00");
      }
    }, 100);
  });
}

const launchLanguageClient = async (
  callbacks,
  languageServer,
  setLanguageClient
) => {
  if (languageServer) {
    const newClient = createCadenceLanguageClient(callbacks);
    newClient.start();
    await newClient.onReady();
    setLanguageClient(newClient);
  }
};

export default function useLanguageServer() {
  let initialCallbacks = {
    // The actual callback will be set as soon as the language server is initialized
    toServer: null,

    // The actual callback will be set as soon as the language server is initialized
    onClientClose: null,

    // The actual callback will be set as soon as the language client is initialized
    onServerClose: null,

    // The actual callback will be set as soon as the language client is initialized
    toClient: null,

    //@ts-ignore
    getAddressCode(address) {
      // we will set it once it is instantiated
    },
  };

  // Base state handler
  const [languageServer, setLanguageServer] = useState(null);
  const [languageClient, setLanguageClient] = useState(null);
  const [callbacks, setCallbacks] = useState(initialCallbacks);
  var codes = {}


  const getCodeAsync = async (address,callbacks) => {

    let [account, _] = address.split(".")
    while (account.length<16){
      account = "0" + account
    }
  console.log(account)
    let response =  await fcl.send([fcl.getAccount(`0x${account}`)])
    let contracts = response["account"]["contracts"]
  console.log(response)

    for(let key in contracts) {
      console.log(key)
      codes[`${account}.${key}`] = contracts[key]
    }

  }

  const getCode = (address) => {

    console.log("GET CODE", address)

    if (codes[address]!=null){
      return codes[address]
    }

    getCodeAsync(address,callbacks).then()
    return null
  };


  const restartServer = () => {
    console.log("Restarting server...");

    startLanguageServer(callbacks, getCode, {
      setLanguageServer,
      setCallbacks,
    }).then();
  };

  useEffect(() => {
    // The Monaco Language Client services have to be installed globally, once.
    // An editor must be passed, which is only used for commands.
    // As the Cadence language server is not providing any commands this is OK

    console.log("Installing monaco services");
    if (!monacoServicesInstalled) {
      MonacoServices.install(monaco);
      monacoServicesInstalled = true;
    }

    restartServer();
  }, []);

  useEffect(() => {
    if (!languageClient && window) {
      launchLanguageClient(callbacks, languageServer, setLanguageClient).then();
    }
  }, [languageServer]);

  return {
    languageClient,
    languageServer,
    restartServer,
  };
}
