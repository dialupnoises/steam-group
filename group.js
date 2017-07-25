var request = require("request"),
	xml2js  = require("xml2js"),
	cheerio = require("cheerio"),
	_       = require("lodash");

module.exports = function(url)
{
	var memberCache = {};
	var modCache = null;
	var officerCache = null;
	var ownerCache = null;
	var groupCount = 0;
	var loadedMembers = false;

	function getMembersPage(page, callback)
	{
		if(memberCache[page])
			return callback(null, memberCache[page]);

		return request(url + "/memberslistxml/?xml=1&p=" + page, function(err, res, body) {
			if(err)
				return callback(err, null);
			if(res.statusCode != 200)
				return callback("HTTP response code: " + res.statusCode, null);
			xml2js.parseString(body, function(err, data) {
				if(err)
					return callback(err, null);

				groupCount = parseInt(data.memberList.memberCount[0], 10);
				memberCache[page] = data.memberList.members[0].steamID64;
				callback(null, memberCache[page]);
			});
		});
	}

	function getMembers(limit, callback)
	{
		if(typeof limit == "function")
		{
			callback = limit;
			limit = Infinity;
		}

		var page = 1;
		var memberList = [];
		function innerLoop(callback)
		{
			getMembersPage(page++, function(err, members) {
				if(err)
					return callback(err, null);

				memberList = memberList.concat(members);
				if(memberList.length >= limit || memberList.length >= groupCount)
					return callback(null, memberList);

				innerLoop(callback);
			});
		}

		innerLoop(function(err, members) {
			if(err)
				return callback(err, null);

			loadedMembers = true;
			if(members.length > limit)
				return callback(null, members.slice(0, limit));
			return callback(null, members);
		});
	}

	function getImportantPeople(callback)
	{
		if(ownerCache == null)
		{
			return getMembers(1000, function(err, members) { 
				if(err) 
					return callback(err); 

				return request(url + "/members", function(err, res, body) {
					if(err) return callback(err);
					if(res.statusCode != 200)
						return callback("HTTP response code: " + res.statusCode);

					var $ = cheerio.load(body);
					var officerCount = $(".rank_icon[title='Group Officer']").length;
					var modCount = $(".rank_icon[title='Group Moderator']").length;

					ownerCache = members[0];
					officerCache = _.slice(members, 1, officerCount + 1);
					modCache = _.slice(members, officerCount + 1, officerCount + modCount + 1);
					callback(null);
				});
			});
		}
		callback(null);
	}

	function getOwner(callback)
	{
		if(ownerCache == null)
			return getImportantPeople(function(err) {
				if(err) return callback(err);
				callback(null, ownerCache);
			});
		callback(null, ownerCache);
	}

	function getOfficers(callback)
	{
		if(officerCache == null)
			return getImportantPeople(function(err) {
				if(err) return callback(err);
				callback(null, officerCache);
			});
		callback(null, officerCache);
	}

	function getModerators(callback)
	{
		if(modCache == null)
			return getImportantPeople(function(err) {
				if(err) return callback(err);
				callback(null, modCache);
			});
		callback(null, modCache);
	}

	function isMember(id, callback)
	{
		if(!loadedMembers)
			return callback("You need to call getMembers before calling isMember.");
		var keys = Object.keys(memberCache);
		// check all keys to see if any of them contain the id
		for(var i = 0; i < keys.length; i++)
		{
			if(memberCache[keys[i]].indexOf(id) != -1)
				return callback(null, true);
		}
		return callback(null, false);
	}
	
	function getMemberType(id, callback)
	{
		if(!loadedMembers)
			return getMembers(function(err, members) {
				if(err) return callback(err);
				getMemberType(id, callback);
			});
		if(id == ownerCache) return callback(null, "owner");
		if(_.indexOf(officerCache, id) != -1) return callback(null, "officer");
		if(_.indexOf(modCache, id) != -1) return callback(null, "moderator");
		if(_.indexOf(memberCache, id) != -1) return callback(null, "member");
		callback("User is not a member of this group.");
	}

	function clearCache()
	{
		memberCache = {};
		modCache = null;
		officerCache = null;
		ownerCache = null;
		loadedMembers = false;
	}

	return {
		getMembers: getMembers,
		getOwner: getOwner,
		getModerators: getModerators,
		getOfficers: getOfficers,
		getMemberType: getMemberType,
		isMember: isMember,
		clearCache: clearCache
	};
}