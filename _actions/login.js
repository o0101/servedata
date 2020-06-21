import {beamsplitter} from 'beamsplitter';

import {DEBUG, COOKIE_NAME, NOUSER_ID, USER_TABLE, SESSION_TABLE} from '../common.js';
import {getSearchResult} from '../db_helpers.js';

export default function action({email, username, password}, {_getTable, newItem}, req, res) {
  const utable = _getTable(USER_TABLE);
  const stable = _getTable(SESSION_TABLE);

  const users = getSearchResult({
    table:utable, 
    _search: { 
      _exact: true,
      _and: true, 
      email, username,

    }
  });

  let userid;

  if ( users ) {
    let firstMatchingUser;

    for( const user of users ) {
      const {salt} = user;
      const passwordHash = beamsplitter(password, salt).toString(16);
      if ( passwordHash == user.passwordHash ) {
        firstMatchingUser = user;
        break;
      }
    }

    if ( !! firstMatchingUser ) {
      if ( !firstMatchingUser.verified ) {
        throw { status: 401, error: `You cannot login until you verify your email address ${firstMatchingUser.email}`};
      }
      userid = firstMatchingUser._id;
    }
  } else {
    throw {status: 404, error: `No such user with ${JSON.stringify({username,email})}`};
  }

  if ( userid ) {
    const session = newItem({table:stable, userid, item: {userid}});
    res.cookie(COOKIE_NAME, session._id, {sameSite:true, httpOnly:true});

    return {id:userid, session};
  } else {
    throw {status: 404, error: `No such user with ${JSON.stringify({username,email})}`};
  }
}
