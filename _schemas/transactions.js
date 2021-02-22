import {T} from 'jtype-system';

import {DEBUG, TRANSACTION_TABLE} from '../common.js';
import {_getTable, getSearchResult} from '../db_helpers.js';

T.def('Transaction', {
  _id: T`ID`,
  _owner: T`ID`,
  createdAt: T`TimeStamp`,
  stripeCustomerId: T`String`,
  // i think sub type matches don't work yet
  /*currency: T`Currency>String`, */
  currency: T`Currency`,
  valence: T`IntegerSign`,
  amount100ths: T`Integer`,
  type: T`TransactionType`,
  description: T.maybe(T`TransactionDescription`),
  priceId: T.maybe(T`String`),
  txId: T`Hash`
});

export default function validate(transaction) {
  const errors = T.errors(T`Transaction`, transaction);
  
  validateTxId(transaction, errors);

  return errors;
}

export function validatePartial(partialTransaction) {
  let {errors,valid} = T.partialMatch(T`Transaction`, partialTransaction);

  if ( valid && partialTransaction.txId ) {
    valid = valid && validateTxIDUniqueness(partialTransaction, errors);
  }


  return {errors,valid};
}

function validateTxId(transaction, errors) {
  // txId must be unique
  const transactions = _getTable(TRANSACTION_TABLE);
  const results = transactions.getAllMatchingKeysFromIndex("txId", transaction.txId);

  if ( results.length ) {
    const transactionErrors = [];
    for( const otherTransactionID of results ) {
      if ( otherTransactionID == transaction._id) continue; 
      else transactionErrors.push(otherTransactionID);
    }

    if ( transactionErrors.length ) {
      errors.push(`Transaction ID ${transaction.txId} already exists.`);
      DEBUG.INFO && console.info({results, transactionErrors, transaction});
      return false;
    }
  }

  return true;
}
