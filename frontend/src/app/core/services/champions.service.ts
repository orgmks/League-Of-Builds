import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Champion } from '../models';

@Injectable({ providedIn: 'root' })
export class ChampionsService {
  private readonly url = `${environment.apiUrl}/champions`;

  /** Listado reactivo: se vuelve a pedir cada vez que cambian los signals leídos en `query`. */
  listResource(query: () => { search: string; role: string }) {
    return httpResource<Champion[]>(
      () => {
        const { search, role } = query();
        const params: Record<string, string> = {};
        if (search.trim()) params['search'] = search.trim();
        if (role) params['role'] = role;
        return { url: this.url, params };
      },
      { defaultValue: [] },
    );
  }

  imageUrl(key: string): string {
    return `https://ddragon.leagueoflegends.com/cdn/${environment.ddragonVersion}/img/champion/${key}.png`;
  }

  splashUrl(key: string): string {
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${key}_0.jpg`;
  }
}
