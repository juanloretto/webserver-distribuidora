import { Schema, model } from "mongoose";

const ListaPrecioSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre de la lista es obligatorio"],
      trim: true,
    },
    precio: {
      type: Number,
      required: [true, "El precio de la lista es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
    },
  },
  { _id: false },
);

const ProductoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
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
      required: [true, "La categoría es obligatoria"],
    },

    // Precio base / principal
    precio: {
      type: Number,
      default: 0,
      min: [0, "El precio no puede ser negativo"],
    },

    // Nuevas listas / ofertas
    listasPrecios: {
      type: [ListaPrecioSchema],
      default: [],
      validate: {
        validator: function (listas) {
          const nombres = listas.map((l) => l.nombre.trim().toUpperCase());
          return new Set(nombres).size === nombres.length;
        },
        message: "No puede haber listas de precios repetidas",
      },
    },

    descripcion: {
      type: String,
      default: "",
      trim: true,
    },

    img: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNK7-n-r_w_qCEIjsnu8VXMBamUkSmLUr9Eg&s",
      trim: true,
    },

    stock: {
      type: Number,
      default: 0,
      min: [0, "El stock no puede ser negativo"],
    },
  },
  {
    timestamps: true,
  },
);

export default model("Producto", ProductoSchema);
