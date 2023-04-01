export enum RuntimeType {
  FlowMainnet     = 'FLOW_MAINNET',
  FlowTestnet     = 'FLOW_TESTNET',
  FlowEmulator    = 'FLOW_EMULATOR'
}

export namespace RuntimeType {
  export function toString(t?: RuntimeType) {
    if (!t) {
      return;
    }

    switch (t) {
      case RuntimeType.FlowMainnet:
        return "Flow Mainnet";
      case RuntimeType.FlowTestnet:
        return "Flow Testnet";
      case RuntimeType.FlowEmulator:
        return "Local Emulator";
      default:
        return RuntimeType[t];
    }
  }
}

export interface MonacoSettings {
  fontFamily: string,
  fontLigatures: boolean,
  cursorBlinking: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid',
  cursorStyle: 'line' | 'block' | 'underline' | 'line-thin' | 'block-outline' | 'underline-thin',
  selectOnLineNumbers: boolean,
  minimap: boolean,
  contextMenu: boolean,
  smoothScrolling: boolean,
  mouseWheelZoom: boolean,
}




export const getVariableValue = (key: string, defaultValue: string) =>
  process.env[`REACT_APP_${key}`] ?? defaultValue;

const Config = {
  appVersion: getVariableValue('VERSION', '1.0.0'),
  serverUrl: getVariableValue('LANG_SERVER', "https://paste.dnz.dev"),
  githubUrl: getVariableValue('GITHUB_URL', 'https://github.com/bluesign/runnerDnzDev'),
  issueUrl: getVariableValue('ISSUE_URL', 'https://github.com/xbluesign/runnerDnzDev/issues/new'),
  networkConfig: {
    "FLOW_TESTNET": {
      "env": "testnet",
      "accessNode.api": "https://rest-testnet.onflow.org",
      "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
      "fcl.eventsPollRate": 2500,
      "0xLockedTokens": "0x95e019a17d0e23d7",
      "0xFungibleToken": "0x9a0766d93b6608b7",
      "0xNonFungibleToken": "0x631e88ae7f1d7c20",
      "0xFUSD": "0xe223d8a629e49c68",
      "0xMetadataViews": "0x631e88ae7f1d7c20",
      //"discovery.wallet.method": "POP/RPC",
      "0xFIND": "0xa16ab1d0abde3625",
    },
    "FLOW_MAINNET": {
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
      "0xFIND": "0x097bafa4e0b48eef",
    },

    "FLOW_EMULATOR": {
      "env": "emulator",
      "accessNode.api": "http://127.0.0.1:8888",
      "discovery.wallet": "http://127.0.0.1:8701/fcl//authn",
      "fcl.eventsPollRate": 2500,
      // "discovery.wallet.method": "POP/RPC",
    }

  },
}

export default Config;
