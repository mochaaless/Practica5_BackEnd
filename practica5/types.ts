export type Tarjeta = {
    number: string,
    cvv: string, 
    expirity: string, 
    money: number 
}

export type Cliente = {
    name: string, 
    email: string, 
    cards: Array<Tarjeta>,
    travels: Array<Viaje> 
}

export type Conductor = {
    name: string, 
    email: string, 
    username: string 
    travels: Array<Viaje> 
}

export enum Status {
    Preparado = "Preparado",
    EnProgreso = "EnProgreso",
    Realizado = "Realizado"
}

export type Viaje = {
    client: Cliente,
    driver: Conductor,
    money: number, 
    distance: number,
    date: Date,
    status: Status 
}