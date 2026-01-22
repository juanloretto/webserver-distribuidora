# Pedidos

Este documento describe las reglas de negocio y el flujo del sistema de pedidos.

## Estados del Pedido

Los pedidos pueden tener los siguientes estados:

- **PENDIENTE**
  - Estado inicial al crear el pedido
  - Editable
  - Puede cancelarse
  - No facturado

- **FACTURADO**
  - Pedido confirmado por la oficina
  - No editable
  - Se exporta a Excel para facturación
  - No puede cancelarse

- **ENTREGADO**
  - Pedido entregado al cliente
  - Estado final
  - No editable

- **CANCELADO**
  - Pedido cancelado
  - Estado final
  - Devuelve stock
  - No editable

---

## Flujo del Pedido

1. El vendedor crea un pedido
2. El pedido se guarda con estado **PENDIENTE**
3. La oficina revisa y factura el pedido
4. El pedido pasa a estado **FACTURADO**
5. Se exporta el pedido a Excel
6. El pedido finaliza como:
   - **ENTREGADO**, o
   - **CANCELADO** (solo si aún está pendiente)

---

## Creación del Pedido

- El pedido es creado por un **vendedor**
- Se registra:
  - Cliente
  - Productos (snapshot)
  - Cantidades
  - Precio unitario
  - Total
  - Observaciones
- El stock se descuenta al momento de crear el pedido
- La creación se realiza dentro de una **transacción (session)**

---

## Cancelación del Pedido

La cancelación cumple las siguientes reglas:

- Solo usuarios con rol **ADMIN**
- Solo pedidos en estado **PENDIENTE**
- Al cancelar:
  - El estado pasa a **CANCELADO**
  - Se devuelve el stock de los productos
  - Se guarda la fecha de cancelación
  - Se registra el usuario que canceló

---

## Exportación a Excel

- Solo se exportan pedidos con estado **FACTURADO**
- El archivo generado es consumido por el sistema externo de facturación
- La exportación no modifica el estado del pedido

---

## Reglas Importantes

- No se permite modificar pedidos **FACTURADOS**, **ENTREGADOS** o **CANCELADOS**
- Las operaciones críticas usan transacciones para garantizar consistencia
- El stock siempre debe quedar sincronizado con los pedidos

---

## Consideraciones Técnicas

- MongoDB con **Replica Set** es obligatorio para transacciones
- Se utilizan sesiones (`mongoose.startSession`)
- Los productos del pedido se guardan como snapshot para evitar cambios futuros

## Transiciones PROHIBIDAS

| Desde     | Hacia        | Motivo         |
| --------- | ------------ | -------------- |
| ENTREGADO | *cualquiera* | Pedido cerrado |
| CANCELADO | *cualquiera* | Estado final   |
| FACTURADO | PENDIENTE    | Inconsistencia |
| ENTREGADO | CANCELADO    | Error grave    |
