rm -rf public/dist
rm -rf public/src/web_modules
rm -rf node_modules
npm upgrade

mkdir -p public/src/web_modules
cp public/src/wmdecs.d.ts public/src/web_modules/decs.d.ts
