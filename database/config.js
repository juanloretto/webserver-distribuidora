import mongoose from "mongoose";
import dns from "dns";

// Forzar Node a usar DNS confiable (resuelve registros SRV de MongoDB Atlas)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const dbConnection = async () => {
  try {
    console.log(process.env.DATABASE_CNN);

    await mongoose.connect(process.env.DATABASE_CNN);
    console.log("Base de datos online");
  } catch (error) {
    console.error(error);
    throw new Error("Error en la conexión a la base de datos");
  }
};

export { dbConnection };
