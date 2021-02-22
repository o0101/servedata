find public/*.html -type f -exec sed -i "s/from '\/\w\+\//from '\/dist\//g;" {} +
for path in public/src/*.js
do
  file=$(basename $path)
  rollup $path --file public/dist/$file
done
