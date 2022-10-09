export interface MeasureParams {
    device: string,
    resolution : string,
    startDate: string,
    endDate: string,
}

export interface Device {
    id_dispositivo: string,
}

export interface SelectOptions {
    label: string,
    disabled : boolean,
    value: string,
}