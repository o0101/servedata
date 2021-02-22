import {
  USER_TABLE
} from '../common.js';
import {
  _getTable
} from '../db_helpers.js';
import View from '../_views/signup.js';

export function select(data, req, res) {
  const state = {
    authorization: req.authorization,
    ...data
  };
  return {state};
}


export function display({state}) {
  return View({state});
}
