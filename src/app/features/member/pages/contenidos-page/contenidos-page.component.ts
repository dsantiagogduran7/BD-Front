import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ContenidosApiService } from '../../../../core/services/api/contenidos-api.service';
import { ContenidoDto } from '../../../../models/dto/contenido.dto';

@Component({
  selector: 'app-contenidos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contenidos-page.component.html',
  styleUrl: './contenidos-page.component.css'
})
export class ContenidosPageComponent implements OnInit {

  private sanitizer = inject(DomSanitizer);

  contenidos: ContenidoDto[] = [];
  cargando = true;
  error = '';
  busqueda = '';
  filtroTipo = '';

  contenidoAbierto: ContenidoDto | null = null;
  embedUrl: SafeResourceUrl | null = null;

  readonly tipos = [
    { valor: '',           label: 'Todos' },
    { valor: 'video',      label: 'Videos' },
    { valor: 'articulo',   label: 'Artículos' },
    { valor: 'guia',       label: 'Guías' },
    { valor: 'tutorial',   label: 'Tutoriales' },
    { valor: 'podcast',    label: 'Podcasts' },
    { valor: 'infografia', label: 'Infografías' }
  ];

  constructor(private contenidosApi: ContenidosApiService) {}

  ngOnInit(): void {
    this.contenidosApi.listarTodos().subscribe({
      next: (data: any[]) => {
        this.contenidos = data.map(c => ({
          id_contenido:      c.id_contenido,
          titulo:            c.titulo,
          descripcion:       c.descripcion,
          tipo_contenido:    c.tipo_contenido,
          duracion:          c.duracion,
          autor:             c.autor ?? '',
          url_del_recurso:   c.url_del_recurso ?? '',
          fecha_publicacion: this.normalizarFecha(c.fecha_publicacion),
          id_deporte:        c.deporte?.id_deporte ?? 0,
          deporte_nombre:    c.deporte?.nombre ?? ''
        }));
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los contenidos. Verifica tu conexión.';
        this.cargando = false;
      }
    });
  }

  get contenidosFiltrados(): ContenidoDto[] {
    return this.contenidos.filter(c => {
      const txt = `${c.titulo} ${c.autor} ${c.deporte_nombre}`.toLowerCase();
      const ok1 = !this.busqueda   || txt.includes(this.busqueda.toLowerCase());
      const ok2 = !this.filtroTipo || c.tipo_contenido === this.filtroTipo;
      return ok1 && ok2;
    });
  }

  abrirContenido(c: ContenidoDto): void {
    this.contenidoAbierto = c;
    this.embedUrl = c.url_del_recurso ? this.buildEmbedUrl(c.url_del_recurso) : null;
  }

  cerrar(): void {
    this.contenidoAbierto = null;
    this.embedUrl = null;
  }

  private buildEmbedUrl(url: string): SafeResourceUrl | null {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`
      );
    }
    return null;
  }

  labelTipo(tipo: string): string {
    const map: Record<string, string> = {
      video: 'Video', articulo: 'Artículo', guia: 'Guía',
      tutorial: 'Tutorial', podcast: 'Podcast', infografia: 'Infografía'
    };
    return map[tipo] ?? tipo;
  }

  formatFecha(f: any): string {
    if (!f) return '';
    try {
      const d = new Date(f + 'T00:00:00');
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  }

  private normalizarFecha(f: any): string {
    if (!f) return '';
    if (Array.isArray(f)) {
      const [y, m, d] = f;
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    return String(f);
  }
}
