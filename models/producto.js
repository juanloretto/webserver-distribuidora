import { Schema, model } from "mongoose";

const ProductoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      unique: true,
      trim: true,
    },

    codigo: {
      type: String,
      required: [true, "El código del producto es obligatorio"],
      unique: true,
      trim: true,
    },

    estado: {
      type: Boolean,
      default: true,
    },

    categoria: {
      type: Schema.Types.ObjectId,
      ref: "Categoria",
      required: true,
    },

    precio: {
      type: Number,
      default: 0,
    },

    descripcion: {
      type: String,
    },

    img: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNK7-n-r_w_qCEIjsnu8VXMBamUkSmLUr9Eg&s",
    },

    stock: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Producto", ProductoSchema);
