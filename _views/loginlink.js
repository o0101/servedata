export default function LoginLink({loginId}) {
  return `
    <form method=POST action=/form/action/loginwithlink/with/app> 
      <input type=hidden name=loginId value=${loginId}>
      <button>Login</button>
    </form>
  `
}
