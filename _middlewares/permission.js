import {DEBUG, PERMISSION_TABLE, USER_TABLE} from '../common.js';
import {formatError, grant, blankPerms} from '../helpers.js';
import {_getTable, getItem} from '../db_helpers.js';

  export function getPermission(req, res) {
    let userid;
    let user;

    if ( req.authorization ) {
      const {tokenIsInvalid,sessionIsExpired} = req.authorization;

      if ( tokenIsInvalid || sessionIsExpired ) {
        req.errors = {tokenIsInvalid, sessionIsExpired};
        return;
      }

      const {userid} = req.authorization.session;

      try {
        const table = _getTable(USER_TABLE);
        user = getItem({table, id:userid});
      } catch(e) {
        DEBUG.ERROR && console.error({msg:"Session and token OK, but no user", userid, error:  formatError(e)});
        req.errors = {noUser:true};
        return;
      }

      const {accountDisabled, accountDeleted} = user;

      if ( accountDisabled || accountDeleted ) {
        DEBUG.WARN && console.warn({msg:"Account not active", accountDisabled, accountDeleted});
        req.errors = {accountDisabled, accountDeleted};
        return;
      }

      const Endpoint_permissions = blankPerms();
      const Instance_permissions = blankPerms();

      let active;

      switch(true) {
        case !!req.params.table:
          active = `table/${req.params.table}`;
          break;
        case !!req.params.action:
          active = `action/${req.params.action}`;
          break;
        case !!req.params.query:
          active = `query/${req.params.query}`;
          break;
      }

      for( const group of user.groups ) {
        try {
          const table = _getTable(PERMISSION_TABLE);
          const endpoint_key = `group/${group}:${active}`;
          const endpoint_permissions = getItem({table, id:endpoint_key});
          grant(Endpoint_permissions, endpoint_permissions);
        } catch(e) {
          DEBUG.INFO && console.warn(e);
        }

        try {
          const table = _getTable(PERMISSION_TABLE);

          let id;
          if ( active.startsWith('action') ) {
            id = req.body.id;
          } else {
            id = req.params.id;
          }

          const instance_key = `group/${group}:${active}:${id}`;
          const instance_permissions = getItem({table, id:instance_key});
          grant(Instance_permissions, instance_permissions);
        } catch(e) {
          DEBUG.INFO && console.warn(e);
        }
      }

      try {
        const table = _getTable(PERMISSION_TABLE);
        const endpoint_key = `${userid}:${active}`;
        const endpoint_permissions = getItem({table, id:endpoint_key});
        grant(Endpoint_permissions, endpoint_permissions);
      } catch(e) {
        DEBUG.INFO && console.warn(e);
      }

      try {
        const table = _getTable(PERMISSION_TABLE);
        let id;
        if ( active.startsWith('action') ) {
          id = req.body.id;
        } else {
          id = req.params.id;
        }
        const instance_key = `${userid}:${active}:${id}`;
        const instance_permissions = getItem({table, id:instance_key});
        grant(Instance_permissions, instance_permissions);
      } catch(e) {
        DEBUG.INFO && console.warn(e);
      }

      grant(req.authorization.permissions, Endpoint_permissions);
      grant(req.authorization.permissions, Instance_permissions);

      Object.freeze(req.authorization.permissions);
    }
  }

