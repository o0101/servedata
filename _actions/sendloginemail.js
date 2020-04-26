import {
  USER_TABLE, 
  LOGINLINK_TABLE,
} from '../common.js';

import {sendLoginMail} from './signup.js';

export default async function action({username}, {getTable, newItem, setItem, getSearchResult}, req, res) {
  const user = getSearchResult({table: getTable(USER_TABLE), _search: { username }})[0];

  if ( ! user ) {
    throw {status: 401, error: `Username ${username} does not exist.`};
  }

  const {email} = user;

  const loginLink = newItem({table:getTable(LOGINLINK_TABLE), item: {userid:user._id}});

  await sendLoginMail({email, loginLink, req});

  return {username, email};
}
