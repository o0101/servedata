export default function NewBox(items) {
  return `
    <ul>
      ${items.map(item => `
      <li>
        ${item.color} ${item.type}, ${item.width}
      </li>
      `).join('\n')}
    </ul>
  `;
}
