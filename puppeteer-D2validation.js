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

// Add Comment to the ticket
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
//===========================================
//Check the D2 links
const elements = await page.$$('#stalker div.aui-page-header-main > ol > li');
console.log('Pup breadCrumbs:', elements.length);
const headerSelector = '#summary-val';
const headerText = await page.$eval(headerSelector, element => element.textContent.trim());
console.log('Pup headerText:', headerText);

//Execute only for specific pages
if (headerText.split(' ')[0].toUpperCase() !== 'RELEASE') return;
if (headerText.split(' ')[1].toUpperCase() !== 'READINESS') return;
console.log('Pup ', '==========================================');

const tktSubState = await page.waitForSelector('#opsbar-opsbar-transitions');
if (tktSubState) {
    let textContentProperty = await tktSubState.getProperty('textContent');
    let textContent = await textContentProperty.jsonValue(); // Convert to string
    console.log('Pup A--', textContent);
}

let rr = await page.evaluate(() => {
    let rrObj = {};
    const rows = document.querySelectorAll('#customfield_23906-val div.react-grid-Main .react-grid-Canvas .react-grid-Row');
    rows.forEach(row => {
        let key = row.children[0].textContent.toUpperCase().split(' ')[0];
        rrObj[key] = {};
        // console.log('-->', key, row, row.children.length);
        let len = row.children.length;
        for (let i = 0; i < len; i++) {
            // console.log('    Col:', key, i, row.children[i].textContent); 
            let text = row.children[i].textContent.trim();
            switch (i) {
                case 0: rrObj[key]['label'] = text; break;
                case 1: rrObj[key]['status'] = text; break;
                case 2: rrObj[key]['comment'] = text; break;
                case 3:
                    if (key == 'SAT' || key == 'UAT') rrObj[key]['links'] = text.split(' ');
                    else rrObj[key]['links'] = text;
                    break;
            }
        }
    });
    return rrObj;
});

let d2Link = rr['SAT'].links[0];
console.log('Pup Obj:', rr, d2Link);

let parentPage = await page.evaluate(() => { return document.location.href; });

//const secondPage = await browser.newPage();
console.log('Pup Z1');
await page.goto(d2Link + '&callback='+encodeURIComponent(parentPage));
console.log('Pup Z2');
// await page.waitForSelector('body');
let elem = await page.waitForSelector('.x-grid3-row.x-unselectable-single.x-grid3-highlightrow.x-grid3-row-selected');
console.log('Pup Z3');
const htmlContent = await page.evaluate(() => {
    console.log('Pup Z4');
    /*
    document.querySelector('.x-grid3-row.x-unselectable-single.x-grid3-highlightrow.x-grid3-row-selected ')
    document.querySelector('.x-grid3-row.x-unselectable-single.x-grid3-highlightrow.x-grid3-row-selected ').textContent

    document.querySelector('.x-grid3-row.x-unselectable-single.x-grid3-highlightrow.x-grid3-row-selected ').children[0].textContent
    document.querySelector('.x-grid3-row.x-unselectable-single.x-grid3-highlightrow.x-grid3-row-selected ').children[1].textContent 
    ...5 children, only 1,2,3 seems relevant

    Doc Properties
    document.querySelector('#PropertiesDialog > div.x-panel-bwrap > div.x-panel-body > form')
    ...10 rows . various info

    Approval History
    document.querySelector('#ExternalWidget-0 > div.x-panel-bwrap.x3-widget-bwrap').children[0].children[0].children[0]
    document.querySelector('#ExternalWidget-0 > div.x-panel-bwrap.x3-widget-bwrap').children[0].children[0].children[0].getAttribute('id')
    const iframe = document.querySelector('iframe'); // Adjust the selector as needed

    if (iframe) {
        // Access the iframe's content document
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

        // Extract the content from the iframe
        const content = iframeDocument.body.innerHTML; // You can modify this to select specific elements

        console.log('Iframe Content:', content);
    } else {
        console.log('Iframe not found.');
    }
    eg. document.querySelector('#ExternalWidget-0 > div.x-panel-bwrap.x3-widget-bwrap').children[0].children[0].children[0].contentDocument.body.innerHTML
    */
    //debugger;
    console.log('Pup iFrame Content:', document.querySelector('#ExternalWidget-0 > div.x-panel-bwrap.x3-widget-bwrap').children[0].children[0].children[0].contentDocument.body.innerText);
    return document.querySelector('.x-grid3-row.x-unselectable-single.x-grid3-highlightrow.x-grid3-row-selected ').children[0].textContent;
});
console.log('Pup Z5');
console.log('Pup Extracted HTML Content:', htmlContent);
