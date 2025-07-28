#!/bin/bash

if [ -n "$1" ]; then
 target=$1
else
  echo "no target specified"
  exit
fi

path="/srv/tron"

rsync --delete-after --filter=":e- .gitignore" --filter "- .git/" -v -a . $target:$path/deploy

ssh $target bash <<EOF
cd $path
pwd

echo
echo "*** copy deploy to build"
echo
cp -a deploy build
cd build

echo
echo "*** npm install"
echo
npm install
cd ..

echo
echo "*** restart service"
echo
sudo systemctl stop tron.service && rm -rf run
mv build run
sudo systemctl start tron.service
EOF
