import { Component, computed } from '@angular/core';
import { AlertService } from './services/alert.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
  imports: [NgClass],
})
export class AlertComponent {
  alerts = computed(() => this.alertSvc.alerts());

  constructor(private alertSvc: AlertService) {}

  close(id: number) {
    this.alertSvc.dismiss(id);
  }
}
