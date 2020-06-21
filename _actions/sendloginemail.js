import {
  USER_TABLE, 
  LOGINLINK_TABLE,
} from '../common.js';

import {sendLoginMail} from './signup.js';

export default async function action({username}, {_getTable, newItem, setItem, getSearchResult}, req, res) {
  const user = getSearchResult({table: _getTable(USER_TABLE), _search: { username }})[0];

  if ( ! user ) {
    throw {status: 401, error: `Username ${username} does not exist.`};
  }

  const {email} = user;

  const loginLink = newItem({table: _getTable(LOGINLINK_TABLE), userid:user._id, item: {userid:user._id}});

  await sendLoginMail({email, loginLink, req});

  return {username};
}
