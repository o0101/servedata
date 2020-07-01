import {T} from 'jtype-system';
import {DEBUG, TRANSACTION_TABLE} from '../common.js';
import {_getTable, getSearchResult} from '../db_helpers.js';

T.defSub(T`Integer`, null, {verify: i => i >= 0 }, 'Positive');
T.defEnum('Transaction.Status', 'complete', 'pending', 'failed');
T.defEnum('Transaction.Type', 'subscription', 'payment'),
T.def('Transaction', {
  _id: T`ID`,
  _owner: T`ID`,
  stripeCustomerID: T`String`,
  status: T`Transaction.Status`,
  type: T`Transaction.Type`,
  currencyValue: T`Positive>Integer`,
  creditValue: T`Positive>Integer` 
});

export default function validate(transaction) {
  return T.errors(T`Transaction`, transaction);
}

export function validatePartial(partialTransaction) {
  return T.partialMatch(T`Transaction`, partialTransaction);
}
