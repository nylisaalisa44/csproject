import SteamUser from 'steam-user';

/**
 * Интерфейс для Steam трейд-оффера
 */
export interface SteamTradeOffer {
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
}

/**
 * Интерфейс для предмета инвентаря Steam
 */
export interface SteamInventoryItem {
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
  market_hash_name: string;
  market_name: string;
  name: string;
  icon_url: string;
  icon_url_large: string;
  type: string;
  tradable: number;
  marketable: number;
  commodity: number;
  market_tradable_restriction: string;
  descriptions: any[];
  actions: any[];
  market_actions: any[];
  tags: any[];
}

/**
 * Интерфейс для опций TradeOfferManager
 */
export interface TradeOfferManagerOptions {
  steam?: SteamUser;
  community?: any;
  domain?: string;
  language?: string;
  pollInterval?: number;
  minimumPollInterval?: number;
  cancelTime?: number;
  pendingCancelTime?: number;
  cancelOfferCount?: number;
  cancelOfferCountMinAge?: number;
}

/**
 * Интерфейс для результата синхронизации инвентаря
 */
export interface InventorySyncResult {
  added: number;
  removed: number;
  updated: number;
}

/**
 * Интерфейс для результата обработки трейдов
 */
export interface TradeProcessingResult {
  processed: number;
  accepted: number;
  declined: number;
}
