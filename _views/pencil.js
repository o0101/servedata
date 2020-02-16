export default function Pencil({color, width, type}) {
  return `
    <aside class=pencil>
      <h1>${color} ${type}</h1>
      <p>Width: ${width}</p>
    </aside>
  `;
}
