const COLOR = [
  'red',
  'cerese',
  'darkorange',
  'methusela purple',
  'violet',
  'indigo',
  'turquoise'
];

export default function action({size}, {getTable, newItem}) {
  const table = getTable('pencil');
  const added = [];
  for( let i = 0;i < size; i++) {
    const item = {
      width: i*20+5,
      color: COLOR[i%COLOR.length],
      type:'pencil'
    }
    added.push(newItem({table,item}));
  }
  return added;
}
