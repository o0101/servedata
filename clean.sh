sudo rm -rf typetests
sudo rm -rf public/dist
sudo rm -rf public/src/web_modules
sudo rm -rf node_modules

mkdir -p node_modules
mkdir -p public/src/web_modules
cp public/src/wmdecs.d.ts public/src/web_modules/decs.d.ts
