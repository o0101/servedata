find public/*.html -type f -exec sed -i "s/from '\/\w\+\//from '\/src\//g;" {} +
