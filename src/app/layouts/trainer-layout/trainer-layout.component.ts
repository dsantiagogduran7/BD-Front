import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';

import { TrainerSidebarComponent } from './trainer-sidebar/trainer-sidebar.component';

import { TrainerNavbarComponent } from './trainer-navbar/trainer-navbar.component';
@Component({
  selector: 'app-trainer-layout',

  standalone: true,

  imports: [
    RouterOutlet,
    TrainerSidebarComponent,
    TrainerNavbarComponent
  ],

  templateUrl: './trainer-layout.component.html',

  styleUrl: './trainer-layout.component.css'
})

export class TrainerLayoutComponent {

}
