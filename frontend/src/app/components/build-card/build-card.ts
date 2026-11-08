import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Build } from '../../core/models';
import { ChampionAvatar } from '../champion-avatar/champion-avatar';

@Component({
  selector: 'app-build-card',
  imports: [MatCardModule, MatChipsModule, MatIconModule, MatButtonModule, RouterLink, ChampionAvatar],
  templateUrl: './build-card.html',
  styleUrl: './build-card.scss',
})
export class BuildCard {
  readonly build = input.required<Build>();
  readonly favoriteToggled = output<Build>();

  protected readonly niveles = [1, 2, 3, 4, 5];
}
