export interface EventData {
  client_id: string;
  store_id: string;
  type: 'visit' | 'recharge';
  amount?: number;
  timestamp: string;
}
