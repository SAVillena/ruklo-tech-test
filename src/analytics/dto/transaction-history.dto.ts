import { EventData } from 'src/common/interfaces/event.interface';

export interface WeeklyRechargeData {
  week: string; // YYYY-WW
  weekStart: string;
  weekEnd: string;
  totalAmount: number;
  rechargeCount: number;
  averageAmount: number;
}

export interface ClientTransactionHistory {
  client_id: string;
  visits: {
    total: number;
    events: EventData[];
  };
  recharges: {
    total: number;
    totalAmount: number;
    events: EventData[];
    weeklyData: WeeklyRechargeData[];
  };
}
