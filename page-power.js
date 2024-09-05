console.log('Page-power:v1');
async function loadPagePower() {
	const resources = [
		{ url: 'https://raw.githubusercontent.com/maildebjyoti/lookup-list/main/page-power.js', isScript: true },
		{ url: 'https://raw.githubusercontent.com/maildebjyoti/lookup-list/main/page-power.css', isScript: false }
	];

	for (const { url, isScript } of resources) {
		try {
			const response = await $.get(url);
			if (isScript) {
				new Function(response)();
				console.log(`-- page-power:js`);
			} else {
				const style = document.createElement('style');
				style.innerHTML = response;
				document.head.appendChild(style);
				console.log(`-- page-power:css`);
			}
		} catch (error) {
			console.error(`Failed to load resource from ${url}:`, error);
		}
	}
}
loadPagePower();
//*------------------------------------------------------------------------------------*/

async function loadDependencies() {
	try {
		// Load dependencies in parallel
		const [d3Js, plotJs, runtimeJs] = await Promise.all([
			fetch('https://cdn.jsdelivr.net/npm/d3@7').then((res) => res.text()),
			fetch('https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6').then((res) => res.text())
		]);

		// Execute the loaded JavaScript
		new Function(d3Js)();
		console.log('D3 Loaded');
		new Function(plotJs)();
		console.log('D3 Plot Loaded');
	} catch (error) {
		console.error('D3: Error loading dependencies ', error);
	}
}

