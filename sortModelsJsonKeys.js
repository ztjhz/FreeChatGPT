import fs from 'fs/promises';

// Function to recursively sort object keys
function sortObjectKeys(obj) {
    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys);
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).sort().reduce((sortedObj, key) => {
            sortedObj[key] = sortObjectKeys(obj[key]);
            return sortedObj;
        }, {});
    }
    return obj;
}

// Read the JSON file
async function processJsonFile(inputFilePath, outputFilePath) {
    try {
        const data = await fs.readFile(inputFilePath, 'utf8');
        
        // Parse the JSON data
        const jsonData = JSON.parse(data);

        // Sort the JSON data
        const sortedJsonData = sortObjectKeys(jsonData);

        // Convert the sorted JSON data back to a string
        const sortedJsonString = JSON.stringify(sortedJsonData, null, 2);

        // Write the sorted JSON data to a new file
        await fs.writeFile(outputFilePath, sortedJsonString, 'utf8');
        console.log('File has been saved with sorted keys.');
    } catch (err) {
        console.error('Error processing the file:', err);
    }
}

// Define file paths
const inputFilePath = 'models.json';
const outputFilePath = 'public/models.json';

// Process the JSON file
processJsonFile(inputFilePath, outputFilePath);