declare module 'steamcommunity' {
  import { EventEmitter } from 'events';

  export default class SteamCommunity extends EventEmitter {
    getUserInventoryContents(
      steamID: string,
      appid: number,
      contextid: string,
      tradableOnly: boolean
    ): Promise<any[]>;
    
    setCookies(cookies: string[]): void;
    
    login(options: {
      steamID: string;
      webLogOn: boolean;
    }, callback: (err: any) => void): void;
    
    // События
    on(event: 'sessionExpired', listener: () => void): this;
    on(event: 'webSession', listener: (sessionID: string, cookies: string[]) => void): this;
  }
}
