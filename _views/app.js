export default function App({session:{userid}}) {
  return `
    <aside class=session>
      <h1>Logged in with session for userid ${userid}</h1>
    </aside>
  `;
}
