// src/app/ui/alert.service.ts
import { Injectable, signal } from '@angular/core';

export interface Alert {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // ms (default 3 s)
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private counter = 0;
  alerts = signal<Alert[]>([]);

  show(msg: string, type: Alert['type'] = 'info', duration = 3000) {
    const id = ++this.counter;
    this.alerts.update((arr) => [...arr, { id, message: msg, type, duration }]);

    // auto-close
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: number) {
    this.alerts.update((arr) => arr.filter((a) => a.id !== id));
  }
}
