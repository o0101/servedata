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
  let {errors,valid} = T.partialMatch(T`Deposit`, partialDeposit);

  if ( valid && partialDeposit.txID ) {
    valid = valid && validateTxIDUniqueness(partialDeposit, errors);
  }


  return {errors,valid};
}

function validateTxIDUniqueness(deposit, errors) {
  const deposits = _getTable(DEPOSIT_TABLE);
  const results = deposits.getAllMatchingKeysFromIndex("txID", deposit.txID);

  if ( results.length ) {
    const depositErrors = [];
    for( const otherDepositID of results ) {
      if ( otherDepositID == deposit._id) continue; 
      else depositErrors.push(otherDepositID);
    }

    if ( depositErrors.length ) {
      errors.push(`Transaction ID ${deposit.txID} already exists.`);
      DEBUG.INFO && console.info({results, depositErrors, deposit});
      return false;
    }
  }

  return true;
}
