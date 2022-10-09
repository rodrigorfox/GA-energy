import { Component, OnDestroy, OnInit } from '@angular/core';
import { finalize, Subscription, tap } from 'rxjs';
import { AppService } from 'src/app/services/app.service';
import * as moment from 'moment';
import * as Highcharts from 'highcharts';
import { Device, SelectOptions } from 'src/app';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  meterLabel: string = 'Medidor'
  meterOptions: Array<SelectOptions> = []
  meterMultiple: boolean = true;
  selectedDevice!: Array<string> | string;
  subscription!: Subscription;
  measurements: Array<any> = []
  highcharts = Highcharts;
  chartOptions: Highcharts.Options = {}

  constructor(private appService: AppService) { }
  
  ngOnInit(): void {
    this.getDevices()
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }

  getDevices() {
    this.loading = true
    const url = 'api/devices'
    this.subscription = this.appService.doGet(url).pipe(
      tap((response) => {
        const arr = response.map((x: Device) => x.id_dispositivo)
        this.meterOptions = this.generateOptionsByString(arr)
      }),
      finalize(() => this.loading = false)
    ).subscribe()
  }

  getEnergyData(device: string) {
    this.loading = true
    const paramsconfig = {
      device: device,
      resolution : 'day',
      startDate: moment('2022-06-01 00:15:00+00').utc().format(),
      endDate: moment('2022-09-26 01:45:00+00').utc().format(),
    }
    this.subscription = this.appService.getEnergyData(paramsconfig).pipe(
      tap((response) => {
        this.measurements = response
      }),
      finalize(() => this.loading = false)
    ).subscribe()
  }

  generateOptionsByString(arr: Array<string>): Array<SelectOptions> {
    const options = arr.map((element: string) => {
      return { label: element.split('-').join(' '), value: element, disabled: false }
    })
    return options
  }

  generateGraphic() {
    if (!this.selectedDevice || !this.selectedDevice.length) return
    let devices = ''
    if (Array.isArray(this.selectedDevice))
    this.selectedDevice.forEach((device: string) => {
      devices = devices ? `${devices}&${device}` : device
    });
    this.getEnergyData(typeof(this.selectedDevice) === 'string' ? this.selectedDevice : devices)
  }

  selectChart(compare: boolean) {
    this.meterMultiple = compare
    this.fillCharOptions(compare ? 'line' : 'column')
  }

  fillCharOptions(type: string) {
    const categories = []
    for (let i = 1; i<=30; i++)
      categories.push(i.toString())
    console.log(type, categories)
    this.chartOptions = { ...this.chartOptions,
      chart: {
         type: type
      },
      title: {
         text: "Consumo"
      },
      xAxis:{
         categories: categories
      },
      yAxis: {          
         title:{
            text:"Consumo (kWh)"
         } 
      },
      tooltip: {
         valueSuffix:" kWh"
      },
      series: [
         {
            name: 'Medidor 1',
            type: 'line',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2,26.5, 23.3, 18.3, 13.9, 9.6]
         },
         {
            name: 'Medidor 2',
            type: 'line',
            data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8,24.1, 20.1, 14.1, 8.6, 2.5]
         },
      ]
   };
  }
}
