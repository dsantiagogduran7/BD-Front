import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-operator-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './operator-sidebar.component.html', // Corregido a 'e'
  styleUrl: './operator-sidebar.component.css'    // Corregido a 'e'
})
export class OperadorSidebarComponent { }
