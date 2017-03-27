var fs = require('fs');
var path = require('path');

var queryStrings = ['ribs','chicken','jerky','tenderloin','jalapeno','lorem'];


/***************** reading files *********************/

var dirToRead = '../../Biglpsum/';

var extFilter = 'txt';

function extension(element) {
    var extName = path.extname(element);
    return (extName === '.' + extFilter);
};

var walk = function(dir, done) {
    var results = [];

    var files = fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var i = 0;

        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = dir + '/' + file;
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }

            });
        })();
    });
};

if (process.argv.length <= 2) {
    //console.log(process.argv.length);
    //recursively grab all files in directory
    console.log("--------------------------------------------------------------------------------------------------------");
    console.log("To search for a string in a specific file use flags: --lookup for search string, --file for file to search.");
    console.log("For Example: node public/javascripts/readDir.js --lookup tenderloin --file ./Biglpsum/BaconIpsum.txt");
    console.log("--------------------------------------------------------------------------------------------------------");

    walk(dirToRead, function (err, results) {
        console.log(err);
        if (err) throw err;

        //filter out only .txt extension
        results = results.filter(extension);
        //print array of files
        //console.log(results);
        console.log("Number of files = " + results.length);

        results.forEach(function (fileName) {
            var file = path.join(dirToRead, fileName);
            var resultsArray = [];

            fs.readFile(fileName, "utf8", function (err, contents) {
                console.log("File: " + file);
                if (err) {
                    if (err.code === 'ENOENT') {
                        console.log('File not found!');
                        process.exit(1);
                    } else {
                        throw err;
                    }
                }

                queryStrings.forEach(function (queryString) {
                    index = contents.indexOf(queryString);
                    var foundCount = 0;
                    //found once
                    if (index > -1) {
                        var stepLocation = index;
                        foundCount++;
                        var smallContents = contents;
                        while (stepLocation > -1) {
                            smallContents = smallContents.substr(stepLocation + queryString.length);
                            stepLocation = smallContents.indexOf(queryString);
                            foundCount++;
                        }
                    }
                    console.log("Occurrences of " + queryString + " = " + foundCount);
                });
            });

        });
    });
}
else{
    var stringToUse;
    var fileToSearch;
    var resultsArray = [];
    var index;
    var count = 0;

    process.argv.forEach((val, index) => {
        // console.log(`${index}: ${val}`);

        if(val == "--file"){
            fileToSearch = process.argv[index+1];
            // console.log("fileToSearch = " + fileToSearch);
        }
        if(val == "--lookup"){
            stringToUse = process.argv[index+1];
            // console.log("stringToUse = " + stringToUse);
        }

    });

    fs.readFile(fileToSearch, "utf8", function(err,contents) {
        //console.log(err);
        if (err) {
            if (err.code === 'ENOENT') {
                console.log('File not found!');
                process.exit(1);
            } else {
                throw err;
            }
        }
        index = contents.indexOf(stringToUse);
        //found once
        if (index > -1) {
            var stepLocation = index;
            //console.log(stepLocation);
            count++;
            while (stepLocation > -1) {
                //console.log(contents);
                contents = contents.substr(stepLocation + stringToUse.length);
                stepLocation = contents.indexOf(stringToUse);
                //console.log(stepLocation);
                resultsArray.push(contents.substr(stepLocation - 15, stringToUse.length + 30));
                count++;
            }
        }
        console.log(stringToUse + " found in " + fileToSearch + " " + count + " times");
        console.log(resultsArray)
    });
}


