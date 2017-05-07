use admin
db.createUser({
	user: "userAdmin",
	pwd: "AdminRthid3",
	roles: [ { role: "userAdminAnyDatabase", db: "admin"} ]
})
quit()