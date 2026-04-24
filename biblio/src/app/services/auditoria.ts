import { Injectable, computed, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

export interface RegistroAuditoria {
  _id: string;
  accion: string;
  nombreUsuario: string;
  usuario?: { nombre: string; email: string; rol: string };
  entidad: string;
  entidadId?: string;
  detalle?: string;
  ip?: string;
  createdAt: string;
}

export interface AuditoriaResponse {
  ok: boolean;
  registros: RegistroAuditoria[];
  pagination: { total: number; page: number; totalPages: number; hasMore: boolean };
}

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private apiUrl = `${environment.apiUrl}/auditoria`;

  auditoriaResource = httpResource(() => ({
    url: `${this.apiUrl}?limit=15`,
    withCredentials: true,
  }), {
    parse: (resp: any) => resp as AuditoriaResponse
  });

  public registros = computed(() => this.auditoriaResource.value()?.registros ?? []);
  public loading = computed(() => this.auditoriaResource.isLoading());
  public total = computed(() => this.auditoriaResource.value()?.pagination?.total ?? 0);

  recargar() {
    this.auditoriaResource.reload();
  }
}
