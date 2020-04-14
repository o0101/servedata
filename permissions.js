import {NOUSER_ID} from './server.js';

const Perms = [
  [
    `${NOUSER_ID}:action/create_session`,
    {
      create:true, 
      view:true
    }
  ],
  [
    `${NOUSER_ID}:action/create_user`,
    {
      create:true, 
      view:true
    }
  ],
  [
    `group/users:table/deposit`,
    {
      create:true, 
      view:true
    }
  ],
  [
    `group/users:table/pencil`,
    {
      create:true, 
      view:true
    }
  ],
  [
    `group/users:action/newbox`, 
    {
      create:true, 
      view:true
    }
  ]
];

export default Perms;
