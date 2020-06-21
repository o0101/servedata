import {T} from 'jtype-system';

import {DEBUG, DEPOSIT_TABLE} from '../common.js';
import {_getTable, getSearchResult} from '../db_helpers.js';

T.def('Deposit', {
  _id: T`ID`,
  _owner: T`ID`,
  account: T`String`,
  txID: T`Hash`,
  amount100ths: T`Integer`,
  valence: T`IntegerSign`
});

export default function validate(deposit) {
  const errors = T.errors(T`Deposit`, deposit);
  
  validateTxIDUniqueness(deposit, errors);

  return errors;
}

export function validatePartial(partialDeposit) {
  const errors = T.partialMatch(T`Deposit`, partialDeposit);

  if ( partialDeposit.txID ) {
    validateTxIDUniqueness(partialDeposit, errors);
  }


  return errors;
}

function validateTxIDUniqueness(deposit, errors) {
  const deposits = _getTable(DEPOSIT_TABLE);
  const results = deposits.getAllMatchingKeysFromIndex("txID", deposit.txID);

  if ( results.length ) {
    const despositErrors = [];
    for( const otherDepositID of despositnameResults ) {
      if ( otherDepositID == desposit._id) continue; 
      else despositErrors.push(otherDepositID);
    }

    if ( despositErrors.length ) {
      errors.push(`Transaction ID ${desposit.txID} already exists.`);
      DEBUG.INFO && console.info({despositnameResults, despositErrors, desposit});
      return false;
    }
  }

  return true;
}
