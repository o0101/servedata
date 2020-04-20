export default function LoggedOut({session:{_id}}) {
  return `
    <aside class=session>
      <h1>Logged out of session with id ${_id}</h1>
    </aside>
  `;
}
