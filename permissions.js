import {
  LOGINLINK_TABLE, SESSION_TABLE,
  PERMISSION_TABLE, USER_TABLE, 
  GROUP_TABLE,
  DEPOSIT_TABLE,
  NOUSER_ID
} from './common.js';

const Perms = [
  // permissions for standard auth actions signup, login, logout
    [
      `${NOUSER_ID}:selection/app`,
      {
        view:true, 
      }
    ],
    [
      `${NOUSER_ID}:action/signup`,
      {
        create:true, 
      }
    ],
    [
      `${NOUSER_ID}:action/sendloginemail`,
      {
        create:true, 
      }
    ],
    [
      `${NOUSER_ID}:action/loginwithlink`,
      {
        create:true, 
      }
    ],
    [
      `${NOUSER_ID}:action/login`,
      {
        create:true, 
      }
    ],
    [
      `${NOUSER_ID}:table/${LOGINLINK_TABLE}`,
      {
        view:true, 
      }
    ],
    [
      `group/users:action/logout`,
      {
        create:true, 
      }
    ],
    [
      `group/users:selection/profile`,
      {
        owner: {
          view:true, 
        }
      }
    ],
    [
      `group/users:selection/app`,
      {
        any: {
          view:true, 
        }
      }
    ],
  
  // permissions for data entry actions based on regular users,
  // user admins, and global admins
    // regular user role
      [
        `group/users:table/${USER_TABLE}`,
        {
          owner : {
            alter: true,
            create:true, 
            view:true,
          }
        }
      ],
      [
        `group/users:table/${DEPOSIT_TABLE}`,
        {
          public : {
            view: true
          },
          owner : {
            create:true, 
            view:true
          }
        }
      ],

    // user admin role
      [
        `group/useradmins:table/${USER_TABLE}`,
        {
          any: {
            excise:true,
            view:true,
            alter:true,
            create:true, 
          }
        }
      ],

    // global admin role
      [
        `group/globaladmins:table/${DEPOSIT_TABLE}`,
        {
          any : {
            excise:true,
            view:true,
            alter:true,
            create:true, 
          }
        }
      ],
      [
        `group/globaladmins:table/${USER_TABLE}`,
        {
          any: {
            excise:true,
            view:true,
            alter:true,
            create:true, 
          }
        }
      ],
      [
        `group/globaladmins:table/${PERMISSION_TABLE}`,
        {
          any: {
            excise:true,
            view:true,
            alter:true,
            create:true, 
          }
        }
      ],
];

export const PermNames = [
  'excise',
  'view',
  'alter',
  'create'
];

export default Perms;
