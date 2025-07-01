import { Injectable } from '@nestjs/common';
import { EventsService } from '../events/events.service';
import { EventData } from '../common/interfaces/event.interface';
import { Benefit } from './entities/benefit.entity';

@Injectable()
export class BenefitsService {
  private benefits: Map<string, Benefit[]> = new Map();

  constructor(private eventsService: EventsService) {}

  detectConsecutiveVisitBenefits(): Benefit[] {
    const allEvents = this.eventsService.getAllEvents();
    const clientStoreEvents = this.groupEventsByClientAndStore(allEvents);
    const newBenefits: Benefit[] = [];

    for (const [key, events] of clientStoreEvents.entries()) {
      const [clientId, storeId] = key.split('|');
      const consecutiveBenefits = this.findConsecutiveVisits(
        events,
        clientId,
        storeId,
      );
      newBenefits.push(...consecutiveBenefits);
    }
    if (newBenefits.length > 0) {
      console.log(`Detected ${newBenefits.length} new benefits.`);
    } else {
      console.log('No new benefits detected.');
    }

    this.storeBenefits(newBenefits);
    return newBenefits;
  }

  private groupEventsByClientAndStore(
    events: EventData[],
  ): Map<string, EventData[]> {
    const grouped = new Map<string, EventData[]>();

    events.forEach((event) => {
      const key = `${event.client_id}|${event.store_id}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)?.push(event);
    });

    grouped.forEach((events, key) => {
      grouped.set(
        key,
        events.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        ),
      );
    });
    return grouped;
  }

  private findConsecutiveVisits(
    events: EventData[],
    clientId: string,
    storeId: string,
  ): Benefit[] {
    const benefits: Benefit[] = [];
    let consecutiveVisits = 0;
    let visitEventIds: string[] = [];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      if (event.type === 'visit') {
        consecutiveVisits++;
        visitEventIds.push(`${event.client_id}-${event.timestamp}`);

        if (consecutiveVisits === 5) {
          const benefit = new Benefit({
            id: `benefit-${Date.now()}-${Math.random()}`,
            client_id: clientId,
            store_id: storeId,
            type: 'consecutive_visits',
            description: '5 visitas consecutivas sin recarga',
            awarded_at: new Date(event.timestamp),
            qualifying_events: [...visitEventIds],
          });

          benefits.push(benefit);
          consecutiveVisits = 0;
          visitEventIds = [];
        }
      } else if (event.type === 'recharge') {
        consecutiveVisits = 0;
        visitEventIds = [];
      }
    }

    return benefits;
  }

  private storeBenefits(benefits: Benefit[]): void {
    benefits.forEach((benefit) => {
      if (!this.benefits.has(benefit.client_id)) {
        this.benefits.set(benefit.client_id, []);
      }
      this.benefits.get(benefit.client_id)!.push(benefit);
    });
  }

  getBenefitsByClient(clientId: string): Benefit[] {
    return this.benefits.get(clientId) || [];
  }

  getAllBenefits(): Benefit[] {
    const allBenefits: Benefit[] = [];
    this.benefits.forEach((clientBenefits) => {
      allBenefits.push(...clientBenefits);
    });
    return allBenefits;
  }
}
