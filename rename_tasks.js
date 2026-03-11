const fs = require('fs');
const path = require('path');

function replacePatterns(content) {
    let result = content;

    // 1. Text representations
    result = result.replace(/TASK 04/g, 'TASK _TMP3_');
    result = result.replace(/TASK 06/g, 'TASK _TMP4_');
    result = result.replace(/TASK 07/g, 'TASK _TMP5_');

    result = result.replace(/TASK 4/g, 'TASK _TMP3_');
    result = result.replace(/TASK 6/g, 'TASK _TMP4_');
    result = result.replace(/TASK 7/g, 'TASK _TMP5_');

    result = result.replace(/num">04/g, 'num">03');
    result = result.replace(/num">06/g, 'num">04');
    result = result.replace(/num">07/g, 'num">05');

    // 2. IDs and JS bindings
    const idPatterns = [
        { from: 't4', to: 't_TMP3_' },
        { from: 't6', to: 't_TMP4_' },
        { from: 't7', to: 't_TMP5_' },
    ];

    idPatterns.forEach(pattern => {
        // Replace 'tX' exactly
        result = result.replace(new RegExp(`'${pattern.from}'`, 'g'), `'${pattern.to}'`);
        // Replace "tX" exactly
        result = result.replace(new RegExp(`"${pattern.from}"`, 'g'), `"${pattern.to}"`);
        // Replace tX- exactly
        result = result.replace(new RegExp(`${pattern.from}-`, 'g'), `${pattern.to}-`);
        // Replace -tX exactly
        result = result.replace(new RegExp(`-${pattern.from}`, 'g'), `-${pattern.to}`);
    });

    // 3. Finalize placeholders
    result = result.replace(/TASK _TMP3_/g, 'TASK 03'); // This will also format the comments to have 03 instead of 3, which is exactly better!
    result = result.replace(/TASK _TMP4_/g, 'TASK 04');
    result = result.replace(/TASK _TMP5_/g, 'TASK 05');

    result = result.replace(/t_TMP3_/g, 't3');
    result = result.replace(/t_TMP4_/g, 't4');
    result = result.replace(/t_TMP5_/g, 't5');

    return result;
}

const htmlPath = path.join(__dirname, 'index.html');
const jsPath = path.join(__dirname, 'assets', 'app.js');

let htmlContent = fs.readFileSync(htmlPath, 'utf8');
let jsContent = fs.readFileSync(jsPath, 'utf8');

// Edge cases for app.js where we have e.g. state.t4 = ...
// The generic replacement rule might not catch `state.t4` because it lacks a dash or quote
// Let's add specific replace for state.t4 etc.
function jsSpecificReplace(content) {
    let res = content;
    // Temporary tokens
    res = res.replace(/\.t4\b/g, '.t_TMP3_');
    res = res.replace(/\.t6\b/g, '.t_TMP4_');
    res = res.replace(/\.t7\b/g, '.t_TMP5_');

    // Revert tokens
    res = res.replace(/\.t_TMP3_/g, '.t3');
    res = res.replace(/\.t_TMP4_/g, '.t4');
    res = res.replace(/\.t_TMP5_/g, '.t5');
    return res;
}

htmlContent = replacePatterns(htmlContent);

jsContent = replacePatterns(jsContent);
jsContent = jsSpecificReplace(jsContent);

// Wait! In app.js there is `mapPrompt(4, ...)` where it's a number, not mapped to 't4'
jsContent = jsContent.replace(/mapPrompt\(4,/g, 'mapPrompt(3,');
jsContent = jsContent.replace(/mapPrompt\(6,/g, 'mapPrompt(4,');
jsContent = jsContent.replace(/mapPrompt\(7,/g, 'mapPrompt(5,');

fs.writeFileSync(htmlPath, htmlContent);
fs.writeFileSync(jsPath, jsContent);

console.log('Task renumbering complete.');
