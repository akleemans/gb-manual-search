import {Component, OnInit} from '@angular/core';
import {DATA} from './ocr_cleanup';
import {debounceTime, filter, Subject} from "rxjs";

class Result {
  public occurrences: string[] = [];

  public constructor(public gameName: string) {
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public query: string = '';
  public resultUpdate$ = new Subject<string>();
  private data: { [key: string]: string } = DATA;

  public results: Result[] = [];

  public ngOnInit(): void {
    this.resultUpdate$.pipe(
      filter(value => value.length >= 3),
      debounceTime(500)
    ).subscribe(query =>
      this.triggerResultUpdate(query)
    );

    this.query = 'princess ' + this.getRandomPrincess();
    this.triggerResultUpdate(this.query);
  }

  public getRandomPrincess(): string {
    const names = ['leia', 'zelda', 'tina', 'mato', 'angelica', 'daphne',
      'ling-ling', 'dot', 'jasmine', 'toadstool', 'elaine'];
    return names[Math.floor(Math.random() * names.length)];
  }

  public queryUpdate(query: string): void {
    this.resultUpdate$.next(query);
  }

  private triggerResultUpdate(query: string): void {
    query = query.toLowerCase();
    console.log('triggerResultUpdate:', query);
    const results = [];
    for (const [gameName, entry] of Object.entries(this.data)) {
      const result = new Result(gameName);
      result.occurrences = []
      let lastIdx = 0;
      for (let i = 0; i < 10; i++) {
        const idx = entry.indexOf(query, lastIdx);
        if (idx !== -1) {
          let occurrence = entry.slice(Math.max(idx - 50, 0), Math.min(idx + 50, entry.length - 1));
          const occIdx = occurrence.indexOf(query);
          occurrence = occurrence.substring(0, occIdx) + ' [ ' + query + ' ] ' + occurrence.substring(occIdx + query.length, occurrence.length);
          result.occurrences.push(occurrence)
          lastIdx = idx + 1;
        } else {
          break;
        }
      }

      if (result.occurrences.length > 0) {
        results.push(result);
      }
    }
    this.results = results.sort((a, b) =>
      b.occurrences.length - a.occurrences.length);
  }
}
