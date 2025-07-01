import { Injectable } from '@nestjs/common';
import { EventData } from 'src/common/interfaces/event.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EventsService {
  private events: EventData[] = [];

  constructor() {
    this.loadEvents();
  }

  private loadEvents() {
    try {
      const filePath = path.join(
        __dirname,
        '../../src/data/ruklo_events_1000.json',
      );
      const rawData = fs.readFileSync(filePath, 'utf8');
      this.events = JSON.parse(rawData) as EventData[];
      console.log(`Loaded ${this.events.length} events`);
    } catch (error) {
      console.error('Error loading events:', error);
      this.events = [];
    }
  }

  getAllEvents(): EventData[] {
    return [...this.events];
  }

  getEventByClient(clientId: string): EventData[] {
    return this.events
      .filter((event) => event.client_id === clientId)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
  }

  getEventByStore(storeId: string): EventData[] {
    return this.events
      .filter((event) => event.store_id === storeId)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
  }

  getEventByClientAndStore(clientId: string, storeId: string): EventData[] {
    return this.events
      .filter(
        (event) => event.client_id === clientId && event.store_id === storeId,
      )
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
  }
}
