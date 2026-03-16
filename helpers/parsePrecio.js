export const parsePrecio = (valor) => {
  if (valor === null || valor === undefined || valor === "") return null;

  // Si ya viene como número, devolverlo redondeado
  if (typeof valor === "number") {
    return Number(valor.toFixed(2));
  }

  let limpio = String(valor).trim();

  // sacar $ y espacios
  limpio = limpio.replace(/\$/g, "").replace(/\s/g, "");

  if (limpio.includes(",") && limpio.includes(".")) {
    // Caso USA: 3,375.86
    // la coma es miles y el punto decimal
    limpio = limpio.replace(/,/g, "");
  } else if (limpio.includes(",")) {
    // Caso AR: 3.375,86 o 3375,86
    // el punto es miles y la coma decimal
    limpio = limpio.replace(/\./g, "").replace(",", ".");
  }

  const numero = parseFloat(limpio);

  if (isNaN(numero)) return null;

  return Number(numero.toFixed(2));
};
