import {T} from 'jtype-system';
import {USER_TABLE} from '../common.js';
import {_getTable, getSearchResult} from '../db_helpers.js';

T.def('User', {
  _id: T`ID`,
  username: T`Username`,
  email: T`Email`,
  salt: T`Integer`,
  passwordHash: T`Hash`,
  groups: T`GroupArray`,
  verified: T.maybe(T`Boolean`)
});

export default function validate(user) {
  const errors = T.errors(T`User`, user);
  
  validateUsernameUniqueness(user, errors);

  return errors;
}

export function validatePartial(partialUser) {
  const errors = T.partialMatch(T`User`, partialUser);

  if ( partialUser.username ) {
    validateUsernameUniqueness(partialUser, errors);
  }

  return errors;
}

function validateUsernameUniqueness(user, errors) {
  const users = _getTable(USER_TABLE);
  const usernameResults = getSearchResult({table:users, _search: {
    username: user.username,
  }});


  if ( usernameResults.length ) {
    const userErrors = [];
    for( const otherUser of usernameResults ) {
      if ( otherUser._id == user._id ) continue; 
      else userErrors.push(otherUser);
    }

    if ( userErrors.length ) {
      errors.push(`Username ${user.username} already exists.`);
      console.warn({usernameResults, userErrors, user});
      return false;
    }
  }

  return true;
}
