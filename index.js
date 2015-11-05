var fs = require('fs-extra')
    , _ = require('lodash')
    , path = require('path')
    , async = require('async')
    , uuid = require('uuid')
    , mimetypes = require('mime-types');

/**
 * File utilities extending the native fs module
 */
var fileUtil = {

    /**
     * Writes a file and creates the directory structure should it not exist
     * @param {String} file         Filepath of the file to read
     * @param {String|buffer} data  The data you want to write to the file
     * @param {String} [encoding]   Possible encodings are 'ascii', 'utf8', and 'base64'. If no encoding provided, then 'utf8' is assumed.
     * @param {Function} callback
     */
    writeFile: function(file, data, encoding, callback){

        if(!file){
            return callback('Missing required parameter file', null);
        }

        if(!data){
            return callback('Missing required parameter data', null);
        }

        var cb,
            enc = 'utf8',
            dir = fileUtil.getDirectory(file);

        if(_.isFunction(encoding)){
            cb = encoding;
        } else if(_.isString(encoding)){
            enc = encoding;
        }

        if(_.isFunction(callback)){
            cb = callback;
        }

        if(!cb){
            throw new Error('Missing required parameter file');
        }

        fs.ensureDir(dir, function (err) {

            if(err){
                return cb(err, null);
            }

            fs.writeFile(file, data, enc, function (err) {
                cb(err, file);
            });
        })
    },

    /**
     * Write one or more files and creates the directory structure should it not exist
     * @param {Array} files Array of file objects : {path: '/myPath/myFile.txt', data: '123'} or {path: '/myPath', filename: 'myFile.txt', data: '123'}
     * @param {Function} callback
     */
    writeFiles: function(files, callback){

        if(!_.isArray(files)){
            return callback('Type array expected for parameter files', null);
        }

        _.each(files, function(file){

            if(!_.isObject(file)){
                return callback('Type object expected in files Array', null);
            }

            if(!file.path){
                return callback('Malformed file object in files array. Expected key path', null);
            }

            if(!file.data){
                return callback('Malformed file object in files array. Expected key data', null);
            }
        });

        async.mapLimit(files, 1, function(file, cb){

            if(file.filename){
                file.path = path.join(fileUtil.getDirectory(file.path), file.filename);
            }

            fileUtil.writeFile(file.path, file.data, function(err, file){

                if(err){
                    return cb(err, null);
                }

                cb(null, file);
            });
        }, function(err, results){

            if(err){
                return callback(err, null);
            }

            return callback(null, _.flatten(results));
        });
    },

    /**
     * Reads one or more files. Files' data is returned as an Array in the same order as the input order
     * @param {String|Array} files  A single path as String or an Array of paths
     * @param {Function} callback
     * @param {String} [encoding]
     */
    readFiles: function(files, encoding, callback){

        var queue,
            callbackFinal,
            enc;

        if(arguments.length === 2){

            if(_.isFunction(encoding)){
                callbackFinal = encoding;
            } else{
                return callback('Function expected as 2nd argument', null);
            }

            enc = null;
        }

        if(arguments.length === 3){

            enc = encoding;

            if(_.isFunction(callback)){
                callbackFinal = callback;
            } else{
                return callback('Function expected as 2nd argument', null);
            }
        }

        if(_.isString(files)){
            queue = [files];
        }

        else if(_.isArray(files)){
            queue = files;
        }

        else{
            return callback('String or Array expected for files', null);
        }

        // Reads a single file at a time so we can preserve the input / output order
        async.mapLimit(queue, 1, function(file, cb){

            fs.exists(file, function(exists) {

                if (!exists) {
                    return cb('File does not exist ' + file, null);
                }

                fs.readFile(file, enc, cb);
            });
        }, function(err, results){

            if(err){
                return callbackFinal(err, null);
            }

            return callbackFinal(null, _.flatten(results));
        });
    },

    /**
     * Appends data to an existing json file
     * @param {String} file                 The path
     * @param {Object|Array} appendData     The object to be appended
     * @param {Function} modifier           A function that modifies the loaded JSON object
     * @param callback
     */
    appendJson: function(file, appendData, modifier, callback){

        if(!_.isFunction(modifier)){
            return callback('Type function expected for parameter modifier');
        }

        fs.exists(file, function(exists) {

            if(!exists){
                return callback('File does not exist ' + file, null);
            }

            fs.readFile(file, 'utf8', function(err, fileData){

                if(err){
                    return callback(err, null);
                }

                if(!fileData || String(fileData).length === 0){
                    return callback('File is empty', null);
                }

                var json;

                try{
                    json = JSON.parse(fileData);
                } catch(e){
                    return callback('Error parsing JSON file ' + file, null);
                }

                var saveCallback = function(result){

                    if(!_.isObject(result)){
                        return callback('JSON object expected', null);
                    }

                    var resultStr = JSON.stringify(result);

                    fileUtil.writeFile(file, resultStr, function (err) {

                        if(err){
                            return callback(err, null);
                        }

                        callback(null, file);
                    });
                };

                modifier(json, appendData, saveCallback);
            });
        });
    },

    /**
     * Copies a file or directory and creates the dest folder structure should it not exist
     * @param {String} src
     * @param {String} dest
     * @param {Function} callback
     */
    copy: function(src, dest, callback){

        src = path.normalize(src);
        dest = path.normalize(dest);

        fs.exists(src, function (exists) {

            if (!exists) {
                return callback('src does not exist', null);
            }

            fs.ensureDir(fileUtil.getDirectory(dest), function (err) {

                if(err){
                    return callback(err, null);
                }

                fs.copy(src, dest, function (err) {
                    callback(err, dest);
                });
            });
        });
    },

    /**
     * Returns an Array of filepaths. Ignores system and hidden files starting with a dot.
     * @param {String} dir
     * @param {Function} callback
     */
    getFiles : function(dir, callback){

        var res = [];

        if(!fileUtil.isDirectory(dir)){
            dir = fileUtil.getDirectory(dir);
        }

        dir = path.normalize(dir);

        fs.exists(dir, function (exists) {

            if(!exists){
                return callback(null, res);
            }

            fs.readdir(dir, function (err, files) {

                if (err) {
                    return callback(err, null);
                }

                files.map(function (file) {
                    return path.join(dir, file);
                }).filter(function (file) {
                    return fs.statSync(file).isFile();
                }).forEach(function (file) {

                    var split = fileUtil.splitPath(file),
                        filename = split[split.length - 1];

                    if(filename.substr(0, 1) !== '.'){
                        res.push(file);
                    }
                });

                callback(null, res);
            });
        });
    },

    /**
     * Returns the file count for a given directory
     * @param {String } dir
     * @param {Function} callback
     */
    getFileCount : function(dir, callback){

        fileUtil.getFiles(dir, function(err, files){

            if(err){
                return callback(err, null);
            }

            callback(null, files.length);
        });
    },

    /**
     * Returns an incremental and unique file name
     * @param {String} filePath      The path of the resulting file
     * @param {String} extention     like json, xml, txt etc.
     * @param {Function} callback
     */
    getUniqueFilename: function(filePath, extention, callback){

        if(extention.indexOf('.') !== -1){
            extention = extention.replace('.', '');
        }

        fileUtil.getFileCount(filePath, function(err, count) {

            if (err) {
                return callback(err, null);
            }

            var countStr;

            if (count < 10) {
                countStr = String('0' + count);
            } else {
                countStr = count.toString();
            }

            var res = path.join(filePath, countStr + '_' + uuid.v1().replace(/-/g, '').substr(0, 6) + '.' + extention);
            callback(null, res);
        });
    },

    /**
     * Returns the directory part of a file path
     *
     * E.g
     * '/User/mike/project/myFile.txt' -> '/User/mike/project/'
     * '/User/mike/project/' -> '/User/mike/project/'
     * 'myFile.txt' -> '/'
     *
     * @param {String} filePath
     * @param {String} [delimiter]
     * @returns {String}
     */
    getDirectory : function(filePath, delimiter){

        var parts = fileUtil.splitPath(path.normalize(filePath), delimiter),
            res = '/';

        if(!parts.length){
            return res;
        }

        if(parts.length === 1 && parts[0].indexOf('.') !== -1){
            return res;
        }

        if(parts[parts.length - 1].indexOf('.') !== -1){
            parts.pop();
        }

        _.each(parts, function(part){
            res += part + (delimiter || '/');
        });

        return path.normalize(res);
    },

    /**
     * Returns true if filePath is a directory, rather that a directory and a file
     * E.g
     * '/example/myDirectory' // true
     * '/example/myDirectory/myFile.txt' // false
     * @param {String} filePath
     * @returns {boolean}
     */
    isDirectory : function(filePath){

        filePath = path.normalize(filePath);

        var parts = fileUtil.splitPath(filePath),
            last = parts[parts.length - 1];

        return last.indexOf('.') === -1;
    },

    /**
     * Splits a path into it's different sub parts
     * E.g '/example/myDirectory/myFile.txt' -> ['example', 'myDirectory', 'myFile.txt']
     *
     * @param {String} dir
     * @param {String} [delimiter]
     * @returns {Array}
     */
    splitPath : function(dir, delimiter){

        if(!dir){
            return [];
        }

        dir = path.normalize(dir);

        var res = [],
            parts = dir.split(delimiter || '/');

        _.each(parts, function(part){
            if(part.length){
                res.push(part);
            }
        });

        return res;
    },

    /**
     * Based on a filePath returns an object containing mimetype, name, dir, path and extension.
     * @param {String} filePath
     * @returns {Object}
     */
    getFileObject : function(filePath){

        if(!filePath) {
            return null;
        }

        filePath = path.normalize(filePath);

        var name,
            split = fileUtil.splitPath(filePath),
            ext = path.extname(filePath) || '';

        if(fileUtil.isDirectory(filePath)){
            name = '';
        } else{
            name = split[split.length - 1];
        }

        return {
            mimetype: mimetypes.lookup(filePath),
            name: name,
            path: filePath,
            dir: fileUtil.getDirectory(filePath),
            extension: ext.replace(/\./g, '')
        }
    }
};

module.exports = fileUtil;