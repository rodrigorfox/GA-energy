import { Component, OnDestroy, OnInit } from '@angular/core';
import { finalize, Subscription, tap } from 'rxjs';
import { AppService } from 'src/app/services/app.service';
import * as moment from 'moment';
import * as Highcharts from 'highcharts';
import { accumulatedData, Device, SelectOptions } from 'src/app';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  meterLabel: string = 'Medidor'
  meterOptions: Array<SelectOptions> = []
  meterMultiple: boolean = false;
  selectedDevice!: Array<string> | string;
  subscriptions!: Subscription[];
  measurements: Array<any> = []
  highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    chart: {
       type: 'column'
    },
    title: {
       text: "Consumo"
    },
    xAxis:{
       categories: []
    },
    yAxis: {          
       title:{
          text:"Consumo (kWh)"
       } 
    },
    tooltip: {
       valueSuffix:" kWh"
    },
    series: []
  };

  constructor(private appService: AppService) { }
  
  ngOnInit(): void {
    this.getDevices()
    this.setCategories()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe())
  }

  getDevices() {
    this.loading = true
    const url = 'api/devices'
    const subscription = this.appService.doGet(url).pipe(
      tap((response) => {
        const arr = response.map((x: Device) => x.id_dispositivo)
        this.meterOptions = this.generateOptionsByString(arr)
      }),
      tap(() => {
        if (!this.meterOptions.length) return
        this.selectedDevice = this.meterOptions[0].value
        this.getEnergyData(this.selectedDevice)
      }),
      finalize(() => this.loading = false)
    ).subscribe()
    this.subscriptions.push(subscription)
  }

  getEnergyData(device: string) {
    this.loading = true
    const paramsconfig = {
      device: device,
      resolution : 'day',
      startDate: moment('2022-06-01 00:15:00+00').utc().format(),
      endDate: moment('2022-09-26 01:45:00+00').utc().format(),
    }
    const subscription = this.appService.getEnergyData(paramsconfig).pipe(
      tap((response: Array<accumulatedData>) => {
        this.measurements = response
        this.setSeries(response)
      }),
      finalize(() => this.loading = false)
    ).subscribe()
    this.subscriptions.push(subscription)
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
    this.fillChartOptions(compare ? 'line' : 'column')
  }

  fillChartOptions(type: string) {
    if (this.chartOptions.chart)
    this.chartOptions.chart.type = type
  }

  setCategories() {
    if (this.chartOptions.xAxis && !Array.isArray(this.chartOptions.xAxis)) {
      this.chartOptions.xAxis.categories = []
      for (let i = 1; i<=30; i++)
        this.chartOptions.xAxis.categories.push(i.toString())
    }
  }

  setSeries(response: Array<accumulatedData>) {
    let energy: any = {}
    response.forEach((x: accumulatedData) => {
      if (!energy.hasOwnProperty(x.id_dispositivo)) energy[x.id_dispositivo]  = []
        energy[x.id_dispositivo]?.push(parseInt(x.accumulatedenergy))
    })

    if (Array.isArray(this.chartOptions.series)) {
      this.chartOptions.series = []
      Object.keys(energy).forEach((key) => {
        this.chartOptions.series?.push({
          name: key,
          type: this.chartOptions.chart?.type,
          data: energy[key]
       } as Highcharts.SeriesOptionsType)
      })
    }
  }
}
