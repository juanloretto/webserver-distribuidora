import { Schema, model } from "mongoose";

const PedidoSchema = new Schema(
  {
    vendedor: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },

    cliente: {
      type: Schema.Types.ObjectId,
      ref: "Cliente",
      required: true,
    },

    items: [
      {
        producto: {
          type: Schema.Types.ObjectId,
          ref: "Producto",
          required: true,
        },
        codigo: {
          type: String,
          trim: true,
        },
        nombre: String,
        precio: Number,
        cantidad: {
          type: Number,
          required: true,
          min: 1,
        },
        subtotal: Number,
      },
    ],
    total: {
      type: Number,
      default: 0,
    },

    estado: {
      type: String,
      enum: ["PENDIENTE", "FACTURADO", "ENTREGADO", "CANCELADO"],
      default: "PENDIENTE",
    },

    observaciones: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt = fecha y hora exacta
  },
);

export default model("Pedido", PedidoSchema);
