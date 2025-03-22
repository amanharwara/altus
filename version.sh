#!/bin/bash

component="${1:-"patch"}" # major, minor, patch

regex="\b(major|minor|patch)\b"
if [[ ! $component =~ $regex ]]; then
	exit 1
fi

yarn version $component

new_version=$(jq -r .version package.json)

git add --all
git commit -m "v$new_version"
git tag -m "v$new_version" $new_version
git push
git push --tags

