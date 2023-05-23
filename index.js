/** 
 *  Thanks Chat4.
 * 
 * Instructions to Chat
 * i will send you the content of two files, avahi_hosts__climate-http.json.145 and avahi_hosts__climate-http.json. They are json and within, one file may have more or less entries, or the IPs may be different or the hostname. The schema will be the same. please write me nodejs code that will called by cli that accepts two filenames, compares the contents and then outputs the diffs as a csv file.
 * 
 * I have json arrays. Ask me for the contents of the two sample files and then show me updated coded.
 * 
 * 
 * 
 This script works as follows:

It reads the contents of two JSON files.
Parses the contents into JSON objects.
Finds the difference between two JSON objects using the diff function from the json-diff module.
Transforms the difference into a CSV string.
Writes the CSV string into a file.
In this code, I am using lodash's _.differenceWith function to compare two arrays of objects. This function compares two arrays and returns the elements present in the first array but not in the second array. Comparison between elements is done using _.isEqual function which performs a deep comparison between two values to determine if they are equivalent.

The convertArrayToMap function is used to convert JSON array to a map object using 'name' property as the key for easier comparison.

Please note that this code will only report items in the first file that are not present in the second file. If you also want to find items present in the second file but not in the first one, you need to call _.differenceWith(json2, json1, _.isEqual) as well.

Also, this script considers that all items in the array have a unique 'name' field. If this is not the case, you may need to adjust the code to fit your needs.


* 
*/


const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const { Parser } = require('json2csv');

const compareFiles = (file1, file2, fields) => {
  let rawdata1 = fs.readFileSync(file1);
  let rawdata2 = fs.readFileSync(file2);

  let json1 = JSON.parse(rawdata1);
  let json2 = JSON.parse(rawdata2);

  let trimmedJson1 = json1.map(item => _.pick(item, fields));
  let trimmedJson2 = json2.map(item => _.pick(item, fields));

  let differences = _.differenceWith(trimmedJson1, trimmedJson2, _.isEqual);

  return differences;
};

const writeCSV = (diff, outputFile) => {
  try {
    const parser = new Parser();
    const csv = parser.parse(diff);
    fs.writeFileSync(outputFile, csv);
    console.log("CSV file created successfully!");
  } catch (err) {
    console.error(err);
  }
};

const deleteFile = (filePath) => {
  try {
    fs.unlinkSync(filePath);
    console.log("File deleted successfully!");
  } catch (err) {
    console.error("Error deleting file: ", err);
  }
};

const listFilesWithSuffix = (filePath, excludeFilePath) => {
  let dir = path.dirname(filePath);
  let baseName = path.basename(filePath);
  let excludeFileName = path.basename(excludeFilePath);
  let files = fs.readdirSync(dir);
  let regex = new RegExp('^' + baseName + '\\.\\d+$');
  return files.filter(file => file !== excludeFileName && regex.test(file)).map(file => path.join(dir, file));
};

const file1 = process.argv[2];
const file2 = process.argv[3];
const outputFile = process.argv[4];
const fields = process.argv[5].split(',');
const deleteFlag = process.argv.includes('--delete');

const differences = compareFiles(file1, file2, fields);

if (differences.length > 0) {
  console.log(differences.length);
  console.log(differences);
  writeCSV(differences, outputFile);
} else {
  console.log("Did not find any changes. Deleting older backup file.");

  // Get all files matching the pattern
  let files = listFilesWithSuffix(file2, file1);

  // Delete all files with no diff from file1
  let deleteCount = 0;
  files.forEach(file => {
    let diff = compareFiles(file1, file2, fields);
    if (diff.length === 0) {
      deleteCount++;
      if (deleteFlag) {
        deleteFile(file);
      } else {
        console.log("If delete enabled, would have deleted file: " + file);
      }
    }
  });

  // todo: this could be part of the list of files to delete even tho it is the file keying the deletes
  if (deleteFlag) {
    deleteFile(file1);
  } else {
    console.log("If delete enabled, would have deleted file: " + file1);
  }

  console.log("Delete count (if enabled) would be (not inlcuding key del file): " + deleteCount);
}
