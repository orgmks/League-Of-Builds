import { Component, computed, inject, input, signal } from '@angular/core';
import { ChampionsService } from '../../core/services/champions.service';

@Component({
  selector: 'app-champion-avatar',
  template: `
    @if (!failed()) {
      <img
        [src]="url()"
        [alt]="name()"
        [style.width.px]="size()"
        [style.height.px]="size()"
        loading="lazy"
        (error)="failed.set(true)"
      />
    } @else {
      <span
        class="fallback"
        [style.width.px]="size()"
        [style.height.px]="size()"
        [style.font-size.px]="size() * 0.45"
        >{{ name().charAt(0) }}</span
      >
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
    }
    img,
    .fallback {
      border-radius: 50%;
      border: 2px solid var(--gold);
      object-fit: cover;
      background: #17223a;
    }
    .fallback {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: 'Cinzel', serif;
      color: var(--gold);
    }
  `,
})
export class ChampionAvatar {
  private readonly champions = inject(ChampionsService);

  readonly imageKey = input.required<string>();
  readonly name = input.required<string>();
  readonly size = input(48);

  protected readonly failed = signal(false);
  protected readonly url = computed(() => this.champions.imageUrl(this.imageKey()));
}
