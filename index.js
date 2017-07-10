var group = require("./group");

exports.fromId64 = function(id) {
	return group("http://steamcommunity.com/gid/"+id);
}

exports.fromName = function(name) {
	return group("http://steamcommunity.com/groups/"+name);
}