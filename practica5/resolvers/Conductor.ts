import { ConductorModelType } from "../db/conductor.ts";
import { ViajeModel, ViajeModelType } from "../db/viaje.ts";

export const Conductor = {
    travels: async (parent: ConductorModelType): Promise<Array<ViajeModelType>> => {
        return await ViajeModel.find({driver: parent._id}).exec();
    }
};