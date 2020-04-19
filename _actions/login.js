import {beamsplitter} from 'beamsplitter';

import {DEBUG, COOKIE_NAME} from '../common.js';
import {NOUSER_ID, getSearchResult} from '../db_helpers.js';

export default function action({email, username, password}, {getTable, newItem}, req, res) {
  const utable = getTable('users');
  const stable = getTable('sessions');

  const users = getSearchResult({
    table:utable, 
    _search: { 
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
        res.status(401).send(`You cannot login until you verify your email address ${firstMatchingUser.email}`);
        throw {error:`You cannot login until you verify your email address ${firstMatchingUser.email}`};
      }
      userid = firstMatchingUser._id;
    }
  } else {
    res.status(404).send(`No such user`);
    throw {error: `No such user ${email|username}`};
  }

  if ( userid ) {
    const session = newItem({table:stable, item: {userid}});
    res.cookie(COOKIE_NAME, session._id);

    return {session};
  } else {
    res.status(404).send(`No such user`);
    throw {error: `No such user ${email|username}`};
  }
}
