var assert = require('assert')
    , should = require('should')
    , fileUtil = require('../')
    , fs = require('fs-extra')
    , path = require('path')
    , rmdir = require('rimraf')
    , _ = require('lodash');

var saveDir = path.join(__dirname, 'tmp/');

var progress = function(p){
    console.log(p.percent);
};

describe('File', function() {

    before(function(done){
        rmdir(saveDir, function(err){
            done(err);
        });
    });

    describe('writeFile', function () {

        var file = path.join(saveDir, 'writeFile', 'test.txt');

        it('should return a file path when saving a file', function (done) {

            fileUtil.writeFile(file, '1234', function(err, res){
                should.not.exist(err);
                should.exist(res);
                res.should.be.a.String();
                res.should.equal(file);
                done();
            });
        });

        it('should return the file contents when loading a file', function (done) {

            fileUtil.readFiles(file, 'utf8', function(err, res){
                should.not.exist(err);
                should.exist(res);
                res.should.be.a.Array();
                res[0].should.equal('1234');
                done();
            });
        });

        it('should return a file path when saving a file utf-8  encoding', function (done) {

            fileUtil.writeFile(file, '1234', 'utf8', function(err, res){
                should.not.exist(err);
                should.exist(res);
                res.should.be.a.String();
                res.should.equal(file);
                done();
            });
        });

        it('should return a file path when saving a file base64 encoding', function (done) {

            fileUtil.writeFile(file, '1234', 'base64', function(err, res){
                should.not.exist(err);
                should.exist(res);
                res.should.be.a.String();
                res.should.equal(file);
                done();
            });
        });
    });

    describe('writeFiles', function () {

        var filesFormat1 = [
            {
                path: path.join(saveDir, 'writeFiles', '1'),
                filename: 'file1.txt',
                data: 'file1'
            },

            {
                path: path.join(saveDir, 'writeFiles', '1'),
                filename: 'file2.txt',
                data: 'file2'
            },

            {
                path: path.join(saveDir, 'writeFiles', '1'),
                filename: 'file3.txt',
                data: 'file3'
            }
        ];

        var filesFormat2 = [
            {
                path: path.join(saveDir, 'writeFiles', '2', 'text1.txt'),
                data: 'file1'
            },

            {
                path: path.join(saveDir, 'writeFiles', '2', 'text2.txt'),
                data: 'file2'
            },

            {
                path: path.join(saveDir, 'writeFiles', '2', 'text3.txt'),
                data: 'file3'
            }
        ];

        var filesFormat3 = [
            {
                path: path.join(saveDir, 'writeFiles', '3', 'text1.txt'),
                data: 'file1'
            },

            {
                path: path.join(saveDir, 'writeFiles', '3'),
                filename: 'file2.txt',
                data: 'file2'
            },

            {
                path: path.join(saveDir, 'writeFiles', '3', 'text3.txt'),
                data: 'file3'
            }
        ];

        var filesFormat4 = [
            {
                path: path.join(saveDir, 'writeFiles', '4', 'text1.txt')
            }
        ];

        it('should return an array of file paths when saving files', function (done) {

            fileUtil.writeFiles(filesFormat1, function(err, files){
                should.not.exist(err);
                should.exist(files);
                files.should.be.a.Array();
                (files.length).should.be.exactly(3);
                return done();
            });
        });

        it('should return an array of file paths when saving files', function (done) {

            fileUtil.writeFiles(filesFormat2, function(err, files){
                should.not.exist(err);
                should.exist(files);
                files.should.be.a.Array();
                (files.length).should.be.exactly(3);
                return done();
            });
        });

        it('should return an array of file paths when saving files', function (done) {

            fileUtil.writeFiles(filesFormat3, function(err, files){
                should.not.exist(err);
                should.exist(files);
                files.should.be.a.Array();
                (files.length).should.be.exactly(3);
                return done();
            });
        });
    });

    describe('readFiles', function(){

        var p = path.join(saveDir, 'writeFiles', '4');

        before(function(done){

            var manifest = [
                {
                    path: p,
                    filename: 'readTest1.txt',
                    data: 'file1'
                },

                {
                    path: p,
                    filename: 'readTest2.txt',
                    data: 'file2'
                },

                {
                    path: p,
                    filename: 'readTest3.txt',
                    data: 'file3'
                }
            ];

            fileUtil.writeFiles(manifest, function(err, files){

                if(err){
                    throw err;
                }

                done();
            });
        });

        it('should read 3 files', function (done) {

            var manifest = [
                path.join(saveDir, 'writeFiles', '4', 'readTest1.txt'),
                path.join(saveDir, 'writeFiles', '4', 'readTest2.txt'),
                path.join(saveDir, 'writeFiles', '4', 'readTest3.txt')
            ];

            fileUtil.readFiles(manifest, 'utf8', function(err, files){
                assert(err === null, 'There should not be an error');
                assert(_.isArray(files), 'Files should be an Array');
                assert(files.length === 3, 'Expect 3 items');
                assert(files[0] === 'file1');
                assert(files[1] === 'file2');
                assert(files[2] === 'file3');
                done();
            });
        });
    });

    describe('getFileCount', function(){

        var p = path.join(saveDir, 'writeFiles', '5');

        before(function(done){

            var manifest = [
                {
                    path: p,
                    filename: 'readTest1.txt',
                    data: 'file1'
                },

                {
                    path: p,
                    filename: 'readTest2.txt',
                    data: 'file2'
                },

                {
                    path: p,
                    filename: 'readTest3.txt',
                    data: 'file3'
                }
            ];

            fileUtil.writeFiles(manifest, function(err, files){

                if(err){
                    throw err;
                }

                done();
            });
        });

        it('should contain 3 files', function(done){

            fileUtil.getFileCount(p, function(err, numFiles){
                assert(err === null, 'There should not be an error');
                assert(_.isNumber(numFiles), 'numFiles should be Number');
                assert(numFiles === 3, 'There should be 3 files in the target folder');
                done();
            });
        });
    });

    describe('appendJson', function () {

        var jsonFile = path.join(saveDir, 'appendJson', 'test.json');

        var modifier = function(json, appendData, cb){
            json.data.push(appendData);
            cb(json);
        };

        before(function(done) {
            fileUtil.writeFile(jsonFile, JSON.stringify({data:[]}), function(err, file){
                done();
            });
        });

        it('should return a file with appended json', function (done) {

            fileUtil.appendJson(jsonFile, 'hello', modifier, function(err, files){
                should.not.exist(err);
                should.exist(files);
                return done();
            });
        });

        it('loading the file, should contain the apended data', function (done) {

            fileUtil.readFiles(jsonFile, 'utf8', function(err, res){

                should.not.exist(err);
                should.exist(res);

                var json;

                try{
                    json = JSON.parse(res);
                } catch(e){
                    return done(e);
                }

                should.exist(json);
                should.exist(json.data);
                json.should.be.a.Object();
                json.data.should.be.a.Array();
                (json.data.length).should.be.exactly(1);
                done();
            });
        });
    });

    describe('getFileObject', function () {

        it('should return a file object with 5 keys', function (done) {

            var res = fileUtil.getFileObject('/Users/boom/myFile.txt');

            should.exist(res);
            res.should.be.a.Object();
            res.mimetype.should.be.a.String();
            (res.mimetype).should.be.exactly('text/plain');
            res.name.should.be.a.String();
            res.name.should.be.exactly('myFile.txt');
            res.path.should.be.a.String();
            res.path.should.be.exactly('/Users/boom/myFile.txt');
            res.dir.should.be.a.String();
            res.dir.should.be.exactly('/Users/boom/');
            res.extension.should.be.a.String();
            res.extension.should.be.exactly('txt');
            done();
        });

        it('should return a file object with 5 keys', function (done) {

            var res = fileUtil.getFileObject('///Users///boom/myFile.boo.txt');

            should.exist(res);
            res.should.be.a.Object();
            res.mimetype.should.be.a.String();
            (res.mimetype).should.be.exactly('text/plain');
            res.name.should.be.a.String();
            res.name.should.be.exactly('myFile.boo.txt');
            res.path.should.be.a.String();
            res.path.should.be.exactly('/Users/boom/myFile.boo.txt');
            res.dir.should.be.a.String();
            res.dir.should.be.exactly('/Users/boom/');
            res.extension.should.be.a.String();
            res.extension.should.be.exactly('txt');
            done();
        });

        it('should return a file object with 5 keys, where mimetype is false', function (done) {

            var res = fileUtil.getFileObject('/Users/boom/');

            should.exist(res);
            res.should.be.a.Object();
            res.mimetype.should.be.a.Boolean();
            (res.mimetype).should.be.exactly(false);
            res.name.should.be.a.String();
            res.path.should.be.a.String();
            res.dir.should.be.a.String();
            res.extension.should.be.a.String();
            done();
        });

        it('should return null when null length string is passed', function (done) {

            var res = fileUtil.getFileObject('');
            should.not.exist(res);
            done();
        });

        it('should return null when null is passed', function (done) {

            var res = fileUtil.getFileObject(null);
            should.not.exist(res);
            done();
        });

        it('should return null when undefined is passed', function (done) {

            var res = fileUtil.getFileObject();
            should.not.exist(res);
            done();
        });
    });

    describe('splitPath', function () {

        it('should return a split path in an Array with the size of 3', function (done) {

            var res = fileUtil.splitPath('/path1/path2/myFile.txt');
            should.exist(res);
            res.should.be.a.Array();
            (res.length).should.be.exactly(3);

            done();
        });

        it('should return a split path in an Array with the size of 8', function (done) {

            var res = fileUtil.splitPath('/path1/path2/path3/path4/path5/path6/path7/myFile.txt');
            should.exist(res);
            res.should.be.a.Array();
            (res.length).should.be.exactly(8);

            done();
        });

        it('should return an null length Array ', function (done) {

            var res = fileUtil.splitPath('');
            should.exist(res);
            res.should.be.a.Array();
            (res.length).should.be.exactly(0);

            done();
        });

        it('should return an null length Array ', function (done) {

            var res = fileUtil.splitPath();
            should.exist(res);
            res.should.be.a.Array();
            (res.length).should.be.exactly(0);

            done();
        });
    });

    describe('isDirectory', function () {

        it('should return true', function (done) {
            var res = fileUtil.isDirectory(saveDir);
            should.exist(res);
            should(res).be.a.Boolean();
            should(res).be.exactly(true);
            done();
        });

        it('should return false', function (done) {
            var res = fileUtil.isDirectory(path.join(saveDir, 'myFile.json'));
            should.exist(res);
            should(res).be.a.Boolean();
            should(res).be.exactly(false);
            done();
        });

        it('should return false', function (done) {
            var res = fileUtil.isDirectory('hello');
            should.exist(res);
            should(res).be.a.Boolean();
            should(res).be.exactly(true);
            done();
        });
    });

    describe('getDirectory', function () {

        it('Testing: /path1/path2/path3/myFile.txt', function (done) {
            var res = fileUtil.getDirectory('/path1/path2/path3/myFile.txt');
            should.exist(res);
            should(res).be.a.String();
            should(res).be.exactly('/path1/path2/path3/');
            done();
        });

        it('Testing: path1////path2/path3//myFile.txt', function (done) {
            var res = fileUtil.getDirectory('path1////path2/path3//myFile.txt');
            should.exist(res);
            should(res).be.a.String();
            should(res).be.exactly('/path1/path2/path3/');
            done();
        });

        it('Testing /', function (done) {
            var res = fileUtil.getDirectory('/');
            should.exist(res);
            should(res).be.a.String();
            should(res).be.exactly('/');
            done();
        });

        it('Testing /myFile.txt', function (done) {
            var res = fileUtil.getDirectory('/myFile.txt');
            should.exist(res);
            should(res).be.a.String();
            should(res).be.exactly('/');
            done();
        });

        it('Testing myFile.txt/', function (done) {
            var res = fileUtil.getDirectory('myFile.txt/');
            should.exist(res);
            should(res).be.a.String();
            should(res).be.exactly('/');
            done();
        });

        it('Testing ///myFile.txt/', function (done) {
            var res = fileUtil.getDirectory('///myFile.txt/');
            should.exist(res);
            should(res).be.a.String();
            should(res).be.exactly('/');
            done();
        });

        it('Testing ///myFile.txt////', function (done) {
            var res = fileUtil.getDirectory('///myFile.txt////');
            should.exist(res);
            should(res).be.a.String();
            should(res).be.exactly('/');
            done();
        });
    });
});