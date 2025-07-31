#!/bin/bash

if [ -n "$1" ]; then
 target=$1
else
  echo "no target specified"
  exit
fi

path="/srv/tron"

INFO='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${INFO}*** rsync${NC}"

rsync --delete-after --filter=":e- .gitignore" --filter "- .git/" -v -a . $target:$path/deploy

ssh $target bash <<EOF
cd $path

mkdir -p run/node_modules

echo -e "${INFO}*** copy deploy to build${NC}"
cp -a deploy build
echo -e "${INFO}*** copy node_modules to build${NC}"
cp -a run/node_modules build/
cd build

echo -e "${INFO}*** npm install${NC}"
npm install
cd ..

echo -e "${INFO}*** restart service${NC}"
sudo systemctl stop tron.service
rm -rf run
mv build run
sudo systemctl start tron.service

echo -e "${INFO}*** done${NC}"
EOF
