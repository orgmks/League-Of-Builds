import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Stats } from '../models';

@Injectable({ providedIn: 'root' })
export class StatsService {
  resource() {
    return httpResource<Stats>(() => `${environment.apiUrl}/stats`);
  }
}
