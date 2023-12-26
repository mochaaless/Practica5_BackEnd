import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { Query } from "./resolvers/query.ts";
import { Mutation } from "./resolvers/mutation.ts";
import { Cliente } from "./resolvers/Cliente.ts";
import { Conductor } from "./resolvers/Conductor.ts";
import { Viaje } from "./resolvers/Viaje.ts";
import { ClienteModel } from "./db/cliente.ts";
import { ConductorModel } from "./db/conductor.ts";
import { ViajeModel } from "./db/viaje.ts";

import { typeDefs } from "./graphQL/schema.ts";
import mongoose from "mongoose";
import { daily } from "https://deno.land/x/deno_cron@v1.0.0/cron.ts";

import { load } from "https://deno.land/std@0.204.0/dotenv/mod.ts";
const env = await load();

const MONGO_URL = env.MONGO_URL || Deno.env.get("MONGO_URL");

if (!MONGO_URL) {
  throw new Error("Please provide a MongoDB connection string");
}

await mongoose.connect(MONGO_URL);

console.info("🚀 Connected to MongoDB");

const server = new ApolloServer({
    typeDefs,
    resolvers: {
      Query,
      Mutation,
      Cliente,
      Conductor,
      Viaje
    },
});

const checkExpirity = async () => {
  const clientes = await ClienteModel.find();
  const tarjetas = clientes.map(cliente => cliente.cards).flat();
  const fechaActual = new Date();
  const anyoActual = fechaActual.getFullYear();
  const mesActual = fechaActual.getMonth();

  tarjetas.forEach(tarjeta => {
      const mes = parseInt(tarjeta.expirity.split("/")[0]);
      const anyo = parseInt(tarjeta.expirity.split("/")[1]);
      if(anyo < anyoActual || (anyo == anyoActual && mes < mesActual)){
          console.log("Borrando tarjeta expirada");
          tarjeta.remove();
      }
  })
}

const checkViajes = async () => {
  const viajes = await ViajeModel.find();
  viajes.forEach(async viaje => { 
      if(Date.now() > viaje.date.getTime()){ 
          const cliente = await ClienteModel.findById(viaje.client).populate('travels').exec();
          const conductor = await ConductorModel.findById(viaje.driver).populate('travels').exec();
          if(cliente && conductor){
              cliente.travels.filter(viaje => viaje._id != viaje._id);
              await cliente.save();
              conductor.travels.filter(viaje => viaje._id != viaje._id);
              await conductor.save();
          }            
          await ViajeModel.findByIdAndDelete(viaje._id).exec();
          console.log("Borrando viaje expirado");
      }
  })
}


daily(() => {
  console.log("Comprobando tarjetas expiradas");
  checkExpirity();
  console.log("Comprobando viajes pasados");
  checkViajes();
});

const { url } = await startStandaloneServer(server);
console.info(`🚀 Server ready at ${url}`);