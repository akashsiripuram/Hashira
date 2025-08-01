const fs = require('fs');

// Function to convert a number from any base to decimal
function convertFromBase(value, base) {
    return BigInt(parseInt(value, base));
}

// Function to perform Lagrange interpolation and find the constant term
function lagrangeInterpolation(points, k) {
    let secret = 0n;
    
    // We only need the first k points
    const selectedPoints = points.slice(0, k);
    
    // Calculate the constant term using Lagrange interpolation
    for (let i = 0; i < selectedPoints.length; i++) {
        const xi = BigInt(selectedPoints[i].x);
        const yi = selectedPoints[i].y;
        
        // Calculate the Lagrange basis polynomial Li(0)
        let numerator = 1n;
        let denominator = 1n;
        
        for (let j = 0; j < selectedPoints.length; j++) {
            if (i !== j) {
                const xj = BigInt(selectedPoints[j].x);
                numerator *= (0n - xj);  // (0 - xj)
                denominator *= (xi - xj); // (xi - xj)
            }
        }
        
        // Add this term to the secret
        secret += yi * numerator / denominator;
    }
    
    return secret;
}

// Function to solve the secret sharing problem
function solveShamirSecretSharing(filename) {
    try {
        // Check if file exists
        if (!fs.existsSync(filename)) {
            console.error(`Error: File '${filename}' not found.`);
            console.log('Please create a JSON file with the test case data.');
            return null;
        }

        // Read and parse the JSON file
        const data = JSON.parse(fs.readFileSync(filename, 'utf-8'));
        
        // Validate required fields
        if (!data.keys || !data.keys.n || !data.keys.k) {
            console.error('Error: Invalid JSON format. Missing keys.n or keys.k');
            return null;
        }

        const n = data.keys.n;
        const k = data.keys.k;
        
        console.log(`Reading input from: ${filename}`);
        console.log(`Number of roots provided (n): ${n}`);
        console.log(`Minimum roots required (k): ${k}`);
        console.log(`Polynomial degree: ${k - 1}`);
        console.log('');
        
        // Convert input points
        let points = [];
        for (const key in data) {
            if (key === 'keys') continue;
            
            const x = parseInt(key);
            const base = parseInt(data[key].base);
            const value = data[key].value;
            
            if (!base || !value) {
                console.error(`Error: Invalid data for key ${key}`);
                continue;
            }
            
            const y = convertFromBase(value, base);
            
            points.push({ x, y });
            console.log(`Point ${x}: base ${base}, value "${value}" → decimal ${y.toString()}`);
        }
        
        // Validate we have enough points
        if (points.length < k) {
            console.error(`Error: Not enough points. Need ${k}, got ${points.length}`);
            return null;
        }
        
        // Sort points by x value for consistency
        points.sort((a, b) => a.x - b.x);
        
        console.log('');
        
        // Find the secret (constant term) using Lagrange interpolation
        const secret = lagrangeInterpolation(points, k);
        
        console.log(`The secret (constant term): ${secret.toString()}`);
        return secret;
        
    } catch (error) {
        console.error('Error reading or parsing JSON file:', error.message);
        return null;
    }
}

// Main function to handle command line arguments
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node index.js <json_file>');
        console.log('');
        console.log('Example: node index.js input.json');
        console.log('');
        console.log('The JSON file should contain the test case in the following format:');
        console.log(`{
  "keys": {
    "n": 4,
    "k": 3
  },
  "1": {
    "base": "10",
    "value": "4"
  },
  "2": {
    "base": "2",
    "value": "111"
  },
  ...
}`);
        return;
    }
    
    const filename = args[0];
    solveShamirSecretSharing(filename);
}

// Run the solution
if (require.main === module) {
    main();
}

module.exports = { solveShamirSecretSharing, convertFromBase, lagrangeInterpolation };