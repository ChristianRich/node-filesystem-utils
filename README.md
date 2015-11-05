# Node FileSystem Utils


## Installation
```js
npm install node-filesystem-utils
```

## Why?
When using the native Node filesystem API you interact with a single file at any given time, which I find limiting.
This module supports Java-style method overloading making it possible to pass a wider array of arguments.

For this module you can pass a single file or an Array of files making it possible to read or write one or many files with just one method call.

Features:
* Read / write one or multiple files with a single method call
* Automatically create non existing folders when saving files
* Append data to existing JSON files
* Get a list of all files in a directory (non recursive)
* Count the number of files in a directory (non recursive)
* Get File Objects from a file containing the file's mimetype, name, dir, path and extension

## Examples

### Save multiple files
```js
var fileUtils = require('node-filesystem-utils');

var manifest = [
    {
        path: '/Users/christianrich/test'),
        filename: 'file1.txt',
        data: 'this is same text for the 1st file'
    },

    {
        path: '/Users/christianrich/test'),
        filename: 'file1.txt',
        data: 'this is same text for the 2nd file'
    },

    {
        path: '/Users/christianrich/test'),
        filename: 'file3.txt',
        data: 'this is same text for the 3rd file'
    }
];

fileUtil.writeFiles(manifest, function(err, files){
    if(err) throw err;
    console.log(files);
});
```

### Read multiple files
```js
var fileUtils = require('node-filesystem-utils');

var manifest = [
    '/User/christianrich/test/1/myFile1.txt',
    '/User/christianrich/test/1/myFile2.txt',
    '/User/christianrich/test/1/myFile3.txt'
];

fileUtil.readFiles(manifest, 'utf8', function(err, files){
    if(err) throw err;
    console.log(files);
}
```

### Get the directory part of a path
```js
var fileUtils = require('node-filesystem-utils');

fileUtils.getDirectory('/Users/christianrich/test/someFile.txt'); // /Users/christianrich/test/
fileUtils.getDirectory('/Users/christianrich/test/'); // /Users/christianrich/test/
```

### Is a path a directory or a file?
```js
var fileUtils = require('node-filesystem-utils');

fileUtils.isDirectory('/Users/christianrich/'); // true
fileUtils.isDirectory('/Users/christianrich/test/someFile.txt'); // false
```

### Copy a file or directory not caring if the destination path exists
```js
var fileUtils = require('node-filesystem-utils');

fileUtils.copy('/Users/christianrich/folder1/', '/Users/christianrich/may-or-may-not-exist/', function(err, dest){
    if(err) throw err;
});
```

### Get a file descriptor object
```js
var fileUtils = require('node-filesystem-utils');
var fo = fileUtils.getFileObject('/Users/christianrich/myFile.txt');
```

Yields:

```js
{
    mimetype: 'text/plain',
    name: 'myFile.txt',
    path: '/Users/boom/myFile.txt',
    dir: '/Users/boom/',
    extension: 'txt'
}
```

### Append JSON to existing files
Assume we have the file 'example.json' saved on disc:
```js
{
    "myData": []
}
```

Let's manipulate the file and append an element to the 'myData' array.
First create a modifer function. This makes it possible to interact with the JSON structure in any which way you like hence decoupling the data modification from the file IO operation:

```js
var modifier = function(jsonObj, appendData, cb){
    jsonObj.data.push(appendData);
    cb(json);
};
```

Load the file passing in the modifier:

```js
fileUtil.appendJson('/Users/christianrich/example.json', 'hello', modifier, function(err, file){
    if(err) throw err;
});
```

Now the file on disc looks like this:
```js
{
    "myData": ['hello']
}
```

## Test
```js
mocha ./test
```

## Limitations
Only tested on Mac and Linux file systems. Will probably not work on Windows OS.

## File and folder permissions
When accessing files and folders the logged in user must have permissions to access these.
E.g on Amazon AWS EC2 Linux instances, if the default ec2-user tries to access folders above the /home directory you'll get EACCESS errors.

## My blog
[http://chrisrich.io](http://chrisrich.io)

## License
MIT

