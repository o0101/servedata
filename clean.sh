rm -rf typetests
rm -rf public/dist
rm -rf public/src/web_modules
rm -rf node_modules

mkdir -p public/src/web_modules
cp public/src/wmdecs.d.ts public/src/web_modules/decs.d.ts
