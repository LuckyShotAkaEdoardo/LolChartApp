import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface ChampionData {
  id: string;
  name: string;
  image: { full: string };
  stats: {
    hp: number;
    mp: number;
    attackdamage: number;
    armor: number;
    spellblock: number;
    attackspeed: number;
    movespeed: number;
  };
  tags: any[];
}

@Injectable({ providedIn: 'root' })
export class ChampionService {
  private base = 'https://ddragon.leagueoflegends.com/cdn';
  private version = '15.9.1';
  private lang = 'it_IT';

  constructor(private http: HttpClient) {}

  /** Ritorna un array con tutti i campioni e i loro dati (inclusi stats) */
  getAllChampions(version: string): Observable<ChampionData[]> {
    const url = `${this.base}/${version}/data/${this.lang}/champion.json`;
    return this.http.get<any>(url).pipe(
      map((res) =>
        Object.values(res.data).map((c: any) => ({
          id: c.id,
          name: c.name,
          image: c.image,
          stats: c.stats,
          tags: c.tags,
        }))
      )
    );
  }
  getCurrentPatch(): Observable<string> {
    return this.http
      .get<string[]>('https://ddragon.leagueoflegends.com/api/versions.json')
      .pipe(
        map((versions) => versions[0]) // prima voce = patch più recente
      );
  }

  getAllTags(): Observable<string[]> {
    return this.http
      .get<any>(
        'https://ddragon.leagueoflegends.com/cdn/15.9.1/data/en_US/champion.json'
      )
      .pipe(
        map((response) => {
          const champions = Object.values(response.data);
          const allTags = champions.flatMap((champ: any) => champ.tags || []); // Garantiamo che tags sia un array
          return Array.from(new Set(allTags)).sort();
        })
      );
  }
  generaColoriRGBA(limite: number): string[] {
    const colori: string[] = [];

    for (let i = 0; i < limite; i++) {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      const a = parseFloat(Math.random().toFixed(2)); // alpha tra 0.00 e 1.00

      colori.push(`rgba(${r},${g},${b},${a})`);
    }

    return colori;
  }
}
