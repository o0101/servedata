import {
  LOGINLINK_TABLE, SESSION_TABLE,
  PERMISSION_TABLE, USER_TABLE, 
  GROUP_TABLE,
  DEPOSIT_TABLE,
  NOUSER_ID
} from './server.js';

const Perms = [
  // permissions for standard auth actions signup, login, logout
    [
      `${NOUSER_ID}:action/signup`,
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
  
  // permissions for data entry actions based on regular users,
  // user admins, and global admins
    // regular user role
      [
        `group/users:table/${DEPOSIT_TABLE}`,
        {
          create:true, 
          view:true
        }
      ],

    // user admin role
      [
        `group/user_admins:table/${USER_TABLE}`,
        {
          excise:true,
          view:true,
          alter:true,
          create:true, 
        }
      ],

    // global admin role
      [
        `group/global_admins:table/${DEPOSIT_TABLE}`,
        {
          excise:true,
          view:true,
          alter:true,
          create:true, 
        }
      ],
      [
        `group/global_admins:table/${USER_TABLE}`,
        {
          excise:true,
          view:true,
          alter:true,
          create:true, 
        }
      ],
      [
        `group/global_admins:table/${PERMISSION_TABLE}`,
        {
          excise:true,
          view:true,
          alter:true,
          create:true, 
        }
      ],
];

export default Perms;
