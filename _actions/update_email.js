// imports
  import {USER_TABLE, LOGINLINK_TABLE} from '../common.js';
  import {sendLoginMail} from './signup.js';

export default async function action({username, email, _id}, {_getTable, newItem, setItem, getSearchResult}, req, res) {
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

  if ( user.email != email ) {
    const loginLink = newItem({table: _getTable(LOGINLINK_TABLE), userid:user._id, item: {userid:user._id}});

    await sendLoginMail({email, loginLink, req});

    setItem({table:Users, id:_id, item:{newEmail: email}}); 

    return {id:_id};
  }
}

