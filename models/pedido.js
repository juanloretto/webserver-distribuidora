import { Schema, model } from "mongoose";

const ItemPedidoSchema = new Schema(
  {
    producto: {
      type: Schema.Types.ObjectId,
      ref: "Producto",
      required: true,
    },

    codigo: {
      type: String,
      trim: true,
      required: true,
    },

    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    lista: {
      type: String,
      required: true,
      trim: true,
    },

    precioUnitario: {
      type: Number,
      required: true,
      min: 0,
    },

    cantidad: {
      type: Number,
      required: true,
      min: 1,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

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

    items: {
      type: [ItemPedidoSchema],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: "El pedido debe tener al menos un item",
      },
    },

    total: {
      type: Number,
      default: 0,
      min: 0,
    },

    estado: {
      type: String,
      enum: ["PENDIENTE", "FACTURADO", "ENTREGADO", "CANCELADO"],
      default: "PENDIENTE",
    },

    observaciones: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default model("Pedido", PedidoSchema);
