import{w as a}from"./web_modules/bepis.js";export const auth_fields={username:{required:!0,name:"username",placeholder:"username"},password:{required:!0,name:"password",type:"password",placeholder:"password"},password2:{required:!0,name:"password2",type:"password",placeholder:"confirm password"},email:{required:!0,name:"email",type:"email",placeholder:"email"},email2:{required:!0,name:"email2",type:"email",placeholder:"email again"}};export function hiddenInput({name:e,value:r}){return a`
    input ${{type:"hidden",name:e,value:r}}
  `}
