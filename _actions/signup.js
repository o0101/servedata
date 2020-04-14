import {USER_TABLE, SESSION_TABLE, COOKIE_NAME, GROUP_TABLE} from '../server.js';

export default function action({userid}, {getTable, newItem}, req, res) {
  const utable = getTable(USER_TABLE);
  const stable = getTable(SESSION_TABLE);
  const gtable = getTable(GROUP_TABLE);

  utable.put(userid, {userid, groups:['users']});

  let usersGroup;
  
  try {
    usersGroup = gtable.get('users');
  } catch(e) {
    usersGroup = {users:{}, name: 'users', description:'regular users'};
  }

  usersGroup.users[userid] = true;
  gtable.put('users', usersGroup);

  const session = newItem({table:stable, item: {userid}});
  res.cookie(COOKIE_NAME, session._id);

  return {session};
}
