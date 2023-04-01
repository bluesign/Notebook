import { createMessageConnection, Disposable } from "vscode-jsonrpc";
import {
  createConnection,
  CloseAction,
  ErrorAction,
  MonacoLanguageClient,
} from "monaco-languageclient";
import {CADENCE_LANGUAGE_ID} from "@components/editor/Cadence/cadence";

export function createCadenceLanguageClient(callbacks) {
  const logger = {
    error(message) {
      console.error(message);
    },
    warn(message) {
      console.warn(message);
    },
    info(message) {
      console.info(message);
    },
    log(message) {
      console.log(message);
    },
  };

  const writer = {
    onClose() {
      return Disposable.create(() => {});
    },
    onError() {
      return Disposable.create(() => {});
    },
    async write(msg) {
      if (msg["method"]==="textDocument/didChange")
        window.lastChangeMessage = msg

      callbacks.toServer(null, msg);
    },
    end() {},
    dispose() {
      callbacks.onClientClose();
    },
  };

  const reader = {
    onError() {
      return Disposable.create(() => {});
    },
    onClose() {
      return Disposable.create(() => {});
    },
    onPartialMessage() {
      return Disposable.create(() => {});
    },
    listen(dataCallback) {
      callbacks.toClient = (message) => dataCallback(message);
      return Disposable.create(() => {});
    },
    dispose() {
      console.log(
          "-------------------------->",
          "Language Client is closed. Do something!"
      );
      callbacks.onClientClose();
    },
  };

  const messageConnection = createMessageConnection(reader, writer, logger);

  return new MonacoLanguageClient({
    name: "Cadence Language Client",
    clientOptions: {
      documentSelector: [CADENCE_LANGUAGE_ID],
      errorHandler: {
        error: () => ErrorAction.Continue,
        closed: () => CloseAction.DoNotRestart,
      },
    },
    // Create a language client connection from the JSON-RPC connection on demand
    connectionProvider: {
      get: (errorHandler, closeHandler) => {
        return Promise.resolve(
            createConnection(messageConnection, errorHandler, closeHandler)
        );
      },
    },
  });
}
