declare module 'steam-tradeoffer-manager' {
  import { EventEmitter } from 'events';
  import SteamUser from 'steam-user';
  import SteamCommunity from 'steamcommunity';

  export interface TradeOfferManagerOptions {
    steam?: SteamUser;
    community?: SteamCommunity;
    domain?: string;
    language?: string;
    pollInterval?: number;
    minimumPollInterval?: number;
    cancelTime?: number;
    pendingCancelTime?: number;
    cancelOfferCount?: number;
    cancelOfferCountMinAge?: number;
  }

  export interface TradeOffer {
    id: string;
    partner: SteamUser;
    itemsToGive: any[];
    itemsToReceive: any[];
    message: string;
    state: number;
    timeCreated: number;
    timeUpdated: number;
    fromRealTimeTrade: boolean;
    escrowEndDate: number;
    confirmationMethod: number;
    isOurOffer: boolean;
    created: Date;
    updated: Date;
    expires: Date;
    tradeID: string | null;
    manager: TradeOfferManager;
    
    addMyItem(item: { appid: number; contextid: string; assetid: string }): void;
    addMyItems(items: Array<{ appid: number; contextid: string; assetid: string }>): void;
    removeMyItem(item: { appid: number; contextid: string; assetid: string }): void;
    removeMyItems(items: Array<{ appid: number; contextid: string; assetid: string }>): void;
    addTheirItem(item: { appid: number; contextid: string; assetid: string }): void;
    addTheirItems(items: Array<{ appid: number; contextid: string; assetid: string }>): void;
    removeTheirItem(item: { appid: number; contextid: string; assetid: string }): void;
    removeTheirItems(items: Array<{ appid: number; contextid: string; assetid: string }>): void;
    containsItem(item: { appid: number; contextid: string; assetid: string }): boolean;
    setMessage(message: string): void;
    setToken(token: string): void;
    send(callback?: (err: any, status: string) => void): void;
    cancel(callback?: (err: any) => void): void;
    decline(callback?: (err: any) => void): void;
    accept(skipStateUpdate?: boolean, callback?: (err: any, status: string) => void): void;
    duplicate(): TradeOffer;
    counter(): TradeOffer;
    update(callback: (err: any) => void): void;
    isGlitched(): boolean;
    data(key: string, value?: any): any;
  }

  export default class TradeOfferManager extends EventEmitter {
    steamID: string;
    apiKey: string;
    
    constructor(options: TradeOfferManagerOptions);
    
    createOffer(partner: string, token?: string): TradeOffer;
    getOffer(id: string, callback: (err: any, offer: TradeOffer) => void): void;
    acceptOffer(offerId: string, callback: (err: any, status: string) => void): void;
    declineOffer(offerId: string, callback: (err: any, status: string) => void): void;
    
    getOffers(
      filter: EOfferFilter,
      historicalCutoff?: Date,
      callback?: (err: any, sent: TradeOffer[], received: TradeOffer[]) => void
    ): void;
    
    getInventoryContents(
      appid: number,
      contextid: string,
      tradableOnly: boolean,
      callback: (err: any, items: any[]) => void
    ): void;
    
    getUserInventoryContents(
      steamID: string,
      appid: number,
      contextid: string,
      tradableOnly: boolean,
      callback: (err: any, items: any[]) => void
    ): void;
    
    getOfferToken(callback: (err: any, token: string) => void): void;
    doPoll(): void;
    shutdown(): void;
    setCookies(cookies: string[], familyViewPin?: string, callback?: (err: any) => void): void;
    parentalUnlock(pin: string, callback?: (err: any) => void): void;
    
    on(event: 'sentOfferChanged', listener: (offer: TradeOffer, oldState: number) => void): this;
    on(event: 'receivedOfferChanged', listener: (offer: TradeOffer, oldState: number) => void): this;
    on(event: 'newOffer', listener: (offer: TradeOffer) => void): this;
    on(event: 'sentOfferCanceled', listener: (offer: TradeOffer, reason: string) => void): this;
    on(event: 'receivedOfferCanceled', listener: (offer: TradeOffer, reason: string) => void): this;
    on(event: 'pollFailure', listener: (err: any) => void): this;
    on(event: 'pollSuccess', listener: () => void): this;
    on(event: 'sessionExpired', listener: (err?: any) => void): this;
  }

  export enum ETradeOfferState {
    Invalid = 1,
    Active = 2,
    Accepted = 3,
    Countered = 4,
    Expired = 5,
    Canceled = 6,
    Declined = 7,
    InvalidItems = 8,
    CreatedNeedsConfirmation = 9,
    CanceledBySecondFactor = 10,
    InEscrow = 11
  }

