//await page.goto('https://kmc.corp.hkjc.com/browse/RGB-15267')

const tktState = await page.waitForSelector('#opsbar-opsbar-transitions')
if (tktState) {
    const textContentProperty = await tktState.getProperty('textContent');
    const textContent = await textContentProperty.jsonValue(); // Convert to string
    console.log('Pup A--', textContent);
}

/* // Leave a comment after script execution
const editBtn = await page.waitForSelector('#edit-issue');
await editBtn.click();
 */

const commentBtn = await page.waitForSelector('#footer-comment-button');
await commentBtn.click();

const commentTextBtn = await page.waitForSelector('#comment-wiki-edit > nav > div > div > ul > li:last-child > button');
await commentTextBtn.click();

let comment = `This is a comment:
- Checked following things & Dates
- Observations - some remarks
- Do this
- Also Do this
Red {color:red}color{color}. *Bold*. _Italic_. +Underline+
`;
await page.evaluate((selector, value) => {
    const inputField = document.querySelector(selector);
    if (inputField) {
        inputField.value = value; // Set the input value
        inputField.dispatchEvent(new Event('input', { bubbles: true })); // Trigger input event
    }
}, '#comment', comment);

const commentVisualBtn = await page.waitForSelector('#comment-wiki-edit > nav > div > div > ul > li:first-child > button');
await commentVisualBtn.click();

const commentSave = await page.waitForSelector('#issue-comment-add-submit');
await commentSave.click();


/*
Check that it is a valid page -
    eg matches the RGB ticket format - https://kmc.corp.hkjc.com/browse/RGB-10916?src=confmacro
Check the ticket is in right ststus
Check that the Systems Involved in - Release Scope & Reference-System Labels are the same
Check for Ticket completeness - each tabs
Check for the sub-tasks
    Sanity:
    Risk-Based Decision:
    Readiness-Checklist:
        - checkthe D2 links for each systems - SAT & UAT - - capture & attach screenshots
        - check for emails attached as artefacts - - capture & attach screenshots
        - Provide a summary comment - both in sub-task & parent tickets

*/