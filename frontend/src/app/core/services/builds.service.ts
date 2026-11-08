import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Build, BuildFilters, BuildPayload } from '../models';

@Injectable({ providedIn: 'root' })
export class BuildsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/builds`;

  listResource(filters: () => BuildFilters) {
    return httpResource<Build[]>(
      () => {
        const f = filters();
        const params: Record<string, string | boolean | number> = {};
        if (f.search.trim()) params['search'] = f.search.trim();
        if (f.role) params['role'] = f.role;
        if (f.championId) params['champion_id'] = f.championId;
        if (f.scope === 'mine') params['mine'] = true;
        if (f.scope === 'favorites') params['only_favorites'] = true;
        return { url: this.url, params };
      },
      { defaultValue: [] },
    );
  }

  /** Detalle de una build; si el id no es válido no se hace la petición. */
  detailResource(id: () => number | undefined) {
    return httpResource<Build>(() => {
      const value = id();
      return value ? `${this.url}/${value}` : undefined;
    });
  }

  create(data: BuildPayload): Observable<Build> {
    return this.http.post<Build>(this.url, data);
  }

  update(id: number, data: BuildPayload): Observable<Build> {
    return this.http.put<Build>(`${this.url}/${id}`, data);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  setFavorite(id: number, value: boolean): Observable<Build> {
    const endpoint = `${this.url}/${id}/favorite`;
    return value ? this.http.post<Build>(endpoint, {}) : this.http.delete<Build>(endpoint);
  }
}
