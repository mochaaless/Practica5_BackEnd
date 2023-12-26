import mongoose, {Schema, InferSchemaType} from "mongoose";
import { ViajeModel, ViajeModelType } from "./viaje.ts";
import { ClienteModel } from "./cliente.ts";

const ConductorSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    username: {type: String, required: true, unique: true},
    travels: [{type: Schema.Types.ObjectId, ref: "Viaje", required: false, default:[]}]
})


ConductorSchema.path("name").validate(function (name:string) {
    if(name.length > 0 && name.length < 100){
        return true;
    }
    throw new Error('El nombre no puede ser vacio o muy largo');
})

//Validate email
ConductorSchema.path("email").validate(function(valor: string) {
    if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)){
        return true;
    }
    throw new Error('El mail es incorrecto, ejmplo mail correcto: algo@algo.com');
})

ConductorSchema.path("travels").validate(function (travels: Array<ViajeModelType>) {
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

ConductorSchema.post("findOneAndDelete", async function(conductor: ConductorModelType){
    if(conductor){
        await ViajeModel.deleteMany({driver: conductor._id}); //Elimino sus viajes
        await ClienteModel.updateMany({travels: conductor._id}, {$pull: {travels: conductor._id}}); //Elimino sus viajes de los clientes
    }
})

export type ConductorModelType = mongoose.Document & InferSchemaType<typeof ConductorSchema>;

export const ConductorModel = mongoose.model<ConductorModelType>("Conductor", ConductorSchema);