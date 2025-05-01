import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChampionComparisonComponent } from './app/champion/champion-card/champion-comparison.component';
// import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-root',
  imports: [ChampionComparisonComponent],
  template: `<app-champion-comparison></app-champion-comparison>`,
})
export class App {
  name = 'Angular';
}

bootstrapApplication(App, {
  providers: [provideCharts(withDefaultRegisterables())],
}).catch((err) => console.error(err));
