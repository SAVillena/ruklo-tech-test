export class Benefit {
  id: string;
  client_id: string;
  store_id: string;
  type: string;
  description: string;
  awarded_at: Date;
  qualifying_events: string[];

  constructor(partial: Partial<Benefit>) {
    Object.assign(this, partial);
  }
}
