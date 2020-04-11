export default function Session({session:{userid}, permissions, scope}) {
  return `
    <aside class=session>
      <h1>Session for userid ${userid}</h1>
      <dl>
        <dt>Scopes
        <dd><code>${scope}</code>
        <dt>Permissions
        <dd><code><pre>${JSON.stringify(permissions, null, 2)}</pre></code>
      </dl>
    </aside>
  `;
}
