use matcha
db.createUser({
	user: "UserMatcha",
	pwd: "MatchRthid3",
	roles: [{role:"readWrite", db:"matcha"}]
})
quit()