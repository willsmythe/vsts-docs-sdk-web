"use strict";

var child_process = require('child_process');
var fs = require('fs');
var fse = require('fs-extra');
var glob = require('glob');
var path = require('path');
var yaml = require('js-yaml');

var src = 'src/vss-web-extension-sdk';
var packageMappingFileRelativePath = 'package_service_mapping.json';
var repoRelativePath = 'repo.json';
var dest = 'docs-ref-autogen';
var filenameMaxLength = 100;
var packagesToFilter = [];


// 1. prepare
fse.removeSync(dest);
fse.mkdirpSync(dest);

var tsconfigs = glob.sync(path.join(src, '**/tsconfig.json'));

tsconfigs.forEach(function (tsconfig) {
    var packagePath = tsconfig.replace('tsconfig.json', 'package.json');
    generatePackageDoc(packagePath, dest);
});
process.exit(0);

function generatePackageDoc(packagePath, dest) {
    var dir = path.dirname(packagePath);
    var packageName = fse.readJsonSync(packagePath).name;
    if (packagesToFilter.indexOf(packageName) < 0) {
        console.log(packageName);
        var sourceCodeBasePath = dir + '/typings';
        if (fse.existsSync(sourceCodeBasePath)) {
            var packageDest = dest + '/' + packageName;
            fse.mkdirpSync(packageDest);
            child_process.execSync('typedoc --json ' + dir + '/api.json ' + dir + '/typings --module commonjs --ignoreCompilerErrors --includeDeclarations --exclude **/node_modules/**');
            var basePath = sourceCodeBasePath.replace(src + '/', '');
            child_process.execFileSync('node', ['node_modules/type2docfx/dist/main', dir + '/api.json', packageDest,
             '--hasModule', '--basePath', basePath]);
        } else {
            console.log('No source file for ' + packageName);
        }
    }
}