# steam-group

Simple node.js library for fetching Steam community group members.

## Installation

You can install this library using npm:
```
npm install steam-group
```

## Example Usage

Usage is simple. First, you need to create a group object:
```
var steamGroup = require('steam-group');

var group = steamGroup.fromName('fp_programmers');
// or
var group = steamGroup.fromId64('103582791430091926');
```

Once you have a group object, you can use several methods for retrieving member information:
```
// accepts callback(err, result)
// result is an array of 64-bit community ID strings
group.getMembers(callback);

// accepts callback(err, result)
// result is the 64-bit community ID string of the owner
group.getOwner(callback);

// same as group.getMembers
group.getOfficers(callback);
group.getModerators(callback);

// accepts callback(err, result)
// result is a boolean of whether or not the person is a member of this group
group.isMember(id, callback);

// accepts callback(err, result)
// result is either 'owner', 'officer', 'moderator', or 'member'
group.getMemberType(id, callback);
```

Group members are cached on the first use of the library (that is, the first time you use any of the functions). If you want to clear the cache without recreating the group object, you can use the clearCache function:
```
group.clearCache();
```

## License

The MIT License (MIT)

Copyright (c) 2015 Andrew Rogers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.