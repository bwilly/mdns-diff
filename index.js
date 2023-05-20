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
const { Parser } = require('json2csv');

// Function to convert JSON array to map for easy comparison
const convertArrayToMap = (arr, keyField) =>
  Object.assign({}, ...arr.map(item => ({ [item[keyField]]: item })))

const compareFiles = (file1, file2) => {
  let rawdata1 = fs.readFileSync(file1);
  let rawdata2 = fs.readFileSync(file2);

  let json1 = JSON.parse(rawdata1);
  let json2 = JSON.parse(rawdata2);

  let map1 = convertArrayToMap(json1, 'name');
  let map2 = convertArrayToMap(json2, 'name');

  // Now, compare these maps using lodash
  let differences = _.differenceWith(json1, json2, _.isEqual);

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

const file1 = process.argv[2];
const file2 = process.argv[3];
const outputFile = process.argv[4];

const differences = compareFiles(file1, file2);
console.log("running...");
console.log(differences);
writeCSV(differences, outputFile);

