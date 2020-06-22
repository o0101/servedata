// imports
  import {
    USER_TABLE, 
  } from '../common.js';
  import {
    hashPassword,
  } from '../helpers.js';

export default async function action({username, password, _id}, {_getTable, setItem, getSearchResult}, req, res) {
  const Users = _getTable(USER_TABLE);

  const results = getSearchResult({table: Users, _search: { _exact: true, username }});

  if ( ! results.length ) {
    throw {status: 401, error: `Username ${username} does not exist.`};
  }

  // username's must be unique
  const user = results[0];

  if ( user._id != _id ) {
    throw {status: 401, error: `User ${username} has different _id to the _id given (and this should have been caught by permissions not here).`};
  }

  const {randomSalt:salt, passwordHash} = hashPassword(password);

  Object.assign(user, {salt,passwordHash});

  setItem({table:Users, id:_id, item:user}); 

  return {id:_id};
}

