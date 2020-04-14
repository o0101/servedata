import {T} from 'jtype-system';
import {PermNames} from '../server.js';

const validationObject = {};
for( const permName of PermNames ) {
  validationObject[permName] = T`Boolean`
}
T.def('Permission', validationObject);

export default function validate(permission) {
  return T.errors(T`Permission`, permission);
}
