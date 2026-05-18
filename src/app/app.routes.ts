import { Routes } from '@angular/router';
import { memberMembresiaGuard } from './core/guards/member-membresia.guard';

// LAYOUTS
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { TrainerLayoutComponent } from './layouts/trainer-layout/trainer-layout.component';
import { MemberLayoutComponent } from './layouts/member-layout/member-layout.component';
import { OperadorLayoutComponent } from './layouts/operator-layout/operator-layout.component';

// AUTH
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';

// ADMIN PAGES
import { AdminHomeComponent } from './features/admin/pages/admin-home/admin-home.component';
import { MiembrosPageComponent } from './features/admin/pages/miembros-page/miembros-page.component';
import { EntrenadoresPageComponent } from './features/admin/pages/entrenadores-page/entrenadores-page.component';
import { ClasesPageComponent } from './features/admin/pages/clases-page/clases-page.component';
import { MaquinasPageComponent } from './features/admin/pages/maquinas-page/maquinas-page.component';
import { PagosPageComponent } from './features/admin/pages/pagos-page/pagos-page.component';
import { ReportesPageComponent } from './features/admin/pages/reportes-page/reportes-page.component';
import { ContenidosPageComponent } from './features/admin/pages/contenidos-page/contenidos-page.component';
import { OperadoresPageComponent } from './features/admin/pages/operadores-page/operadores-page.component';
import { DeportesPageComponent } from './features/admin/pages/deportes-page/deportes-page.component';
import { AdminPerfilPageComponent } from './features/admin/pages/perfil-page/perfil-page.component';
import { AdminsPageComponent } from './features/admin/pages/admins-page/admins-page.component';

// TRAINER PAGES
import { MisAlumnosPageComponent } from './features/trainer/pages/mis-alumnos-page/mis-alumnos-page.component';
import { PlanesPageComponent } from './features/trainer/pages/planes-page/planes-page.component';
import { TrainerClasesPageComponent } from './features/trainer/pages/clases-page/clases-page.component';
import { TrainerPerfilPageComponent } from './features/trainer/pages/perfil-page/perfil-page.component';

// MEMBER PAGES
import { ClasesPageComponent as MemberClasesPage } from './features/member/pages/clases-page/clases-page.component';
import { ContenidosPageComponent as MemberContenidosPage } from './features/member/pages/contenidos-page/contenidos-page.component';
import { EntrenadoresPageComponent as MemberEntrenadoresPage } from './features/member/pages/entrenadores-page/entrenadores-page.component';
import { MembresiasPageComponent } from './features/member/pages/membresias-page/membresias-page.component';
import { MisEntrenadoresPageComponent } from './features/member/pages/mis-entrenadores-page/mis-entrenadores-page.component';
import { PagosPageComponent as MemberPagosPage } from './features/member/pages/pagos-page/pagos-page.component';
import { PerfilPageComponent } from './features/member/pages/perfil-page/perfil-page.component';

// OPERADOR PAGES
import { OperadorHomePageComponent } from './features/operador/pages/operador-home-page/operador-home-page.component';
import { MaquinasPageComponent as OperadorMaquinasPageComponent } from './features/operador/pages/maquinas-page/maquinas-page.component';
import { PerfilPageComponent as OperadorPerfilPageComponent } from './features/operador/pages/perfil-page/perfil-page.component';

export const routes: Routes = [

  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // =========================
  // ADMIN
  // =========================
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' }, // ← AGREGADO
      { path: 'home',         component: AdminHomeComponent },
      { path: 'miembros',     component: MiembrosPageComponent },
      { path: 'entrenadores', component: EntrenadoresPageComponent },
      { path: 'clases',       component: ClasesPageComponent },
      { path: 'maquinas',     component: MaquinasPageComponent },
      { path: 'pagos',        component: PagosPageComponent },
      { path: 'reportes',     component: ReportesPageComponent },
      { path: 'contenidos',   component: ContenidosPageComponent },
      { path: 'operadores',   component: OperadoresPageComponent },
      { path: 'deportes',     component: DeportesPageComponent },
      { path: 'perfil',       component: AdminPerfilPageComponent },
      { path: 'admins',       component: AdminsPageComponent },
    ]
  },

  // =========================
  // TRAINER
  // =========================
  {
    path: 'trainer',
    component: TrainerLayoutComponent,
    children: [
      { path: '', redirectTo: 'mis-alumnos', pathMatch: 'full' }, // ← AGREGADO
      { path: 'mis-alumnos', component: MisAlumnosPageComponent },
      { path: 'planes',      component: PlanesPageComponent },
      { path: 'clases',      component: TrainerClasesPageComponent },
      { path: 'perfil',      component: TrainerPerfilPageComponent },
    ]
  },

  // =========================
  // MEMBER
  // =========================
  {
    path: 'member',
    component: MemberLayoutComponent,
    children: [
      { path: '', redirectTo: 'clases', pathMatch: 'full' },
      { path: 'clases',           component: MemberClasesPage,           canActivate: [memberMembresiaGuard] },
      { path: 'contenidos',       component: MemberContenidosPage,       canActivate: [memberMembresiaGuard] },
      { path: 'entrenadores',     component: MemberEntrenadoresPage,     canActivate: [memberMembresiaGuard] },
      { path: 'mis-entrenadores', component: MisEntrenadoresPageComponent, canActivate: [memberMembresiaGuard] },
      { path: 'membresias',       component: MembresiasPageComponent },
      { path: 'pagos',            component: MemberPagosPage },
      { path: 'perfil',           component: PerfilPageComponent },
    ]
  },

  // =========================
  // OPERADOR
  // =========================
  {
    path: 'operator',
    component: OperadorLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' }, // ← AGREGADO
      { path: 'home',     component: OperadorHomePageComponent },
      { path: 'maquinas', component: OperadorMaquinasPageComponent },
      { path: 'perfil',   component: OperadorPerfilPageComponent },
    ]
  },

  // =========================
  // DEFAULT
  // =========================
  { path: '',  redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }, // ← AGREGADO
];
