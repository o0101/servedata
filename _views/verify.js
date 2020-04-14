export default function verify({email}) {
  return `
    <aside class=session>
      <h1>Email sent to ${email}</h1>
      <p>Check your mail to verify your email address.</p>
    </aside>
  `;
}
