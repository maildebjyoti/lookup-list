console.log('Ticket-power:v1');

var util = {
    konst: {
        url1: 'https://deopconf01.corp.hkjc.com/download/attachments/136033628/SysInfo-Data.json',
        url2: 'https://kmc.corp.hkjc.com/browse/RGB-12271',
        url3: 'https://kmc.corp.hkjc.com/rest/api/2/issue/COT-1774',
        systemInfo: '',
        
        keyJIRA: '--MTc5NzgwMDM3NjM1Okicd3UJ2dfHvcg/H8juCJOQc4Y4',
        keyCONFLUENCE: '--MDI3NzY0MjExMjQxOrOYIefGHFjdbN36yj4SovG5+TML'
    },
    init: function () {
        console.log('Ticket-power:v1 init');
        window.onresize = util.handleWindowResize;

        this.formatCOs();
    },
    formatSystems: function formatSystems() {
        console.log('Ticket-power:v1 formatSystems');
        let newDiv = document.createElement('div');
        newDiv.id = 'sysDiv';
        newDiv.className = 'involved-systems';
        newDiv.innerHTML = '';
        let targetElement = document.querySelector('#wrap-labels > div');
        let sysTargetElement = document.getElementById('customfield_16213-val');
        let delExistingNode = document.getElementById('sysDiv') ? document.getElementById('sysDiv').remove() : 'No';
        if (sysTargetElement) {
            // targetElement.parentNode.insertBefore(newDiv, targetElement.nextSibling);
            targetElement.appendChild(newDiv);
            
            let listedSystems = sysTargetElement.querySelectorAll('ul > li');
            let tempHtml = '';
            for(let sys of listedSystems) {
            	tempHtml += `<span class="sys-pill">${sys.textContent}</span>`;
            }
            newDiv.innerHTML = tempHtml;
            let elems = document.querySelectorAll('#sysDiv > .sys-pill');
            let elems4mCO = [];
            document.querySelectorAll('div.link-content > p > span > span > .sys-pill').forEach((elem) => elems4mCO.push(elem.textContent.trim()));
			elems.forEach((elem)=> {
				elem.removeEventListener('click', util.getSystemDetails);
				elem.addEventListener('click', util.getSystemDetails);
				if(elems4mCO.indexOf(elem.textContent) < 0){
					elem.classList.add('error');
				}
			});
        }
    },
    formatCOs: function() {
        // console.log('Ticket-power:v1 formatCOs');
        let COs = document.querySelectorAll('#linkingmodule > div.mod-content > div > dl:nth-child(1) > dd');
        for (let co of COs) {
            if (co.children.length > 0) {
                // console.log('Ticket-power:v1 formatCOs', co);
                this.formatIndividualCO(co);
            }
        }
    },
    formatIndividualCO: async function(ref) {
        let CO = ref.children[0].textContent.replaceAll('\n', '').trim();
        CO = CO.substring(0, CO.indexOf(' '));
        if (CO !== 'COT-1') {
            // console.log('Ticket-power:v1 formatIndividualCO', CO, ref);
            let details = await this.getCOdetails(CO);
			console.log('Ticket-power:v1 formatIndividualCO-Details', CO, details);

			let coDateCheck = details.dateStart == details.dateEnd; //COs must be on same days
			
            let newElem = document.createElement('span');
            newElem.className = 'co-details';
            newElem.innerHTML = `<span class="sys-pill">${details.sys}</span>
            					<span class="co-version">${details.version}</span>
            					<span class="co-summary">${details.summary}</span>
            					<span class="co-dates ${ coDateCheck ? '' : 'error' }">${details.dateStart} → ${details.dateEnd}</span>
            					`;
            let sys4mTable = [];
	        document.querySelectorAll('#customfield_16213-val li').forEach((sys)=>{
	        	sys4mTable.push(sys.textContent);
	        });
            let targetElement = ref.querySelector('div.link-content > p > span > span');
            if (targetElement) {
				targetElement.parentNode.insertBefore(newElem, targetElement.nextSibling);
				
				let elem = ref.querySelector('div.link-content > p > span > span > .sys-pill');
				elem.addEventListener('click', this.getSystemDetails);
				
				if(sys4mTable.indexOf(elem.textContent) < 0){
					elem.classList.add('error');
				}
	        }
        }
        
        this.checkCOMaxMin();
        this.formatSystems();
        this.handleWindowResize();
    },
    getCOdetails: async function (CO) {
        try {
            const response = await fetch('https://kmc.corp.hkjc.com/rest/api/2/issue/' + CO);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const obj = await response.json();
            // console.log('Ticket-power:v1 getCOdetails-Success:', CO, obj);
            let returnObj = {};
            returnObj['cot'] = obj.key;
            returnObj['crq'] = obj.fields.summary;
            returnObj['status'] = obj.fields.status.name;
            returnObj['sys'] = obj.fields.customfield_13104.value.toUpperCase();
            returnObj['summary'] = obj.fields.customfield_24201;
            returnObj['version'] = (obj.fields.customfield_24500) ? obj.fields.customfield_24500 : '';
            returnObj['created'] = this.formatDate(obj.fields.created);
            returnObj['updated'] = this.formatDate(obj.fields.updated);
            returnObj['dateStart'] = this.formatDate(obj.fields.customfield_15231);
            returnObj['dateEnd'] = this.formatDate(obj.fields.customfield_15233);
            return returnObj;
        } catch (error) {
            console.error('Ticket-power:v1 getCOdetails-Error:', CO, error);
        }
    },
    getSystemDetails: function() {
    	let sys = this.textContent || event.target.textContent;
    	console.log('Ticket-power:v1 getSystemDetails', sys.toUpperCase());
    },
    checkCOMaxMin: function() {
    	//Get CO - Max-Min dates
        let elems = document.querySelectorAll('.co-dates');
        // console.log('Ticket-power:v1 checkCOMaxMin', elems);
        let coDateArr = [];
        for(let i of elems) {
         	let dt = i.textContent.split(' → ');
        	coDateArr = coDateArr.concat(dt);
        }

        let dtStart = new Date(this.formatDate(document.querySelector('#customfield_15231-val > span:nth-child(1) > time').dateTime));
        let dtEnd = new Date(this.formatDate(document.querySelector('#customfield_15233-val > span:nth-child(1) > time').dateTime));
        
        coDateArr = coDateArr.map(i => new Date(i));
        coDateArr = coDateArr.sort((a,b) => a.getTime() - b.getTime());
        let dtMin = coDateArr[0];
        let dtMax = coDateArr[coDateArr.length - 1];
        
        if(dtStart.toString() != dtMin.toString()) {
        	document.querySelector('#customfield_15231-val').classList.add('error');
        }
        if(dtEnd.toString() != dtMax.toString()) {
        	document.querySelector('#customfield_15233-val').classList.add('error');
        }
    },
    formatDate: function (dt) {
    	let date = new Date(dt);
    	if (date && (date instanceof Date) && (typeof(date.getMonth) == 'function')){
		    const months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
		    const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with zero if needed
		    const month = months[date.getMonth()]; // Get month name
		    const year = date.getFullYear(); // Get full year
		    return `${day}-${month}-${year}`; // Format as DD-Mon-YYYY
	    } else {
	    	return '';
	    }
	},
	handleWindowResize: function() {
		let refElem = document.querySelector('#linkingmodule > div.mod-content > div > dl:nth-child(1)');
		let targetWidth = refElem.offsetWidth;
		console.log(`Height: ${window.innerHeight} & Width: ${window.innerWidth} --> ${targetWidth}px`);
		
		if (window.innerWidth <= 1500) {
			document.querySelectorAll('.links-list:nth-child(1) .link-content').forEach((e) => {
				e.style.height = '60px';
			});
			document.querySelectorAll(".co-details").forEach((e) => {
			    e.style.left = '110px';
			    e.style.top = '27px';
			});
			document.querySelectorAll(".co-summary").forEach((e) => {
			    e.style.width = (targetWidth - 200) + 'px';
			});
		} else {
			document.querySelectorAll('.links-list:nth-child(1) .link-content').forEach((e) => {
				e.style.height = '30px';
			});
			document.querySelectorAll(".co-details").forEach((e) => {
			    e.style.left = '250px';
			    e.style.top = '1px';
			});
			document.querySelectorAll(".co-summary").forEach((e) => {
			    e.style.width = (targetWidth - 400) + 'px';
			});
		}
	},
    test: function (url) {
        try {
            fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: (url.indexOf('deopconf') > 0) ? `Bearer ${this.konst.keyCONFLUENCE}` : `Bearer ${this.konst.keyJIRA}`,
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => console.log('Success:', data))
            .catch((error) => console.error('Error:', error));
        } catch (error) {
            console.error('Try-Catch Error:', error);
        }
    }
};

util.init();

//document.querySelector('#customfield_15231-val').classList.remove('error'); document.querySelector('#customfield_15233-val').classList.remove('error');
//util.checkCOMaxMin();