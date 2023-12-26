import { ClienteModelType } from "../db/cliente.ts";
import { ViajeModel, ViajeModelType } from "../db/viaje.ts";

export const Cliente = {
    travels: async (parent: ClienteModelType): Promise<Array<ViajeModelType>> => { 
        return await ViajeModel.find({client: parent._id}).exec();
    }
};