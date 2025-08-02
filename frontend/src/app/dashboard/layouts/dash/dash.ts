import { Component } from '@angular/core';
import { SidebarComponent } from '../../ui/sidebar/sidebar.component';
import { TopbarComponent } from '../../ui/topbar/topbar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dash',
  imports: [SidebarComponent, TopbarComponent, RouterOutlet],
  templateUrl: './dash.html',
  styleUrl: './dash.scss',
})
export class Dash {}
