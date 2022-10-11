export interface MeasureParams {
    device: string,
    resolution : string,
    startDate: string,
    endDate: string,
}

export interface Device {
    id_dispositivo: string,
}

export interface accumulatedData {
    data: string,
    accumulatedenergy: string,
    id_dispositivo: string,
}

export interface SelectOptions {
    label: string,
    disabled?: boolean,
    value: string,
}
export interface TotalBadge {
    consumoTotal: string,
    valorTotal : string,
}
export interface inputField {
    label: string,
    options: Array<SelectOptions>,
    multiple?: boolean,
    value: Array<string> | string
  }