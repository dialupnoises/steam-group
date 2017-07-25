var steamGroup = require("./index");

var group = steamGroup.fromName("brutalmoose");

group.getMembers(function(err, members) {
	if(err)
		throw err;
	console.log("members");
	console.dir(members);

	group.isMember("76561198005846463", function(err, result) {
		if(err)
			throw err;
		console.log("76561198005846463: " + result);
	});
});

group.getOwner(function(err, owner) {
	if(err)
		throw err;
	console.log("owner: " + owner);
});

group.getOfficers(function(err, officers) {
	if(err)
		throw err;
	console.log("officers");
	console.dir(officers);
});

group.getModerators(function(err, moderators) {
	if(err)
		throw err;
	console.log("moderators");
	console.dir(moderators);
});