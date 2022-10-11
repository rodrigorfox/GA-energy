import { Component, OnDestroy, OnInit } from '@angular/core';
import { finalize, Subscription, tap } from 'rxjs';
import { AppService } from 'src/app/services/app.service';
import * as moment from 'moment';
import * as Highcharts from 'highcharts';
import { accumulatedData, Device, inputField, SelectOptions, TotalBadge } from 'src/app';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  loading: boolean = false
  meter: inputField = {
    label: 'Medidor',
    options: [],
    multiple: false,
    value: ''
  }
  aggregator: inputField = {
    label: 'Agregação',
    options: [
      {
        label: 'Diária',
        value: 'day',
      },
      {
        label: 'Hora',
        value: 'hour',
      },
      {
        label: 'Nenhuma',
        value: 'raw',
      },
    ],
    value: 'day'
  }
  subscriptions: Subscription[] = []
  measurements: Array<accumulatedData> = []
  highcharts = Highcharts
  initials: string = 'kWh'
  totalBadge: TotalBadge = {} as TotalBadge
  chartOptions: Highcharts.Options = {
    chart: {
       type: 'column'
    },
    title: {
       text: "Consumo"
    },
    colors: ['#2c9932', '#FC0D1B','#2f7ed8', '#0d233a', '#8bbc21', '#910000', '#1aadce',
        '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'],
    xAxis:{
       categories: []
    },
    yAxis: {          
       title:{
          text: `Consumo (${this.initials})`
       } 
    },
    tooltip: {
       valueSuffix: ` ${this.initials}`
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

  getDevices(): void {
    this.loading = true
    const url = 'api/devices'
    const subscription = this.appService.doGet(url).pipe(
      tap((response) => {
        const arr = response.map((x: Device) => x.id_dispositivo)
        this.meter.options = this.generateOptionsByString(arr)
      }),
      tap(() => {
        if (!this.meter.options.length) return
        this.meter.value = this.meter.options[0].value
        this.getEnergyData(this.meter.value)
      }),
      finalize(() => this.loading = false)
    ).subscribe()
    this.subscriptions.push(subscription)
  }

  getEnergyData(device: string): void {
    this.loading = true
    const paramsconfig = {
      device: device,
      resolution : !Array.isArray(this.aggregator.value) ? this.aggregator.value : 'day',
      startDate: moment('2022-06-01 00:15:00+00').utc().format(),
      endDate: moment('2022-09-26 01:45:00+00').utc().format(),
    }
    const subscription = this.appService.getEnergyData(paramsconfig).pipe(
      tap((response: Array<accumulatedData>) => {
        this.measurements = response
        this.setSeries(response)
      }),
      finalize(() => {
        this.loading = false
        this.totalBadge = this.getTotalValue(this.meter.multiple ? undefined : this.chartOptions.series)
      })
    ).subscribe()
    this.subscriptions.push(subscription)
  }

  generateOptionsByString(arr: Array<string>): Array<SelectOptions> {
    const options = arr.map((element: string) => {
      return { label: element.split('-').join(' '), value: element, disabled: false }
    })
    return options
  }

  generateGraphic(): void {
    if (!this.meter.value || !this.meter.value.length) return
    let devices = ''
    if (Array.isArray(this.meter.value))
    this.meter.value.forEach((device: string) => {
      devices = devices ? `${devices}&${device}` : device
    });
    this.getEnergyData(typeof(this.meter.value) === 'string' ? this.meter.value : devices)
  }

  selectChart(compare: boolean): void {
    this.meter.multiple = compare
    this.fillChartOptions(compare ? 'line' : 'column')
  }

  fillChartOptions(type: string): void {
    if (this.chartOptions.chart)
    this.chartOptions.chart.type = type
  }

  setCategories(): void {
    if (this.chartOptions.xAxis && !Array.isArray(this.chartOptions.xAxis)) {
      this.chartOptions.xAxis.categories = []
      for (let i = 1; i<=30; i++)
        this.chartOptions.xAxis.categories.push(i.toString())
    }
  }

  setSeries(response: Array<accumulatedData>): void {
    let energy: any = {}
    response.forEach((x: accumulatedData) => {
      if (!energy.hasOwnProperty(x.id_dispositivo)) energy[x.id_dispositivo]  = []
        energy[x.id_dispositivo]?.push(parseInt(x.accumulatedenergy)/ 1000)
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

  getTotalValue(series: Array<any> | undefined): TotalBadge {
    if (!series) return {} as TotalBadge
    let totalEnergy = 0
    series.forEach((key) => {
      key.data.forEach((count: number) => totalEnergy += count)
    })
    return {
      consumoTotal: `${totalEnergy.toLocaleString('pt-BR', { style: 'decimal' })} ${this.initials}`,
      valorTotal : (totalEnergy * 0.98).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }
  }
}
