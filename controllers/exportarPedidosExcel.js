import ExcelJS from "exceljs";
import Pedido from "../models/pedido.js";

const exportarPedidoExcel = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await Pedido.findById(id)
      .populate("cliente", "nombre")
      .populate("vendedor", "nombre");

    if (!pedido) {
      return res.status(404).json({ msg: "Pedido no encontrado" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Pedido");

    // 🧾 ENCABEZADO
    worksheet.addRow([`Pedido ID: ${pedido._id}`]);
    worksheet.addRow([`Cliente: ${pedido.cliente?.nombre || "Sin cliente"}`]);
    worksheet.addRow([`Vendedor: ${pedido.vendedor?.nombre || "Sin vendedor"}`]);
    worksheet.addRow([`Estado: ${pedido.estado}`]);
    worksheet.addRow([`Fecha: ${pedido.createdAt.toLocaleString("es-AR")}`]);
    worksheet.addRow([`Observaciones: ${pedido.observaciones || "-"}`]);
    worksheet.addRow([]);

    // 📊 CABECERA TABLA
    worksheet.addRow([
      "Articulo",
      "Referencia",
      "Lista",
      "Cantidad",
      "Precio Unitario",
      "Subtotal",
    ]);

    const headerRow = worksheet.getRow(8);
    headerRow.font = { bold: true };

    // 📦 ITEMS
    pedido.items.forEach((item) => {
      worksheet.addRow([
        item.codigo || "SIN CÓDIGO",
        item.nombre || "SIN NOMBRE",
        item.lista || "SIN LISTA",
        item.cantidad || 0,
        Number(item.precioUnitario || 0),
        Number(item.subtotal || 0),
      ]);
    });

    // 💰 TOTAL
    worksheet.addRow([]);
    const totalRow = worksheet.addRow([
      "",
      "",
      "",
      "",
      "TOTAL",
      Number(pedido.total || 0),
    ]);
    totalRow.font = { bold: true };

    // 🎨 FORMATO MONEDA
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 9 && rowNumber <= 8 + pedido.items.length) {
        row.getCell(5).numFmt = '#,##0.00';
        row.getCell(6).numFmt = '#,##0.00';
      }
    });

    totalRow.getCell(6).numFmt = '#,##0.00';

    // 📐 ANCHOS
    worksheet.columns = [
      { width: 18 }, // Articulo
      { width: 40 }, // Referencia
      { width: 15 }, // Lista
      { width: 12 }, // Cantidad
      { width: 16 }, // Precio Unitario
      { width: 16 }, // Subtotal
    ];

    // 📤 RESPONSE
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=pedido_${pedido._id}.xlsx`,
    );
    res.setHeader("Content-Length", buffer.length);

    res.send(buffer);
  } catch (error) {
    console.error("❌ Error exportando pedido:", error);
    res.status(500).json({
      msg: "Error al exportar pedido",
    });
  }
};

export default exportarPedidoExcel;