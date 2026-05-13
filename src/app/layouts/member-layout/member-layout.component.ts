import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';

import { MemberSidebarComponent } from './member-sidebar/member-sidebar.component';

import { MemberNavbarComponent } from './member-navbar/member-navbar.component';

@Component({
  selector: 'app-member-layout',

  standalone: true,

  imports: [
    RouterOutlet,
    MemberSidebarComponent,
    MemberNavbarComponent
  ],

  templateUrl: './member-layout.component.html',

  styleUrl: './member-layout.component.css'
})

export class MemberLayoutComponent {

}
