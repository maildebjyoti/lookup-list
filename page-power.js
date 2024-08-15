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

var systemInfo = {};
$.get('https://deopconf01.corp.hkjc.com/download/attachments/136033628/SysInfo-Data.json?api=v2',
	function (data) {
		systemInfo = data;
		pagePower();

		$('#main-content').after('<div class="sys-info-div"></div>');
		$('.sys-info-div').on('click', hideSysInfo);
	}
);

function pagePower() {
	console.log('Page-power: init function');
	let test = document.querySelectorAll('#main-content > div.confluence-information-macro.confluence-information-macro-information.conf-macro.output-block')[0].textContent;
	console.log(test);

	setTimeout(() => {
		highlightSystems();
	}, 10000);
}

function highlightSystems() {
	$('.aui tbody tr:nth-child(2)').each((idx, obj) => {
		//console.log(idx, obj);

		let index = 1, indexSystems = -1;
		for (let i of obj.children) {
			let textKey = (i.textContent).trim().toUpperCase();

			if (textKey == 'SYSTEM LABELS') {
				indexSystems = index;
				//console.log('Page-power: >A>', i, indexSystems);

				let rows = obj.parentNode.children;
				//console.log('Page-power: >B>', rows);
				for (let row of rows) {
					//console.log( 'Page-power: >C>', row.querySelector('td:nth-child(11)') );
					let sys = row.querySelector('td:nth-child(11)');
					if (sys) {
						sys = sys.textContent.replaceAll('\n', '').replaceAll(' ', '');
						sys = sys.split(',');
						let tempHtml = sys.map((system) => {
							return systemInfo.syscode.hasOwnProperty(system.trim().toUpperCase())
								? `<span class="sys-pill">${system}</span>`
								: `<span class="sys-pill error">${system}</span>`;
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
	$('span.sys-pill').on('click', sysPillHandler);
}

function sysPillHandler(e) {
	hideSysInfo()
	$(e.target).addClass('active');
	$(e.target.parentNode.parentNode).addClass('active-row');

	let sys = e.target.textContent.trim().toUpperCase();
	//console.log('-Power- Clicked:', sys);
	console.log('Page-power -- System Info:', sys, systemInfo.syscode[sys]);

	$('.sys-pill').each((idx, syst) => {
		//console.log(idx, syst);
		let sysSelected = syst.textContent.trim().toUpperCase();
		if (sysSelected == sys) {
			$(syst).addClass('active');
			$(syst.parentNode.parentNode).addClass('active-row');
			showSysInfo(systemInfo.syscode[sys]);
		}
	});
}

function showSysInfo(obj) {
	$('.sys-info-div').show();
	$('.sys-info-div').html(JSON.stringify(obj)
		.replaceAll('{', '')
		.replaceAll('}', '')
		.replaceAll(':', '    ')
		.replaceAll(',', '<br/>'));
}
function hideSysInfo() {
	$('.sys-info-div').hide();
	$('.rowNormal.active-row, .rowAlternate.active-row').removeClass('active-row');
	$('.sys-pill.active').removeClass('active');
}
