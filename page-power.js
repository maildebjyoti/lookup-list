console.log('Page-power:v1');
/*
$.get('https://raw.githubusercontent.com/maildebjyoti/lookup-list/main/page-power.js' + '?t=' + (new Date()).toISOString()).then(js => {
    let scriptFunction = new Function(js);
    scriptFunction();
    console.log('hello hello -- page-power:js');
});

$.get('https://raw.githubusercontent.com/maildebjyoti/lookup-list/main/page-power.css' + '?t=' + (new Date()).toISOString()).then(css => {
	let style = document.createElement('style');
	style.innerHTML = css;
	document.head.appendChild(style);
	console.log('hello hello -- page-power:css');
});
*/

pagePower();

function pagePower(){
	console.log('Page-power: init function');
	let test = document.querySelectorAll('#main-content > div.confluence-information-macro.confluence-information-macro-information.conf-macro.output-block')[0].textContent;
	console.log(test);

	setTimeout(() => {
		highlightSystems();
	}, 10000); 
}

function highlightSystems(){
	$('.aui tbody tr:nth-child(2)').each((idx, obj)=>{ 
		//console.log(idx, obj);

		let index = 1, indexSystems = -1;
		for ( let i of obj.children ) {
			let textKey = (i.textContent).trim().toUpperCase();
			
			if(textKey == 'SYSTEM LABELS') {
				indexSystems = index;
				//console.log('Page-power: >A>', i, indexSystems);

				let rows = obj.parentNode.children;
				//console.log('Page-power: >B>', rows);
				for(let row of rows){
					//console.log( 'Page-power: >C>', row.querySelector('td:nth-child(11)') );
					let sys = row.querySelector('td:nth-child(11)');
					if(sys){
						sys = sys.textContent.replaceAll('\n', '').replaceAll(' ','');
						sys = sys.split(',');
						let tempHtml = sys.map((system)=>{
							return `<span class="sys-pill">${system}</span>`;
						});
						tempHtml = tempHtml.join('');
						//console.log( 'Page-power: >D>', tempHtml);
						row.querySelector('td:nth-child(11)').innerHTML = tempHtml;
					}
				}
			}
			index++;
		}
	});
}