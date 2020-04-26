export default function Profile({username, email, _id, error}) {
  if ( error ) {
    return `<h1>Error: ${error}</h1>`
  } else {
    return `
      <html lang=en stylist=aux_page>
        <meta charset=utf-8>
        <meta name=viewport content="width=device-width, initial-scale=1">
        <title>Dosyago</title>
        <link rel=stylesheet href=/static/style.css>
        <script>
          self.loadData = ${JSON.stringify({username, email,_id})};
        </script>
        <script type=module src=/src/profile.js></script>
      </html>
    `
  }
}
