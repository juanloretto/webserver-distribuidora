import { Schema, model } from "mongoose";

const UsuarioSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // nunca se devuelve
    },
    rol: {
      type: String,
      enum: ["ADMIN", "USUARIO"],
      required: true,
    },
    estado: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
   
);
UsuarioSchema.methods.toJSON = function () {
  const { password, ...usuario } = this.toObject();
  return usuario;
};


export default model("Usuario", UsuarioSchema);
