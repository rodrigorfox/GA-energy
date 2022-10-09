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
  selectedDevice!: Array<string>;
  subscription!: Subscription;
  measurements: Array<any> = []
  highcharts = Highcharts;
  chartOptions: Highcharts.Options = {   
    chart: {
       type: "line"
    },
    title: {
       text: "Consumo"
    },
    subtitle: {
      //  text: "Source: WorldClimate.com"
    },
    xAxis:{
       categories:["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
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

  getEnergyData() {
    this.loading = true
    const paramsconfig = {
      device: 'mymeter-uid-5132&mymeter-02-uid&mymeter-uid-5132',
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

  selectDevice() {
    console.log(this.selectedDevice)
  }
}
