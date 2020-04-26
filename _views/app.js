export default function App(state) {
  return `
    <html lang=en>
      <meta charset=utf-8>
      <meta name=viewport content="width=device-width, initial-scale=1">
      <title>Dosyago</title>
      <script>
        self.loadData = ${JSON.stringify({state})};
      </script>
      <script type=module src=/src/app.js></script>
      <style>
        :root {
          font-family: Arial, sans-serif;
          --white: white;
          --smoke: whitesmoke;
          --grey: silver;
          --left: dodgerblue;
          --right: mediumspringgreen;
          --blue: darkturquoise;


          --pad1: 1rem;
        }
        body {
          margin: 0;
        }
      </style>
    </html>
  `
}
