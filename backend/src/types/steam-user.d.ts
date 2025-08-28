declare module 'steam-user' {
  import { EventEmitter } from 'events';

  export default class SteamUser extends EventEmitter {
    logOn(options: {
      accountName: string;
      password: string;
      twoFactorCode?: string;
      rememberPassword?: boolean;
      loginKey?: string;
      machineName?: string;
      authCode?: string;
      steamGuardCode?: string;
      webLogOn?: boolean;
      loginID?: number;
    }): void;
    
    logOff(): void;
    
    getSteamID64(): string;
    
    // События
    on(event: 'loggedOn', listener: (details: any) => void): this;
    on(event: 'error', listener: (err: any) => void): this;
    on(event: 'disconnected', listener: (eresult: number, msg: string) => void): this;
    on(event: 'steamGuard', listener: (domain: string, callback: (code: string) => void) => void): this;
    on(event: 'webSession', listener: (sessionID: string, cookies: string[]) => void): this;
  }
}
