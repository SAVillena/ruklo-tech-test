import { Injectable } from '@nestjs/common';
import { EventsService } from '../events/events.service';
import { EventData } from '../common/interfaces/event.interface';
import {
  ClientTransactionHistory,
  WeeklyRechargeData,
} from './dto/transaction-history.dto';

@Injectable()
export class AnalyticsService {
  constructor(private eventsService: EventsService) {}

  getClientTransactionHistory(clientId: string): ClientTransactionHistory {
    const events = this.eventsService.getEventByClient(clientId);

    const visits = events.filter((event) => event.type === 'visit');
    const recharges = events.filter((event) => event.type === 'recharge');

    const weeklyData = this.generateWeeklyRechargeData(recharges);

    return {
      client_id: clientId,
      visits: {
        total: visits.length,
        events: visits,
      },
      recharges: {
        total: recharges.length,
        totalAmount: recharges.reduce(
          (sum, event) => sum + (event.amount || 0),
          0,
        ),
        events: recharges,
        weeklyData,
      },
    };
  }

  getAllClientsTransactionHistory(): ClientTransactionHistory[] {
    const allEvents = this.eventsService.getAllEvents();
    const clientIds = [...new Set(allEvents.map((e) => e.client_id))];

    return clientIds.map((clientId) =>
      this.getClientTransactionHistory(clientId),
    );
  }
  private generateWeeklyRechargeData(
    recharges: EventData[],
  ): WeeklyRechargeData[] {
    if (recharges.length === 0) {
      return this.generateEmptyWeeks();
    }

    // Agrupar recargas por semana
    const weeklyGroups = new Map<string, EventData[]>();

    recharges.forEach((recharge) => {
      const weekKey = this.getWeekKey(new Date(recharge.timestamp));
      if (!weeklyGroups.has(weekKey)) {
        weeklyGroups.set(weekKey, []);
      }
      weeklyGroups.get(weekKey)!.push(recharge);
    });

    // Generar rango completo de semanas
    const allWeeks = this.generateWeekRange(recharges);

    return allWeeks
      .map((weekKey) => {
        const weekRecharges = weeklyGroups.get(weekKey) || [];
        const totalAmount = weekRecharges.reduce(
          (sum, r) => sum + (r.amount || 0),
          0,
        );
        const dates = this.getWeekDates(weekKey);

        return {
          week: weekKey,
          weekStart: dates.start,
          weekEnd: dates.end,
          totalAmount,
          rechargeCount: weekRecharges.length,
          averageAmount:
            weekRecharges.length > 0 ? totalAmount / weekRecharges.length : 0,
        };
      })
      .sort((a, b) => a.week.localeCompare(b.week));
  }

  private generateEmptyWeeks(): WeeklyRechargeData[] {
    // Generar últimas 4 semanas como ejemplo
    const weeks: WeeklyRechargeData[] = [];
    const now = new Date();

    for (let i = 3; i >= 0; i--) {
      const weekDate = new Date(now);
      weekDate.setDate(weekDate.getDate() - i * 7);
      const weekKey = this.getWeekKey(weekDate);
      const dates = this.getWeekDates(weekKey);

      weeks.push({
        week: weekKey,
        weekStart: dates.start,
        weekEnd: dates.end,
        totalAmount: 0,
        rechargeCount: 0,
        averageAmount: 0,
      });
    }

    return weeks;
  }

  private generateWeekRange(events: EventData[]): string[] {
    if (events.length === 0) return [];

    const timestamps = events.map((e) => new Date(e.timestamp).getTime());
    const minDate = new Date(Math.min(...timestamps));
    const maxDate = new Date(Math.max(...timestamps));

    const weeks: string[] = [];
    const current = new Date(minDate);

    // Ajustar al inicio de la semana (lunes)
    current.setDate(current.getDate() - current.getDay() + 1);

    while (current <= maxDate) {
      weeks.push(this.getWeekKey(current));
      current.setDate(current.getDate() + 7);
    }

    return weeks;
  }

  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const weekNumber = this.getWeekNumber(date);
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private getWeekDates(weekKey: string): { start: string; end: string } {
    const [year, week] = weekKey.split('-W');
    const yearNum = parseInt(year);
    const weekNum = parseInt(week);

    // Calcular primer día de la semana
    const firstDayOfYear = new Date(yearNum, 0, 1);
    const daysToAdd = (weekNum - 1) * 7 - firstDayOfYear.getDay() + 1;
    const weekStart = new Date(yearNum, 0, 1 + daysToAdd);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return {
      start: weekStart.toISOString().split('T')[0],
      end: weekEnd.toISOString().split('T')[0],
    };
  }
}
