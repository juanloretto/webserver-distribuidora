import { Schema, model } from "mongoose";

const ClienteSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del cliente es obligatorio"],
    },

    direccion: {
      type: String,
    },

    telefono: {
      type: String,
    },

    vendedor: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },

    estado: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, 
  }
);

export default model("Cliente", ClienteSchema);
