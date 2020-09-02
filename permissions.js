import {
  LOGINLINK_TABLE, 
  PERMISSION_TABLE, USER_TABLE, 
  DEPOSIT_TABLE,
  NOUSER_ID
} from './common.js';

const Perms = [
  // test permission
    [
      `${NOUSER_ID}:table/${DEPOSIT_TABLE}`,
      {
        create:true,
        alter:true,
        view:true, 
      }
    ],

  // permissions for standard auth actions signup, login, logout
    [
      `${NOUSER_ID}::root`,
      {
        view: true
      }
    ],
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
      `group/nousers:message/cancel_payment`,
      {
        view: true
      }
    ],
    [
      `group/nousers:message/success_payment`,
      {
        view: true
      }
    ],
    [
      `group/users:action/logout`,
      {
        create:true, 
      }
    ],
    [
      `owner:action/update_password`,
      {
        create:true, 
      }
    ],
    [
      `owner:action/update_email`,
      {
        create:true, 
      }
    ],
    [
      `owner:selection/profile`,
      {
        view: true
      }
    ],
    [
      `group/users:selection/app`,
      {
        view:true, 
      }
    ],
    [
      `group/users:message/cancel_payment`,
      {
        view: true
      }
    ],
    [
      `group/users:message/success_payment`,
      {
        view: true
      }
    ],
    [
      `group/users::root`,
      {
        view: true
      }
    ],
  
  // permissions for data entry actions based on regular users,
  // user admins, and global admins
    // regular user role
      [
        `owner:table/${USER_TABLE}`,
        {
          alter: true,
          view:true,
        }
      ],
      [
        `group/users:table/${USER_TABLE}`,
        {
          create: true
        }
      ],
      [
        `owner:table/${DEPOSIT_TABLE}`,
        {
          alter: true,
          view: true
        },
      ],
      [
        `group/users:table/${DEPOSIT_TABLE}`,
        {
          create: true
        }
      ],
      [
        `owner:table/${LOGINLINK_TABLE}`,
        {
          view:true, 
        }
      ],
      [
        `group/users:action/loginwithlink`,
        {
          create:true, 
        }
      ],
      [
        `group/users:action/pay`,
        {
          create:true, 
        }
      ],
      [
        `group/nousers:action/record_payment`,
        {
          create:true, 
        }
      ],

    // user admin role
      [
        `group/useradmins:table/${USER_TABLE}`,
        {
            excise:true,
            view:true,
            alter:true,
            create:true, 
        }
      ],

    // global admin role
      [
        `group/globaladmins:table/${DEPOSIT_TABLE}`,
        {
          excise:true,
          view:true,
          alter:true,
          create:true, 
        }
      ],
      [
        `group/globaladmins:table/${USER_TABLE}`,
        {
            excise:true,
            view:true,
            alter:true,
            create:true, 
        }
      ],
      [
        `group/globaladmins:table/${PERMISSION_TABLE}`,
        {
            excise:true,
            view:true,
            alter:true,
            create:true, 
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
