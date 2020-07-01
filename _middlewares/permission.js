import {DEBUG, PERMISSION_TABLE, USER_TABLE} from '../common.js';
import {formatError, grant, noPerms, grantAllPerms} from '../helpers.js';
import {_getTable, getItem} from '../db_helpers.js';

  export function attachPermission(req, res) {
    let userid;
    let user;

    if ( req.authorization ) {
      const {tokenIsInvalid} = req.authorization.errors;
      const {sessionIsExpired} = req.authorization;

      if ( tokenIsInvalid || sessionIsExpired ) {
        return 're-auth-required';
      }

      if ( req.authorization.session ) {
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
          case !!req.params.selection:
            active = `selection/${req.params.selection}`;
            break;
          case !!req.params.message:
            active = `message/${req.params.message}`;
            break;
          default:
            active = ':root';
            break;
        }

        let id, _id;

        if ( active.startsWith('action') ) {
          id = req.body.id;
          _id = req.body._id;
        } else {
          id = req.params.id;
        }

        let owner = false;

        if ( id && req.params.table ) {
          const table = _getTable(req.params.table);
          const record = table.get(id);
          if ( record._owner == userid ) {
            owner = true;
          }
        }

        if ( id && req.params.selection ) {
          if ( id == userid ) {
            owner = true;
          }
        }

        if ( _id && req.params.action ) {
          if ( _id == userid ) {
            owner = true;
          }
        }

        const Endpoint_permissions = noPerms();
        const Instance_permissions = noPerms();

        if ( owner ) {
          const endpoint_key = `owner:${active}`;
          const instance_key = `owner:${active}:${id}`;


          try {
            const table = _getTable(PERMISSION_TABLE);
            const endpoint_permissions = getItem({table, id:endpoint_key});
            grant(Endpoint_permissions, endpoint_permissions);
          } catch(e) {
            DEBUG.INFO && console.warn({endpoint_key, e});
          }

          try {
            const table = _getTable(PERMISSION_TABLE);
            const instance_permissions = getItem({table, id:instance_key});
            grant(Instance_permissions, instance_permissions);
          } catch(e) {
            DEBUG.INFO && console.warn({instance_key, e});
          }
        }

        let isGlobalAdmin, isEndpointAdmin;

        for( const group of user.groups ) {
          if ( group == `globalAdmins` ) {
            isGlobalAdmin = true;
            continue;
          } else if ( group == `${active}:Admins` ) {
            isEndpointAdmin = true;
            continue;
          }
          const endpoint_key = `group/${group}:${active}`;
          const instance_key = `group/${group}:${active}:${id}`;

          try {
            const table = _getTable(PERMISSION_TABLE);
            const endpoint_permissions = getItem({table, id:endpoint_key});
            grant(Endpoint_permissions, endpoint_permissions);
          } catch(e) {
            DEBUG.INFO && console.warn({endpoint_key, e});
          }

          try {
            const table = _getTable(PERMISSION_TABLE);
            const instance_permissions = getItem({table, id:instance_key});
            grant(Instance_permissions, instance_permissions);
          } catch(e) {
            DEBUG.INFO && console.warn({instance_key, e});
          }
        }

        if ( isEndpointAdmin ) {
          const group = '${active}:Admins';
          const endpoint_key = `group/${group}:${active}`;
          const instance_key = `group/${group}:${active}:${id}`;

          try {
            const table = _getTable(PERMISSION_TABLE);
            const endpoint_permissions = getItem({table, id:endpoint_key});
            grant(Endpoint_permissions, endpoint_permissions);
          } catch(e) {
            DEBUG.INFO && console.warn({endpoint_key, e});
          }

          try {
            const table = _getTable(PERMISSION_TABLE);
            const instance_permissions = getItem({table, id:instance_key});
            grant(Instance_permissions, instance_permissions);
          } catch(e) {
            DEBUG.INFO && console.warn({instance_key, e});
          }
        }

        if ( isGlobalAdmin ) {
          const group = 'globalAdmins';
          const endpoint_key = `group/${group}:${active}`;
          const instance_key = `group/${group}:${active}:${id}`;

          try {
            const table = _getTable(PERMISSION_TABLE);
            const endpoint_permissions = getItem({table, id:endpoint_key});
            grant(Endpoint_permissions, endpoint_permissions);
          } catch(e) {
            DEBUG.INFO && console.warn({endpoint_key, e});
          }

          try {
            const table = _getTable(PERMISSION_TABLE);
            const instance_permissions = getItem({table, id:instance_key});
            grant(Instance_permissions, instance_permissions);
          } catch(e) {
            DEBUG.INFO && console.warn({instance_key, e});
          }
        }

        const endpoint_key = `${userid}:${active}`;
        const instance_key = `${userid}:${active}:${id}`;

        try {
          const table = _getTable(PERMISSION_TABLE);
          const endpoint_permissions = getItem({table, id:endpoint_key});
          grant(Endpoint_permissions, endpoint_permissions);
        } catch(e) {
          DEBUG.INFO && console.info({endpoint_key, e});
        }

        try {
          const table = _getTable(PERMISSION_TABLE);
          const instance_permissions = getItem({table, id:instance_key});
          grant(Instance_permissions, instance_permissions);
        } catch(e) {
          DEBUG.INFO && console.warn({instance_key,e});
        }

        grant(req.authorization.permissions, Endpoint_permissions);

        if ( id ) {
          grant(req.authorization.permissions, Instance_permissions);
        }
      }

      Object.freeze(req.authorization.permissions);

      // so basically the order is
      // UserID perms > GlobalAdmin perms > EndpoinAdmin perms > Group perms > Owner perms 
      // and
      // Instance perms > Endpoint perms

      return 'permissions-attached';
    }
  }

