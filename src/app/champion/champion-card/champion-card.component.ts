// import { Component } from '@angular/core';
// import { arhi } from '../../../data/exportMock';
// import { CommonModule } from '@angular/common';
// import { ChartConfiguration, ChartType } from 'chart.js';
// import { BaseChartDirective } from 'ng2-charts';
// import { ChampionService } from '../../../data/champion.service';
// import { HttpClientModule } from '@angular/common/http';

// interface Champion {
//   id: string;
//   name: string;
//   iconUrl: string;
// }
// @Component({
//   selector: 'app-champion-card',

//   imports: [CommonModule, BaseChartDirective, HttpClientModule],
//   providers: [ChampionService],
//   templateUrl: './champion-card.component.html',
//   styleUrl: './champion-card.component.css',
// })
// export class ChampionCardComponent {
//   championData = arhi.data.Ahri;
//   championList: Champion[] = [];

//   radarChartLabels: string[] = [];

//   radarChartData: ChartConfiguration<'radar'>['data'] = {
//     labels: [],
//     datasets: [],
//   };
//   radarChartOptions: ChartConfiguration<'radar'>['options'] = {
//     responsive: true,
//     elements: {
//       line: { borderWidth: 2 },
//     },
//     scales: {
//       r: {
//         beginAtZero: true,
//         ticks: { stepSize: 20 },
//       // }
//     },
//   };
//   constructor(private championService: ChampionService) {}
//   ngOnInit(): void {
//     this.championService.getChampionList().subscribe((data) => {
//       this.championList = Object.values(data.data).map((champ: any) => ({
//         id: champ.id,
//         name: champ.name,
//         iconUrl: `https://ddragon.leagueoflegends.com/cdn/${this.championService['version']}/img/champion/${champ.image.full}`,
//       }));
//     });

//     this.radarChartLabels = [
//       'HP',
//       'Mana',
//       'AD',
//       'Armor',
//       'MR',
//       'AS',
//       'Move Speed',
//     ];
//   }
//   selectedChampions: string[] = [];
//   onChampSelect(event: Event): void {
//     const checkbox = event.target as HTMLInputElement;
//     const champId = checkbox.value;
//     if (checkbox.checked) {
//       this.selectedChampions.push(champId);
//     } else {
//       this.selectedChampions = this.selectedChampions.filter(
//         (id) => id !== champId
//       );
//     }
//     this.updateChart();
//   }
//   updateChart(): void {
//     this.radarChartData.datasets = [];
//     this.selectedChampions.forEach((champId) => {
//       this.championService.getChampionData(champId).subscribe((data) => {
//         const champ = data.data[champId];
//         const stats = champ.stats;
//         const values = [
//           stats.hp,
//           stats.mp,
//           stats.attackdamage,
//           stats.armor,
//           stats.spellblock,
//           stats.attackspeed * 100,
//           stats.movespeed,
//         ];
//         this.radarChartData.labels = this.radarChartLabels;
//         this.radarChartData.datasets.push({
//           data: values,
//           label: champ.name,
//           backgroundColor: 'rgba(66,165,245,0.4)',
//           borderColor: '#42A5F5',
//           pointBackgroundColor: '#1E88E5',
//         });
//       });
//     });
//   }
// }
