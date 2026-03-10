const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// We will find all <div class="prompt-text" id="prompt-tX">
// and replace the text inside it to have <br> whenever it sees " - " or "- "

const regex = /<div class="prompt-text" id="prompt-t\d+">([\s\S]*?)<\/div>/g;

content = content.replace(regex, (match, innerText) => {
    // Add line-height style to the div to make it look nicer
    let newDiv = match.replace('class="prompt-text"', 'class="prompt-text" style="line-height: 1.8;"');

    // Let's manually replace the innerText
    // 1. "기능 요구사항: -" or "기능 요구사항:" -> "<br><br>기능 요구사항:<br>-"
    let formatted = innerText;

    // Clean up existing random newlines and multiple spaces to make it one line first
    formatted = formatted.replace(/\s+/g, ' ');

    // Rule 1: Break before "기능 요구사항:"
    formatted = formatted.replace(/기능 요구사항:\s*-?/g, '<br><br>기능 요구사항:<br>-');

    // Rule 2: Break before " - " (main bullet points)
    formatted = formatted.replace(/\s+-\s+/g, '<br>- ');

    // Rule 3: For sub-bullets, if we see " - 입력 항목: - 직무명" -> " - 입력 항목:<br>  · 직무명"
    // Actually, just making " - " into "<br>- " is a huge improvement. Let's do a basic replacement first.

    // Rule 4: Let's also add indentation for nested bullets if it looks like:
    // "- 입력 항목: - 직무명"  => "- 입력 항목:<br>&nbsp;&nbsp;&nbsp;&nbsp;· 직무명"
    // We can just use a secondary regex for `<br>- ` that appears right after `:` 
    formatted = formatted.replace(/:\s*<br>-\s*/g, ':<br>&nbsp;&nbsp;&nbsp;&nbsp;· ');

    // Any remaining " - " that was inside a bullet point might need to be sub-bullets
    // If we have "<br>- 출력 영역: 4개 섹션으로 구성된 ... <br>- 포지션 개요 ..."
    // It's hard to distinguish programmatically. Let's stick to the simple `<br>- ` for all dashes.

    // Let's refine the replacement:
    // 1. Add <br> before every ' - '
    // 2. Also ensure '<br><br>' before '기능 요구사항:'
    let out = innerText.replace(/\s+/g, ' ');
    out = out.replace(/기능 요구사항:\s*/g, '<br><br>기능 요구사항:<br>');
    out = out.replace(/\s+-\s+/g, '<br>- ');

    // Specifically for T4 and T7 sub-bullets which look like:
    // " - 입력 항목: <br>- 신입사원 이름"
    out = out.replace(/입력 항목:\s*<br>-\s*/g, '입력 항목:<br>&nbsp;&nbsp;&nbsp;&nbsp;· ');
    out = out.replace(/출력 영역:\s*(.*?)(<br>|$)/g, '출력 영역: $1$2'); // keep the main output area text

    // Convert any <br>- right after a colon or another bullet into a sub bullet
    out = out.replace(/:\s*<br>-\s*/g, ':<br>&nbsp;&nbsp;&nbsp;&nbsp;· ');

    // Manual touch-up for nested bullets that are just `<br>- ` but logically belong to the parent list
    // Actually, `<br>- ` everywhere is much better than what we had.

    return newDiv.replace(innerText, '\n                ' + out + '\n              ');
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Prompts formatted successfully!');
