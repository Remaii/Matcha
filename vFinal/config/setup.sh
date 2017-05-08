#!/bin/sh

PATHDB=./data
FULL=./data/db
SCRIPT1=./config/addAdmin.js
SCRIPT2=./config/addUser.js

if [ ! -d "$FULL" ]; then
	echo '\n\n!!!!!!!!!!!!!!!!!!!!!!!!!!!! DataBase Not Exist !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n'
	mkdir -p "$FULL"
	sleep 1
	mongod --dbpath "$FULL" --port 28000 &
	sleep 5
	mongo --port 28000 < "$SCRIPT1" 
	sleep 4
	pkill mongod
	sleep 2
	mongod --dbpath "$FULL" --port 28000 --auth &
	sleep 5
	mongo --port 28000 -u "userAdmin" -p "AdminRthid3" --authenticationDatabase "admin" < "$SCRIPT2"
	sleep 5
	node config/gen.js all 50
	sleep 10
	pkill mongod
	sleep 2
	echo '\n\n!!!!!!!!!!!!!!!!!!!! DataBase Create and Configure Success !!!!!!!!!!!!!!!!!!!!\n\n'
	echo '\n\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!! DataBase Ready !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n'
	mongod --dbpath "$FULL" --port 28000 --auth
else
	echo '\n\n!!!!!!!!!!!!!!!!!!!!!!!!! Database Already Exist !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n'
	mongod --dbpath "$FULL" --port 28000 --auth
fi
