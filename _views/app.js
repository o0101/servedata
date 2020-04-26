export default function App(state) {
  return `
    <html lang=en>
      <meta charset=utf-8>
      <meta name=viewport content="width=device-width, initial-scale=1">
      <title>Dosyago</title>
      <link rel=stylesheet href=/static/style.css>
      <script>
        self.loadData = ${JSON.stringify({state})};
      </script>
      <script type=module src=/src/app.js></script>
    </html>
  `
}
