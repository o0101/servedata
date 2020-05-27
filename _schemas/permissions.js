import {T} from 'jtype-system';
import {PermNames} from '../permissions.js';

const validationObject = {
  _id: T`ID`
};
for( const permName of PermNames ) {
  validationObject[permName] = T`Boolean`
}
T.def('Permission', validationObject);

export default function validate(permission) {
  return T.errors(T`Permission`, permission);
}

export function validatePartial(partialPermission) {
  return T.partialMatch(T`Permission`, partialPermission);
}
