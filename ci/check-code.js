// ci/check-code.js
const fs = require("fs");
const path = require("path");

// --- helper: get all .js files in the project ---
function getAllJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // skip node_modules and hidden folders like .git
      if (file === "node_modules" || file.startsWith(".")) continue;
      getAllJsFiles(fullPath, fileList);
    } else if (fullPath.endsWith(".js")) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

// --- main logic ---
const jsFiles = getAllJsFiles(process.cwd());

let errors = [];
let totalWindowListeners = 0;
let getDataWithSchoolFilterFound = false;

for (const file of jsFiles) {
  const code = fs.readFileSync(file, "utf8");

  // 1) Count window.addEventListener
  const matches = code.match(/window\.addEventListener\s*\(/g);
  if (matches) {
    totalWindowListeners += matches.length;
  }

  // 2) Check if getData is called with 'schoolname' in its parameters
  // This is a simple text-based search, not perfect but works
  if (/getData\s*\([^)]*schoolname[^)]*\)/i.test(code)) {
    getDataWithSchoolFilterFound = true;
  }
}

// Rule 1: exactly one window.addEventListener
if (totalWindowListeners !== 1) {
  errors.push(
    `Expected exactly 1 "window.addEventListener", but found ${totalWindowListeners}.`
  );
}

// Rule 2: getData must be called with schoolname in args
if (!getDataWithSchoolFilterFound) {
  errors.push(
    `No "getData(...schoolname...)" call found. Make sure getData is called with a schoolname filter.`
  );
}

// --- report ---
if (errors.length > 0) {
  console.error("❌ Custom checks failed:");
  for (const e of errors) {
    console.error(" - " + e);
  }
  process.exit(1); // important: tells npm/GitHub that the check FAILED
} else {
  console.log("✅ Custom checks passed.");
}
