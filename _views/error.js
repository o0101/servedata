import fetch from 'node-fetch';

import {DEBUG} from '../common.js';
import SECRET from '../secrets/giphy-key.js';

const {GIPHY_KEY} = SECRET;


const Tags = [
  '404',
  'uh oh',
  'awkward',
  'waiting',
  'cute',
  'cute cartoon',
  'cute animation'
];


export default function notImplemented(state) {
  //throw new Error(`Error is not implemented as a standard view`);
  return ErrorView(state);
}

export async function ErrorView(state) {
  const TAG = encodeURIComponent(Tags[(Math.random()*Tags.length).toFixed(0)]);
  const randomGif = await fetch(`https://api.giphy.com/v1/gifs/random?api_key=${GIPHY_KEY}&tag=${TAG}&rating=pg-13`).then(r => r.json());
  let gifUrl;
  if ( !! randomGif && randomGif.data ) {
    gifUrl = randomGif.data.images.downsized.url;
  }
  return `
    <html lang=en>
      <meta charset=utf-8>
      <meta name=viewport content="width=device-width, initial-scale=1">
      <title>ServeData</title>
      <link rel=stylesheet href=/static/style.css>
      <style>
        :root {
          background-color: #e4ff6d;
          background-image: linear-gradient(319deg, #e4ff6d 0%, #ffad42 37%, #e4ff6d 100%);
          background-attachment: fixed;
          min-height: 100%;
          height: 100%;
        }
        body {
          min-height: 100%;
          height: 100%;
        }
      </style>
      <script type=module>
        import {init} from '/${DEBUG.BUILD}/error.js';

        self.loadData = ${JSON.stringify({state})};
        self.loadData.state.gifUrl = ${JSON.stringify(gifUrl)};

        init();
      </script>
    </html>
  `
}
