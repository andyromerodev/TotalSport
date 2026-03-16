import { randomUUID } from 'node:crypto';
import { assert, isObject } from './assert.mjs';
import { roundMoney } from './money.mjs';
import { MOVEMENT_TYPES } from '../domain/inventory.rules.mjs';

function normalizeMoney(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  assert(Number.isFinite(parsed) && parsed >= 0, `${fieldName} must be a number greater or equal to 0.`);
  return roundMoney(parsed);
}

export function normalizeMovementInput(input, catalogById) {
  assert(isObject(input), 'Movement payload must be an object.');

  const productId = typeof input.productId === 'string' ? input.productId.trim() : '';
  assert(productId.length > 0, 'productId is required.');
  assert(catalogById.has(productId), `Unknown productId: ${productId}.`);

  const type = typeof input.type === 'string' ? input.type.toUpperCase().trim() : '';
  assert(MOVEMENT_TYPES.includes(type), `type must be one of: ${MOVEMENT_TYPES.join(', ')}.`);

  const qty = Number(input.qty);
  assert(Number.isInteger(qty) && qty > 0, 'qty must be an integer greater than 0.');

  const movement = {
    id: randomUUID(),
    productId,
    type,
    qty,
    note: typeof input.note === 'string' ? input.note.trim() : '',
    timestamp:
      typeof input.timestamp === 'string' && input.timestamp.trim().length > 0
        ? input.timestamp
        : new Date().toISOString()
  };

  const unitCostUsd = normalizeMoney(input.unitCostUsd, 'unitCostUsd');
  const unitSaleUsd = normalizeMoney(input.unitSaleUsd, 'unitSaleUsd');

  if (unitCostUsd !== undefined) movement.unitCostUsd = unitCostUsd;
  if (unitSaleUsd !== undefined) movement.unitSaleUsd = unitSaleUsd;

  if (type === 'ADJUSTMENT') {
    const adjustmentSign =
      typeof input.adjustmentSign === 'string' ? input.adjustmentSign.toUpperCase().trim() : '';
    assert(adjustmentSign === 'IN' || adjustmentSign === 'OUT', 'ADJUSTMENT requires adjustmentSign IN or OUT.');
    movement.adjustmentSign = adjustmentSign;
  }

  return movement;
}
