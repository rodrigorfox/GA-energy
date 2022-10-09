import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MeasureParams } from '..';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  envAPI = environment.api;
  constructor(private http: HttpClient) { }

  doGet(url: string, queryString: string = ''): Observable<any> {
    return this.http.get(`${this.envAPI}/${url}?${queryString}`);
  }

  getEnergyData(params: MeasureParams): Observable<any> {
    return this.http.get(
      `${this.envAPI}/api/device/${params.device}/measurements?${params.resolution ? ('resolution='+ params.resolution) : ''}&startDate=${params.startDate}&endDate=${params.endDate}`
    );
  }
}
