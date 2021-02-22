#!/bin/sh

git remote add template git@github.com:cris691/servedata.git
git fetch --all
git merge template/master --allow-unrelated-histories
git remote remove template


