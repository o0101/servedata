export default function Session({session:{userid}}) {
  return `
    <aside class=session>
      <h1>Session for userid ${userid}</h1>
    </aside>
  `;
}
