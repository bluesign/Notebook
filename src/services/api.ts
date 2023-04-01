import * as axios from 'axios';
import { AxiosInstance } from 'axios';
import config from './config';

const apiAddress = `${config.serverUrl}`;
const axiosClient = axios.default.create({ baseURL: apiAddress });

export interface ShareResponse {
  snippetID: string
}

export interface Snippet {
  env: string
  code: string
}

export interface EvalEvent {
  Kind: string
  Data: any
}

export interface IAPIClient {
  readonly axiosClient: AxiosInstance

  getSnippet(id: string): Promise<Snippet>

  shareSnippet(code: string, env:string): Promise<ShareResponse>
}


class Client implements IAPIClient {
  get axiosClient() {
    return this.client;
  }

  constructor(private client: axios.AxiosInstance) {
  }

  async getSnippet(id: string): Promise<Snippet> {
    return this.get<Snippet>(`/${id}`);
  }

  async shareSnippet(code: string, env: string): Promise<ShareResponse> {
    return this.post<ShareResponse>('/', {code: code, env:env});
  }

  private async get<T>(uri: string): Promise<T> {
    try {
      const resp = await this.client.get<T>(uri);
      return resp.data;
    } catch (err) {
      throw Client.extractAPIError(err);
    }
  }

  private async post<T>(uri: string, data: any, cfg?: axios.AxiosRequestConfig): Promise<T> {
    try {
      const resp = await this.client.post<T>(uri, data, cfg);
      return resp.data;
    } catch (err) {
      throw Client.extractAPIError(err);
    }
  }

  private static extractAPIError(err: any): Error {
    return new Error(err?.response?.data?.error ?? err.message);
  }
}

export default new Client(axiosClient);
