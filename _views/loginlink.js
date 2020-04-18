export default function LoginLink({_id}) {
  return `
    <form method=POST action=/form/action/loginwithlink/with/app> 
      <input type=hidden name=loginId value=${_id}>
      <button>Login</button>
    </form>
  `
}
