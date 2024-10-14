console.log('Ticket-power:v1');

var util = {
    konst: {
        url1: 'https://deopconf01.corp.hkjc.com/download/attachments/136033628/SysInfo-Data.json',
        url2: 'https://kmc.corp.hkjc.com/browse/RGB-12271',
        url3: 'https://kmc.corp.hkjc.com/rest/api/2/issue/COT-1774',
        systemInfo: '',
        
        keyJIRA: '',
        keyCONFLUENCE: ''
    },
    init: function () {
        console.log('Ticket-power:v1 init');
        
        this.formatSystems();
        this.formatCOs();
    },
    formatSystems: function() {
        console.log('Ticket-power:v1 formatSystems');
        let newDiv = document.createElement('div');
        newDiv.id = 'tempDiv';
        newDiv.className = 'temp-class';
        newDiv.innerHTML = '';
        let targetElement = document.getElementById('customfield_16213-val');
        if (targetElement) {
            targetElement.parentNode.insertBefore(newDiv, targetElement.nextSibling);
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

			let coDateCheck1 = details.dateStart == details.dateEnd; //COs must be on same days
			
            let newElem = document.createElement('span');
            newElem.className = 'co-details';
            newElem.innerHTML = `<span class="sys-pill">${details.sys}</span>
            					<span class="co-version">${details.version}</span>
            					<span class="co-summary">${details.summary}</span>
            					<span class="co-dates ${ coDateCheck1 ? '' : 'error' }">${details.dateStart} → ${details.dateEnd}</span>
            					`;
            let targetElement = ref.querySelector('div.link-content > p > span > span');
            if (targetElement) {
				targetElement.parentNode.insertBefore(newElem, targetElement.nextSibling);
				
				let elem = ref.querySelector('div.link-content > p > span > span > .sys-pill');
				elem.addEventListener('click', this.getSystemDetails);
	        }
        }
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
            returnObj['sys'] = obj.fields.customfield_13104.value;
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