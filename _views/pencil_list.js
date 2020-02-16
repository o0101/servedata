import Pencil from './pencil.js';

export default function PencilList(pencils) {
  return `
    <article class=pencil_list>
      <ul>
        ${pencils.map(pencil => `
          <li>
            ${Pencil(pencil)}
          </li>
        `).join('\n')}
      </ul>
    </article>
  `;
}

