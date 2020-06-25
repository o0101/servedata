import {DEBUG} from '../common.js';

export default function App(state) {
  return `
    <html lang=en>
      <meta charset=utf-8>
      <meta name=viewport content="width=device-width, initial-scale=1">
      <title>Dosyago</title>
      <link rel=stylesheet href=/static/style.css>
      <script type=module>
        import {init} from '/${DEBUG.BUILD}/app.js';

        self.loadData = ${JSON.stringify({state})};

        init();
      </script>
    </html>
  `
}
