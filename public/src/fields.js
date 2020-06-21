import {w} from './web_modules/bepis.js';

export const auth_fields = {
  username: {
    required: true,
    name: 'username',
    placeholder: 'username'
  },
  password: {
    required: true,
    name: 'password',
    type: 'password',
    placeholder: 'password'
  },
  password2: {
    required: true,
    name: 'password2',
    type: 'password',
    placeholder: 'confirm password'
  },
  email: {
    required: true,
    name: 'email',
    type: 'email',
    placeholder: 'email'
  },
  email2: {
    required: true,
    name: 'email2',
    type: 'email',
    placeholder: 'email again'
  },
};

export function hiddenInput({name, value}) {
  return w`
    input ${{type:'hidden', name, value}}
  `;
}
