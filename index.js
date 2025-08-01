const fs = require('fs');

// Read and parse the JSON file
const data = JSON.parse(fs.readFileSync('input.json', 'utf-8'));
const n = data.keys.n;
const k = data.keys.k; // Degree = k - 1

// Convert input points
let points = [];
for (const key in data) {
    if (key === 'keys') continue;
    const x = parseInt(key);
    const base = parseInt(data[key].base);
    const value = parseInt(data[key].value, base);
    points.push({ x, y: value });
}

// Use first k points only
points = points.slice(0, k);

// Construct Vandermonde matrix and Y vector
const matrix = [];
const Y = [];

for (const pt of points) {
    const row = [];
    for (let i = 0; i < k; i++) {
        row.push(BigInt(pt.x) ** BigInt(i)); // x^i
    }
    matrix.push(row);
    Y.push(BigInt(pt.y));
}

// Solve using Gaussian Elimination
function gaussianElimination(A, B) {
    const n = A.length;

    for (let i = 0; i < n; i++) {
        // Make A[i][i] == 1
        let factor = A[i][i];
        for (let j = 0; j < n; j++) {
            A[i][j] = A[i][j] * 1n / factor;
        }
        B[i] = B[i] * 1n / factor;

        for (let k = 0; k < n; k++) {
            if (k !== i) {
                let coeff = A[k][i];
                for (let j = 0; j < n; j++) {
                    A[k][j] -= coeff * A[i][j];
                }
                B[k] -= coeff * B[i];
            }
        }
    }
    return B;
}


const coefficients = gaussianElimination(matrix, Y);

// Print only the highest-degree coefficient
const lastIndex = coefficients.length - 1;
console.log(`a${lastIndex} = ${coefficients[lastIndex].toString()}`);

