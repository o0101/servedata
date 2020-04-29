import {
  USER_TABLE
} from '../common.js';
import {
  _getTable
} from '../db_helpers.js';
import Profile from '../_views/profile.js';

export function select({id}) {
  if ( ! id ) {
    throw new TypeError(`Selection 'Profile' requires a parameter 'id'`);
  }

  const users = _getTable(USER_TABLE); 
  const user = users.get(id);

  return user;
}


export function display(data) {
  return Profile(data);
}
