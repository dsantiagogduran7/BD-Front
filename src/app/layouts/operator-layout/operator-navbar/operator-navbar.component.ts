import { Component } from '@angular/core';

@Component({
  selector: 'app-operator-navbar',
  standalone: true,
  imports: [],
  templateUrl: './operator-navbar.component.html',
  styleUrl: './operator-navbar.component.css'
})
export class OperadorNavbarComponent {
  // Añadimos la variable que pide el HTML
  nombreOperador: string = 'David Santiago Gomez';
}
