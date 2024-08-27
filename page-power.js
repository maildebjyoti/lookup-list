console.log('Page-power:v1');

async function loadDependencies() {
	try {
		// Load dependencies in parallel
		const [d3Js, plotJs, runtimeJs] = await Promise.all([
			fetch('https://cdn.jsdelivr.net/npm/d3@7').then((res) => res.text()),
			fetch('https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6').then((res) => res.text()),
			fetch('https://cdn.jsdelivr.net/npm/@observablehq/runtime/dist/runtime.js').then((res) => res.text()),
		]);

		// Execute the loaded JavaScript
		new Function(d3Js)();
		console.log('D3 Loaded');
		new Function(plotJs)();
		console.log('D3 Plot Loaded');
		//new Function(runtimeJs)();
		//console.log('D3 Runtime Loaded');
	} catch (error) {
		console.error('D3: Error loading dependencies ', error);
	}
}

var systemInfo = {};
async function loadSystemDependencies() {
	try {
		// Load SysInfo-Data.json
		const systemInfoResponse = await fetch('https://deopconf01.corp.hkjc.com/download/attachments/136033628/SysInfo-Data.json?api=v2');
		if (!systemInfoResponse.ok) {
			throw new Error(`Error loading SysInfo-Data.json: ${systemInfoResponse.status} - ${systemInfoResponse.statusText}`);
		}
		systemInfo = await systemInfoResponse.json();
		ppLib.init();
	} catch (error) {
		console.error('Error loading SysInfo-Data.json:', error);
	}
}

loadDependencies();
loadSystemDependencies();

var ppLib = {
	init: function () {
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

		$('#main-content').after('<div class="graph-container"><div class="graph-display"><div class="close-btn">X</div><div class="report"></div></div></div>');
		ppLib.hideGraph();
		$('.graph-container .close-btn').on('click', ppLib.hideGraph);

		console.log('Page-power: init function');

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
		// console.log('--> Dependency Table', sysMap);

		let dept = Object.keys(sysMap).sort();
		let cont = $('<div>').addClass('rpt-systems-cont');
		for (let i of dept) {
			// console.log(i); //Department
			let newDept = $('<div>').addClass('rpt-systems-dept');
			let deptName = $('<h2>').text(i);
			newDept.append(deptName);

			let portfolio = Object.keys(sysMap[i]).sort();
			for (let j of portfolio) {
				// console.log('\t', j); //Portfolio
				let newPort = $('<div>').addClass('rpt-systems-portfolio');
				let portName = $('<h3>').text(j);
				newPort.append(portName);

				let criticality = Object.keys(sysMap[i][j]).sort();
				for (let k of criticality) {
					sysMap[i][j][k].sort();
					// console.log('\t\t', k, `:[${sysMap[i][j][k].length}]`, ' --> ', sysMap[i][j][k].join(', ')); //Criticality & Systems
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

		//Dept-Sys Counts
		$('.report-display .rpt-systems-dept').each((i, obj) => {
			let count = obj.querySelectorAll('.rpt-sys-pill').length;
			let dept = obj.querySelector('h2').textContent;
			obj.querySelector('h2').innerHTML = (`${dept}<span class="dept-sys-count">${count}</span>`);
		});

		//Portfolio-Sys Counts
		$('.report-display .rpt-systems-portfolio').each((i, obj) => {
			let count = obj.querySelectorAll('.rpt-sys-pill').length;
			let pfolio = obj.querySelector('h3').textContent;
			obj.querySelector('h3').innerHTML = (`${pfolio}<span class="pfolio-sys-count">${count}</span>`);
		});

		//Criticality-Sys Counts
		$('.report-display .rpt-systems-criticality').each((i, obj) => {
			let count = obj.querySelectorAll('.rpt-sys-pill').length;
			let criti = obj.querySelector('h4').textContent;
			obj.querySelector('h4').innerHTML = (`${criti}<span class="criti-sys-count">${count}</span>`);
		});

		$('.report-display .report').after(`<span class="total-sys-count">Total Systems: ${$('.report-display .rpt-sys-pill').length}</span>`);
	},
	hideReport: function () {
		$('.report-container').hide();
	},
	dependencyGraph: function (e) {
		let sysMap = ppLib.genDependency();
		console.log('--> Dependency Graph', sysMap);
		$('.graph-container').show();
		document.querySelector(".graph-display .report").innerHTML = '';
		const plot = Plot.rectY({ length: 10000 }, Plot.binX({ y: "count" }, { x: Math.random })).plot();
		const div = document.querySelector(".graph-display .report");
		div.append(plot);
	},
	hideGraph: function () {
		$('.graph-container').hide();
	}
};