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
		ppLib.init();

		$('#main-content').after('<div class="sys-info-div"></div>');
		$('.sys-info-div').on('click', ppLib.hideSysInfo);
		ppLib.hideSysInfo();

		$('#main-content').after('<div class="highlight-btn">Highlight</div>');
		$('.highlight-btn').on('click', ppLib.highlightSystems);

		$('#main-content').after('<div class="dependency-table-btn">Dep. Table</div>');
		$('.dependency-table-btn').on('click', ppLib.dependencyTable);
		$('#main-content').after('<div class="dependency-graph-btn">Dep. Graph</div>');
		$('.dependency-graph-btn').on('click', ppLib.dependencyGraph);

		$('#main-content').after('<div class="report-container"><div class="report-display"><div class="close-btn">X</div><div class="report"></div></div></div>');
		ppLib.hideReport();
		$('.report-container .close-btn').on('click', ppLib.hideReport);
	}
);
var ppLib = {
	init: function () {
		console.log('Page-power: init function');
		let test = document.querySelectorAll(
			'#main-content > div.confluence-information-macro.confluence-information-macro-information.conf-macro.output-block'
		)[0].textContent;
		console.log(test);

		setTimeout(() => {
			ppLib.highlightSystems();
		}, 10000);
	},
	highlightSystems: function () {
		$('.aui tbody tr:nth-child(2)').each((idx, obj) => {
			//console.log(idx, obj);

			let index = 1,
				indexSystems = -1;

			for (let i of obj.children) {
				let textKey = i.textContent.trim().toUpperCase();

				if (textKey == 'SYSTEM LABELS') {
					indexSystems = index;
					//console.log('Page-power: >A>', i, indexSystems);

					let rows = obj.parentNode.children;
					//console.log('Page-power: >B>', rows);
					for (let row of rows) {
						//console.log( 'Page-power: >C>', row.querySelector('td:nth-child(11)') );
						let sys = row.querySelector('td:nth-child(11)');
						if (sys && sys.querySelectorAll('.sys-pill').length < 1) {
							sys = sys.textContent
								.replaceAll('\n', '')
								.replaceAll(' ', '');
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
		$('span.sys-pill').off();
		$('span.sys-pill').on('click', ppLib.sysPillHandler);
	},
	sysPillHandler: function (e) {
		ppLib.hideSysInfo();
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
				ppLib.showSysInfo(sys, systemInfo.syscode[sys]);
			}
		});
	},
	showSysInfo: function (sysCode, sysObj) {
		if (!sysObj) return;
		$('.sys-info-div').removeClass('minimize');
		$('.sys-info-div').show();

		let sysInfoContainer = `
			<div id="sysBtn" class="sys-min-max">Min.</div>
			<div class="sys-container">
				<div class="sys-header">
				  <h1>${sysCode}</h1>
				  <h2>${sysObj.sysName}</h2>
				</div>
				
				<div class="sys-row">
				  <div class="sys-column">
				    <h3>Criticality:</h3>
				    <p>${sysObj.criticality}</p>
				    <h3>Asset Health</h3>
				    <p>${sysObj.assetHealth}</p>
				    <h3>Cross Site</h3>
				    <p>${sysObj.crossSite}</p>
				    <h3>Endorsement</h3>
				    <p>${sysObj.endorsed}</p>
				  </div>
				  <div class="sys-column">
				    <h3>Department</h3>
				    <p>${sysObj.dept}</p>
				    <h3>Portfolio</h3>
				    <p>${sysObj.portfolio}</p>
				    <h3>Primary User Dept.</h3>
				    <p>${sysObj.primeUserDept}</p>
				    <h3>User Division</h3>
				    <p>${sysObj.userDiv}</p>
				  </div>
				  <div class="sys-column">
				    <h3>System Owner</h3>
				    <p>${sysObj.sysOwner.replaceAll('|', '</br>')}</p>
				    <h3>System Manager</h3>
				    <p>${sysObj.sysMgr.replaceAll('|', '</br>')}</p>
				    <h3>Portfolio Manager</h3>
				    <p>${sysObj.portfolioMgr.replaceAll('|', '</br>')}</p>
				    <h3>Admin</h3>
				    <p>${sysObj.admin.replaceAll('|', '</br>')} <br/><strong>Ph : </Strong>${sysObj.adminContact} </p>
				  </div>
				</div>

				<div class="sys-footer">
				  <span>Infra: ${$('#Infra .active-row').length} |</span>
				  <span>App: ${$('#software .active-row').length} |</span>
				  <span>Exp: ${$('#Exp .active-row').length}</span>
				</div>
			</div>`;

		$('.sys-info-div').html(sysInfoContainer);
		$('#sysBtn').on('click', ppLib.sysInfoMinMax);
	},
	hideSysInfo: function () {
		$('.sys-info-div').hide();
		$('.rowNormal.active-row, .rowAlternate.active-row').removeClass('active-row');
		$('.sys-pill.active').removeClass('active');
		$('.rpt-sys-pill.active').removeClass('active');
	},
	sysInfoMinMax: function (e) {
		e.stopPropagation();
		if ($('.sys-info-div.minimize').length > 0) {
			$('.sys-info-div').removeClass('minimize');
			$('.sys-container').show();
			$('#sysBtn').text('Min.');
		} else {
			$('#sysBtn').text('Max.');
			$('.sys-container').hide();
			$('.sys-info-div').addClass('minimize');
		}
	},
	genDependency: function () {
		let sysArr = [];
		let sysMap = {};
		$('#software .sys-pill').each((idx, syst) => {
			let sys = syst.textContent.trim().toUpperCase();
			if (sysArr.indexOf(sys) == -1) {
				if (systemInfo.syscode.hasOwnProperty(sys)) {
					sysArr.push(sys);

					if (!sysMap.hasOwnProperty(systemInfo.syscode[sys].dept)) {
						sysMap[systemInfo.syscode[sys].dept] = {};
					}
					if (!sysMap[systemInfo.syscode[sys].dept].hasOwnProperty(systemInfo.syscode[sys].portfolio)) {
						sysMap[systemInfo.syscode[sys].dept][systemInfo.syscode[sys].portfolio] = {};
					}
					if (!sysMap[systemInfo.syscode[sys].dept][systemInfo.syscode[sys].portfolio].hasOwnProperty(systemInfo.syscode[sys].criticality)) {
						sysMap[systemInfo.syscode[sys].dept][systemInfo.syscode[sys].portfolio][systemInfo.syscode[sys].criticality] = [];
					}
					sysMap[systemInfo.syscode[sys].dept][systemInfo.syscode[sys].portfolio][systemInfo.syscode[sys].criticality].push(sys);
				}
			}
		});
		return sysMap;
	},
	dependencyTable: function (e) {
		ppLib.hideSysInfo();

		let sysMap = ppLib.genDependency();
		console.log('--> Dependency Table', sysMap);

		let dept = Object.keys(sysMap).sort();
		let cont = $('<div>').addClass('rpt-systems-cont');
		for (let i of dept) {
			console.log(i); //Department
			let newDept = $('<div>').addClass('rpt-systems-dept');
			let deptName = $('<h2>').text(i);
			newDept.append(deptName);

			let portfolio = Object.keys(sysMap[i]).sort();
			for (let j of portfolio) {
				console.log('\t', j); //Portfolio
				let newPort = $('<div>').addClass('rpt-systems-portfolio');
				let portName = $('<h3>').text(j);
				newPort.append(portName);

				let criticality = Object.keys(sysMap[i][j]).sort();
				for (let k of criticality) {
					sysMap[i][j][k].sort();
					console.log('\t\t', k, `:[${sysMap[i][j][k].length}]`, ' --> ', sysMap[i][j][k].join(', ')); //Criticality & Systems
					// console.log('\t\t', k, `:[${sysMap[i][j][k].length}]`); //Criticality
					let newCrit = $('<div>').addClass('rpt-systems-criticality');
					let critName = $('<h4>').text(k);
					newCrit.append(critName);

					let systems = sysMap[i][j][k].sort();
					for (let l of systems) {
						// console.log('\t\t\t', l); //Systems
						let newSys = $('<span>').text(l).addClass('rpt-sys-pill');
						newCrit.append(newSys);
					}
					newPort.append(newCrit);
				}
				newDept.append(newPort);
			}
			cont.append(newDept);
		}
		$('.report').html(cont);
		$('.report-container').show();

		$('.rpt-sys-pill').off();
		$('.rpt-sys-pill').on('click', (sys) => {
			let sysSelected = sys.target.textContent.trim().toUpperCase();
			$('.rpt-sys-pill.active').removeClass('active');
			$(sys.target).addClass('active');
			ppLib.showSysInfo(sysSelected, systemInfo.syscode[sysSelected]);
		});
	},
	dependencyGraph: function (e) {
		let sysMap = ppLib.genDependency();
		console.log('--> Dependency Graph', sysMap);
	},
	hideReport: function () {
		$('.report-container').hide();
	}
};