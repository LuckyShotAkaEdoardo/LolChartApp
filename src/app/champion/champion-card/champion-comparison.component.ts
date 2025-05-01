import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { ChartData, ChartOptions } from 'chart.js';

import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { HttpClientModule } from '@angular/common/http';
import { ChampionData, ChampionService } from '../../../data/champion.service';
import { of } from 'rxjs';
import { Chart } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
@Component({
  selector: 'app-champion-comparison',
  imports: [CommonModule, BaseChartDirective, HttpClientModule],
  providers: [ChampionService],
  templateUrl: './champion-card.component.html',
  styleUrl: './champion-card.component.css',
})
export class ChampionComparisonComponent implements OnInit {
  champions$: Observable<ChampionData[]>;
  championsTotal: Observable<ChampionData[]>;
  private selectedIds$ = new BehaviorSubject<string[]>([]);
  private selectedStats$ = new BehaviorSubject<string[]>([]); // <-- nuova selezione dinamica

  chartData$: Observable<ChartData<'radar'>>;
  statKeys$: Observable<string[]>; // tutte le possibili stat
  tags$!: Observable<string[]>;

  chartOptions: ChartOptions<'radar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'white', // Colore dei nomi dei campioni nella legenda
        },
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true, // Zoom con la rotella del mouse
          },
          pinch: {
            enabled: true, // Zoom su dispositivi touch
          },
          mode: 'xy', // o solo 'x' o 'y' se preferisci
        },
        pan: {
          enabled: true,
          mode: 'xy',
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: { color: 'white' },
        pointLabels: {
          color: 'white', // Etichette delle statistiche (attacco, difesa, ecc.)
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)', // Linee griglia (opzionale)
        },
        angleLines: {
          color: 'rgba(255, 255, 255, 0.2)', // Linee radiali (opzionale)
        },
      },
    },
  };

  constructor(private champSvc: ChampionService) {
    Chart.register(zoomPlugin);
    this.champSvc.getCurrentPatch().subscribe((patch) => {
      // Ora puoi usarla per fare fetch dei dati campioni con la patch corretta

      this.champions$ = this.champSvc.getAllChampions(patch);
      this.championsTotal = this.champions$;
      // this.champions$ = this.champSvc.getAllChampions();

      // Estrai dinamicamente le statistiche disponibili
      this.statKeys$ = this.champions$.pipe(
        map((champions) => {
          const first = champions[0];
          return first ? Object.keys(first.stats) : [];
        })
      );
      this.statKeys$.subscribe((all) => this.selectedStats$.next(all));
      this.tags$ = this.champSvc.getAllTags();
      // Grafico reattivo: cambia quando cambiano selezioni o stats
      this.chartData$ = combineLatest([
        this.championsTotal,
        this.selectedIds$,
        this.selectedStats$,
      ]).pipe(
        map(([all, selectedIds, statKeys]) => {
          const datasets = all
            .filter((c) => selectedIds.includes(c.id))
            .map((c: any) => ({
              label: c.name,
              data: statKeys.map((stat) =>
                stat === 'attackspeed' ? c.stats[stat] * 100 : c.stats[stat]
              ),
              fill: true,
              // backgroundColor: this.color[index],
              // borderColor: this.color[index],
              // pointBackgroundColor: this.color[index],
            }));

          return {
            labels: statKeys,
            datasets,
          };
        })
      );
    });
  }

  ngOnInit(): void {
    // Imposta stat default quando
    const input = document.getElementById('searchInput') as HTMLInputElement;

    input.addEventListener('input', () => {
      const searchTerm = input.value.toLowerCase();
      console.log(searchTerm);
      this.search(searchTerm);
    });
  }

  toggleChampion(id: string, checked: boolean) {
    const current = this.selectedIds$.value;
    const next = checked ? [...current, id] : current.filter((x) => x !== id);
    this.selectedIds$.next(next);
  }

  toggleStat(stat: string, checked: boolean) {
    const current = this.selectedStats$.value;
    const next = checked
      ? [...current, stat]
      : current.filter((x) => x !== stat);
    this.selectedStats$.next(next);
  }

  isStatSelected(stat: string): boolean {
    return this.selectedStats$.value.includes(stat);
  }

  isChampionSelected(id: string): boolean {
    return this.selectedIds$.value.includes(id);
  }
  selectAllStats(select: boolean) {
    this.statKeys$.subscribe((statKeys) => {
      const keys = select ? statKeys : [];
      this.selectedStats$.next(keys);
    });
  }
  selectAllChamp(select: boolean) {
    this.championsTotal.subscribe((allC: any[]) => {
      let keys: any[] = [];
      if (select) {
        allC.forEach((va: any) => {
          keys = [...keys, va.id];
        });
      }

      this.selectedIds$.next(select ? keys : []);
    });
  }
  search(v: any) {
    this.championsTotal.subscribe((allC: ChampionData[]) => {
      let val = [];
      allC.forEach((va: ChampionData) => {
        if (va.name.toLowerCase().includes(v)) {
          val.push(va);
        }
        this.champions$ = of(val);
      });
    });
  }
  selectedTags = new Set<string>();

  toggleTag(tag: string) {
    if (this.selectedTags.has(tag)) {
      this.selectedTags.delete(tag);
    } else {
      this.selectedTags.add(tag);
    }

    this.updateSelectedChampionsByTags();
  }

  updateSelectedChampionsByTags() {
    this.championsTotal.subscribe((champions) => {
      const matchingIds = champions
        .filter((champ: any) => {
          // Verifica che `tags` esista e sia un array
          return (
            champ.tags && Array.isArray(champ.tags) && champ.tags.length > 0
          );
        })
        .filter((champ) =>
          // Filtro per i tag selezionati
          Array.from(this.selectedTags).some((tag: string) =>
            champ.tags.includes(tag)
          )
        )
        .map((ch) => ch.id);

      this.selectedIds$.next(matchingIds);
    });
  }

  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  resetZoom() {
    console.log(this.charts.get(1)?.chart);
    this.charts.get(1)?.chart?.resetZoom?.();
  }
}
