import ExcelJS from "exceljs";
import Pedido from "../models/pedido.js";

const exportarPedidoExcel = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await Pedido.findById(id)
      .populate("cliente", "nombre")
      .populate("vendedor", "nombre")
      .populate("items.producto", "nombre codigo precio");

    if (!pedido) {
      return res.status(404).json({ msg: "Pedido no encontrado" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Pedido");

    // 🧾 ENCABEZADO
    worksheet.addRow([`Pedido ID: ${pedido._id}`]);
    worksheet.addRow([`Cliente: ${pedido.cliente?.nombre}`]);
    worksheet.addRow([`Vendedor: ${pedido.vendedor?.nombre}`]);
    worksheet.addRow([`Fecha: ${pedido.createdAt.toLocaleString("es-AR")}`]);
    worksheet.addRow([]);

    // 📊 CABECERA TABLA
    worksheet.addRow([
      "ID Producto",
      "Nombre Producto",
      "Cantidad",
      "Precio",
      "Subtotal",
    ]);

    worksheet.getRow(6).font = { bold: true };

    // 📦 ITEMS
    pedido.items.forEach((item) => {
      worksheet.addRow([
        item.producto._id.toString(),
        item.producto.nombre,
        item.cantidad,
        item.precio,
        item.cantidad * item.precio,
      ]);
    });

    // 📐 ANCHOS
   worksheet.columns.forEach((column) => {
    let maxLength = 10;

    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellLength = cell.value
        ? cell.value.toString().length
        : 0;
      if (cellLength > maxLength) {
        maxLength = cellLength;
      }
    });

    column.width = maxLength + 2;
  });

    // 📤 RESPONSE
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=pedido_${pedido._id}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("❌ Error exportando pedido:", error);
    res.status(500).json({
      msg: "Error al exportar pedido",
    });
  }
};

export default exportarPedidoExcel;
