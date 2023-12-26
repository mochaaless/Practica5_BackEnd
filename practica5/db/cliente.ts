import mongoose, {Schema, InferSchemaType} from "mongoose";
import { ViajeModel, ViajeModelType } from "./viaje.ts";
import { ConductorModel } from "./conductor.ts";

const ClienteSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    cards: [{ 
        number: {type: String, required: true},
        cvv: {type: String, required: true},
        expirity: {type: String, required: true},
        money: {type: Number, required: false, default: 0}, 
    }, {required: false, default: []}],
    travels: [{type: Schema.Types.ObjectId, required: false, ref:"Viaje", default: []}]
})

ClienteSchema.path("name").validate(function (name:string) {
    if(name.length > 0 && name.length < 100){
        return true;
    }
    throw new Error('El nombre no puede ser vacio o muy largo');
})

ClienteSchema.path("email").validate(function(valor: string) {
    if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)){ //formato del un mail
        return true;
    }
    throw new Error('El mail es incorrecto, ejmplo mail correcto: algo@algo.com');
})

ClienteSchema.path("cards.number").validate(function (valor: string) {
    if(/^(\d{4} ){3}\d{4}$|^\d{16}$/.test(valor)){
        return true;
    }
    throw new Error('El numero de tarjeta es incorrecto, ejemplo de numero de tarjeta correcto: 1111 2222 3333 4444 o 1111222233334444');
})


ClienteSchema.path("cards.cvv").validate(function (valor: string) {
    if(/^\d{3}$/.test(valor)){ //permite 3 caracteres
        return true;
    }
    throw new Error('El cvv es incorrecto, ha de tener 3 caracteres');
})

ClienteSchema.path("cards.expirity").validate(function (valor: string) {
    if(/^(0[1-9]|1[0-2])\/(20)\d{2}$/.test(valor)){ //formato caducidad CC
        const mes = parseInt(valor.split("/")[0]);
        const anyo = parseInt(valor.split("/")[1]);
        const fechaActual = new Date();
        const anyoActual = fechaActual.getFullYear();
        const mesActual = fechaActual.getMonth();
        if(anyo > anyoActual || (anyo == anyoActual && mes >= mesActual)){
            return true;
        }
    } 
    throw new Error('La fecha de expiracion es incorrecta, ejemplo de fecha de expiracion correcta: 01/2025, ademas ha de ser posterior a la fecha actual');
})

ClienteSchema.path("cards.money").validate(function (money: number) {
    if(money >= 0){
        return true;
    }
    throw new Error('El dinero no puede ser negativo');
})

ClienteSchema.path("travels").validate(function (travels: Array<ViajeModelType>) {
    let count = 0;
    for(let i = 0; i < travels.length; i++){
        if(travels[i].status != "Realizado"){
            count++;
        }
    }
    if(count > 1){
        throw new Error('No puede tener mas de un viaje activo');
    }
    return true;
})

ClienteSchema.post("findOneAndDelete", async function(cliente: ClienteModelType){
    if(cliente){
        await ViajeModel.deleteMany({client: cliente._id}); //Borramos sus viajes
        await ConductorModel.updateMany({travels: cliente._id}, {$pull: {travels: cliente._id}});
    }
})

export type ClienteModelType = mongoose.Document & InferSchemaType<typeof ClienteSchema>;

export const ClienteModel = mongoose.model<ClienteModelType>("Cliente", ClienteSchema)