//Global Variables
var systemInfo = {}, rowData = {};
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
		rowData = {};
		let tab = $('#main-content .tabs-menu a').map((x, y) => y.textContent.replaceAll(' ', ''));

		$('.aui tbody tr:nth-child(2)').each((idx, obj) => {
			let index = 1,
				indexSystems = -1,
				rowHeader = [],
				rowCount = 0,
				colCount = -1,
				rows = obj.parentNode.children;

			for (let row of rows) {
				if (row.childElementCount > 0) {
					if (rowCount == 1) { //Handle Header
						for (let i of row.children) {
							let textKey = i.textContent.trim().replaceAll(' ', '');
							rowHeader.push(textKey);
							if (textKey == 'SystemLabels') indexSystems = index;
							index++;
						}
					} else { //Handle Rows
						colCount = 0;
						let tempObj = {};
						for (let i of row.children) {
							let colKey = rowHeader[colCount];
							let colVal = i.textContent.replaceAll('\n', ' ').trim();

							if (colKey == 'LinkedIssues') {
								colVal = colVal.replaceAll(' ', '');

								if (colKey == 'LinkedIssues') {
									colVal = colVal.replaceAll(' ', '');

									//Separate RGB & CO Links
									colVal = colVal.split(',');
									let tktCOs = colVal.filter((tkt) => tkt.indexOf('COT') > -1);
									let tktRGBs = colVal.filter((tkt) => tkt.indexOf('RGB') > -1);

									tempObj['LinkedCOs'] = tktCOs; //Create Key-Value Object for Linked COs
									colVal = tktRGBs; //Filter LinkedIssues to only RGB tickets
								}
							}

							tempObj[colKey] = colVal; //Create Key-Value Object

							if (colKey == 'SystemLabels') {
								let sys = colVal;
								if (sys && i.querySelectorAll('.sys-pill').length < 1) {
									sys = sys.replaceAll('\n', '').replaceAll(' ', '');
									sys = sys.split(',');
									let tempHtml = sys.map((system) => {
										return systemInfo.syscode.hasOwnProperty(system.trim().toUpperCase())
											? `<span class="sys-pill">${system}</span>`
											: `<span class="sys-pill error">${system}</span>`;
									});
									tempHtml = tempHtml.join('');
									i.innerHTML = tempHtml;
								}

								let dataCheck = i.textContent.trim().replaceAll(' ', '');
								if (!dataCheck || dataCheck == 'TBD') $(i).addClass('error');
							}

							colVal = colVal.toString().toUpperCase();
							if (colKey == 'DMLink' && colVal.indexOf('XXXX') > -1) {
								$(i).addClass('error');
							}
							if (colKey == 'ProjectLink' && colVal.indexOf('XXXX') > -1) {
								$(i).addClass('error');
							}
							if (colKey == 'Summary' && colVal.indexOf('XXXX') > -1) {
								$(i).addClass('error');
							}
							if (colKey == 'Portfolio') {
								if (!colVal) $(i).addClass('error');
								if (colVal.indexOf('<PORTFOLIO') > -1) $(i).addClass('error');
							}
							if (colKey == 'AcceptedbySA') {
								if (!colVal) $(i).addClass('error');
								if (colVal.indexOf('NO') > -1) $(i).addClass('error');
							}

							colCount++;
						}
						// if(!rowData[tab[idx+1]]){
						// 	rowData[tab[idx+1]] = [];
						// }
						// rowData[tab[idx+1]].push(tempObj);
						let tabTey = obj.parentElement.parentElement.parentElement.parentElement.parentElement.id;
						if (!rowData[tabTey]) {
							rowData[tabTey] = [];
						}
						rowData[tabTey].push(tempObj);
					}
				}
				rowCount++;
			}
		});
		$('span.sys-pill').off();
		$('span.sys-pill').on('click', ppLib.sysPillHandler);

		console.log('Page-power: >>', rowData);
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
		//let sysMap = ppLib.genDependency();
		console.log('--> Dependency Graph');
		$('.graph-container').show();
		document.querySelector('.graph-display .report').innerHTML = '';

		// Define the URL of the CSV file
		const url = 'https://static.observableusercontent.com/files/31ca24545a0603dce099d10ee89ee5ae72d29fa55e8fc7c9ffb5ded87ac83060d80f1d9e21f4ae8eb04c1e8940b7287d179fe8060d887fb1f055f430e210007c';

		// Function to fetch & Load to display the olympians data
		ppLib.loadCsvData(url).then((olympians) => {
			console.log('D3 Olympians Dataset:', olympians);
			test = olympians;
			const plot = Plot.plot({
				// grid: true,
				y: {
					// type: "log",
					domain: [1, 2.4],
					grid: true
				},
				color: { legend: true },
				title: 'Title: Text here',
				subtitle: 'Subtitle: Additional Text here',
				caption: 'Figure 1. Text desc. here',
				marks: [
					Plot.dot(
						olympians.filter((rec) => rec.height > 0).filter((rec) => rec.weight > 0),
						{
							x: 'weight',
							y: 'height',
							stroke: 'sex',
							channels: { name: 'name', sport: 'sport' },
							tip: true,
						}
					),
					Plot.crosshair(olympians, { x: 'weight', y: 'height' }),
					Plot.frame(),
					// Plot.text(['Titles, subtitles, captions, and annotations assist interpretation by telling the reader what’s interesting. Don’t make the reader work to find what you already know.'], { lineWidth: 30, frameAnchor: 'middle' }),
				],
			});

			const div = document.querySelector('.graph-display .report');
			div.append(plot);
		}).catch((error) => {
			console.error(error);
		});

		// const plot = Plot.rectY({length: 10000}, Plot.binX({y: "count"}, {x: Math.random})).plot();
		// const div = document.querySelector(".graph-display .report");
		// div.append(plot);
	},
	hideGraph: function () {
		$('.graph-container').hide();
	},
	loadCsvData: function (csvUrl) {
		return fetch(csvUrl)
			.then((response) => response.text())
			.then((data) => {
				function parseValue(value) {
					if (value === 'true') return true;
					if (value === 'false') return false;
					if (value === '') return '';
					if (!isNaN(value)) return parseFloat(value);
					return value;
				}

				// Parse the CSV data
				const rows = data.trim().split('\n');
				const headers = rows[0].split(',');
				const csvData = rows.slice(1).map((row) => {
					const values = row.split(',');
					return headers.reduce((obj, header, i) => {
						obj[header] = parseValue(values[i]);
						return obj;
					}, {});
				});
				return csvData;
			})
			.catch((error) => {
				console.error(error);
				throw error;
			});
	},
	loadCOdetails: function () {
		let id = 'COT-282';
		let url = `https://kmc.corp.hkjc.com/rest/api/latest/issue/${id}?fields=summary,details,status,issuelinks,customfield_13104,customfield_15231,customfield_15233,customfield_24201,customfield_13104`;

		dataSet.forEach((item) => {
			console.log(item.Key, item.LinkedCOs)
		})
	}
};
