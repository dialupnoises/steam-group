var request = require('request'),
	xml2js  = require('xml2js'),
	cheerio = require('cheerio'),
	_       = require('lodash');

module.exports = function(url)
{
	var memberCache = null;
	var modCache = null;
	var officerCache = null;
	var ownerCache = null;

	function getMembers(callback)
	{
		if(memberCache == null)
		{
			return request(url + '/memberslistxml/?xml=1', function(err, res, body) {
				if(err)
					return callback(err);
				if(res.statusCode != 200)
					return callback('HTTP response code: ' + res.statusCode);
				xml2js.parseString(body, function(err, data) {
					if(err) return callback(err);
					memberCache = data.memberList.members[0].steamID64;
					callback(null, memberCache);
				});
			});
		}
		callback(null, memberCache);
	}

	function getImportantPeople(callback)
	{
		if(ownerCache == null)
		{
			if(memberCache == null)
				return getMembers(function(err, result) { if(err) return callback(err); getImportantPeople(callback); });
			return request(url + '/members', function(err, res, body) {
				if(err) return callback(err);
				if(res.statusCode != 200)
					return callback('HTTP response code: ' + res.statusCode);
				var $ = cheerio.load(body);
				var officerCount = $('.rank_icon[title="Group Officer"]').length;
				var modCount = $('.rank_icon[title="Group Moderator"]').length;

				ownerCache = memberCache[0];
				officerCache = _.slice(memberCache, 1, officerCount + 1);
				modCache = _.slice(memberCache, officerCount + 1, officerCount + modCount + 1);
				callback(null);
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
		if(memberCache == null)
			return getMembers(function(err, members) {
				if(err) return callback(err);
				callback(null, _.indexOf(memberCache, id) != -1);
			});
		callback(null, _.indexOf(memberCache, id) != -1);
	}
	
	function getMemberType(id, callback)
	{
		if(memberCache == null)
			return getMembers(function(err, members) {
				if(err) return callback(err);
				getMemberType(id, callback);
			});
		if(id == ownerCache) return callback(null, 'owner');
		if(_.indexOf(officerCache, id) != -1) return callback(null, 'officer');
		if(_.indexOf(modCache, id) != -1) return callback(null, 'moderator');
		if(_.indexOf(memberCache, id) != -1) return callback(null, 'member');
		callback('User is not a member of this group.');
	}

	function clearCache()
	{
		memberCache = null;
		modCache = null;
		officerCache = null;
		ownerCache = null;
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