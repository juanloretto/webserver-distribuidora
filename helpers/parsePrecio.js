export const parsePrecio = (valor) => {
  if (!valor) return null;

  let limpio = valor.replace(/\$/g, "").trim();

  if (limpio.includes(",") && limpio.includes(".")) {
    // formato USA → 3,375.86
    limpio = limpio.replace(/,/g, "");
  } else if (limpio.includes(",")) {
    // formato argentino → 3.375,86
    limpio = limpio.replace(/\./g, "").replace(",", ".");
  }

  const numero = parseFloat(limpio);
  return isNaN(numero) ? null : numero;
};