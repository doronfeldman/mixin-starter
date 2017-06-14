#!/usr/bin/env node

// Node dependencies
const path = require('path');
const util = require('util');

// External dependencies
const commandLineArgs = require('command-line-args')
const fs = require('fs-extra')
const colors = require('colors');
const replaceStream = require('replacestream')
const replaceall = require("replaceall");


const excludedDirs = ['packages', 'bin', 'logs', 'obj', '.vs']
const excludedFileExtensions = ['.user', '.vspscc', '.dll', '.pdb']
const replaceName = "StarterProject"

const optionDefinitions = [
  { name: 'source', alias: 's', type: String},
  { name: 'dest', alias: 'd', type: String},
  { name: 'project', alias: 'p', type: String, defaultOption: true },
]

const options = commandLineArgs(optionDefinitions)

if (!options.project) {
    console.log('a project name is required, e.g.: -p MyNewProject (-p optimal)'.red);
    process.exit(1)
}

if (!options.source) {
    console.log('a source folder for StarterProject is required, e.g.: -s "C:\\Projects\\Mixin\\StarterProject"'.red);
    process.exit(1)
}

const sourceDir = path.normalize(options.source)
const destDir = options.dest ? options.dest : process.cwd()
const newProjectName = options.project

if (!fs.existsSync(sourceDir)) {
    console.log(util.format('source folder not found at %s', sourceDir).red);
    process.exit(1)
}

fs.ensureDirSync(destDir)

function readDirectory(dirRelativePath) {
    fs.readdir(path.join(sourceDir, dirRelativePath))
        .then(directoryContent => {
            directoryContent.forEach(currDirOrFile => {
                if (fs.statSync(path.join(sourceDir, dirRelativePath, currDirOrFile)).isDirectory()) {
                    if (!excludedDirs.includes(currDirOrFile)) {
                        fs.ensureDirSync(path.join(destDir, replaceall(replaceName, newProjectName, dirRelativePath), replaceall(replaceName, newProjectName, currDirOrFile)))
                        readDirectory(path.join(dirRelativePath, currDirOrFile))
                    } else {
                        console.log(util.format('ignore directory "%s"', path.join(dirRelativePath, currDirOrFile)).cyan);
                    }
                } else {
                    readFile(path.join(dirRelativePath, currDirOrFile))
                }
            })
        })
}

function readFile(fileRelativePath) {
    if (!excludedFileExtensions.includes(path.extname(fileRelativePath))) {
        fs.createReadStream(path.join(sourceDir, fileRelativePath))
            .pipe(replaceStream(replaceName, newProjectName))
            .pipe(fs.createWriteStream(path.join(destDir, replaceall(replaceName, newProjectName, fileRelativePath))))
    } else {
        console.log(util.format('ignore file "%s"', fileRelativePath).cyan);
    }
}

readDirectory('');
