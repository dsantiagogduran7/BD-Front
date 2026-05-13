import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OperadorSidebarComponent } from './operator-sidebar/operator-sidebar.component';
import { OperadorNavbarComponent } from './operator-navbar/operator-navbar.component';

@Component({
  selector: 'app-operator-layout',
  standalone: true,
  imports: [OperadorSidebarComponent, OperadorNavbarComponent, RouterOutlet],
  templateUrl: './operator-layout.component.html',
  styleUrl: './operator-layout.component.css'
})
export class OperadorLayoutComponent { }