  export enum EOfferFilter {
    ActiveOnly = 1,
    HistoricalOnly = 2,
    All = 3
  }

  export enum EResult {
    OK = 1,
    Fail = 2,
    NoConnection = 3,
    InvalidPassword = 5,
    LoggedInElsewhere = 6,
    InvalidProtocolVer = 7,
    InvalidParam = 8,
    FileNotFound = 9,
    Busy = 10,
    InvalidState = 11,
    InvalidName = 12,
    InvalidEmail = 13,
    DuplicateName = 14,
    AccessDenied = 15,
    Timeout = 16,
    Banned = 17,
    AccountNotFound = 18,
    InvalidSteamID = 19,
    ServiceUnavailable = 20,
    NotLoggedOn = 21,
    Pending = 22,
    EncryptionFailure = 23,
    InsufficientPrivilege = 24,
    LimitExceeded = 25,
    Revoked = 26,
    Expired = 27,
    AlreadyRedeemed = 28,
    DuplicateRequest = 29,
    AlreadyOwned = 30,
    IPNotFound = 31,
    PersistFailed = 32,
    LockingFailed = 33,
    LogonSessionReplaced = 34,
    ConnectFailed = 35,
    HandshakeFailed = 36,
    IOFailure = 37,
    RemoteDisconnect = 38,
    ShoppingCartNotFound = 39,
    Blocked = 40,
    Ignored = 41,
    NoMatch = 42,
    AccountDisabled = 43,
    ServiceReadOnly = 44,
    AccountNotFeatured = 45,
    AdministratorOK = 46,
    ContentVersion = 47,
    TryAnotherCM = 48,
    PasswordRequiredToKickSession = 49,
    AlreadyLoggedInElsewhere = 50,
    Suspended = 51,
    Cancelled = 52,
    DataCorruption = 53,
    DiskFull = 54,
    RemoteCallFailed = 55,
    PasswordUnset = 56,
    ExternalAccountUnlinked = 57,
    PSNTicketInvalid = 58,
    ExternalAccountAlreadyLinked = 59,
    RemoteFileConflict = 60,
    IllegalPassword = 61,
    SameAsPreviousValue = 62,
    AccountLogonDenied = 63,
    CannotUseOldPassword = 64,
    InvalidLoginAuthCode = 65,
    AccountLogonDeniedNoMail = 66,
    HardwareNotCapableOfIPT = 67,
    IPTInitError = 68,
    ParentalControlRestricted = 69,
    FacebookQueryFailed = 70,
    ExpiredLoginAuthCode = 71,
    IPLoginRestrictionFailed = 72,
    AccountLockedDown = 73,
    AccountLogonDeniedVerifiedEmailRequired = 74,
    NoMatchingURL = 75,
    BadResponse = 76,
    RequirePasswordReEntry = 77,
    ValueOutOfRange = 78,
    UnexpectedError = 79,
    Disabled = 80,
    InvalidCEGSubmission = 81,
    RestrictedDevice = 82,
    RegionLocked = 83,
    RateLimitExceeded = 84,
    AccountLoginDeniedNeedTwoFactor = 85,
    ItemDeleted = 86,
    AccountLoginDeniedThrottle = 87,
    TwoFactorCodeMismatch = 88,
    TwoFactorActivationCodeMismatch = 89,
    AccountAssociatedToMultiplePartners = 90,
    NotModified = 91,
    NoMobileDevice = 92,
    TimeNotSynced = 93,
    SMSCodeFailed = 94,
    AccountLimitExceeded = 95,
    AccountActivityLimitExceeded = 96,
    PhoneActivityLimitExceeded = 97,
    RefundToWallet = 98,
    EmailSendFailure = 99,
    NotSettled = 100,
    NeedCaptcha = 101,
    GSLTDenied = 102,
    GSOwnerDenied = 103,
    InvalidItemType = 104,
    IPBanned = 105,
    GSLTExpired = 106,
    InsufficientFunds = 107,
    TooManyPending = 108,
    NoSiteLicensesFound = 109,
    WGNetworkSendExceeded = 110,
    AccountNotFriends = 111,
    LimitedUserAccount = 112,
    CantRemoveItem = 113,
    AccountDeleted = 114,
    ExistingUserCancelledLicense = 115,
    CommunityCooldown = 116,
    NoLauncherSpecified = 117,
    MustAgreeToSSA = 118,
    LauncherMigrated = 119,
    SteamRealmMismatch = 120,
    InvalidSignature = 121,
    ParseFailure = 122,
    NoVerifiedPhone = 123,
    InsufficientBattery = 124,
    ChargerRequired = 125,
    CachedCredentialInvalid = 126,
    PhoneNumberIsVOIP = 127
  }
}
