import { Schema, model } from "mongoose";

const ClienteSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del cliente es obligatorio"],
      trim: true,
    },

    razonSocial: {
      type: String,
      trim: true,
    },

    direccion: {
      type: String,
      trim: true,
    },

    localidad: {
      type: String,
      trim: true,
    },

    telefono: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    cuit: {
      type: String,
      trim: true,
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