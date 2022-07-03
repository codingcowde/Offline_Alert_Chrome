// initialise global urls array
let urls;

function init(){
    load_urls();       
    load_settings();
    check_urls();
}

(() => { 
    init()
})()

chrome.runtime.onInstalled.addListener(init())

// setup the timer ToDo make configurable with fixed options 1min 5min 10min 1h
function setup_timer(minutes){
    chrome.alarms.create("alarm", {    
        delayInMinutes: minutes,
        periodInMinutes: minutes
    }); 
}

// iterate urls and run check_status on them
function check_urls() {      
    if(urls){
       urls.forEach(url => {
            check_status(url);
        });
    }
}

// this function checks the status of all stored urls
async function check_status(url) {
    if(url.mute){
        return; // remove when implementing statistics
    }
    fetch(url.url)
        .then((response) => {
            url.status = response.status;            
            save_urls();          
        })
        .catch(function (err) {            
            if(url.status === undefined) {
                url.status = 0;
            }
            save_urls()
            push_notification(url);           
        })
    }


// Push Notification
function push_notification(url) { 
    if(url === undefined || url.mute){      
        return;
    }
    const notification_id = 'url'+url.name+'?status='+url.status;

    const notification_options = {
        type: 'basic',
        iconUrl: url.img,
        title: 'Your Page '+url.name+' is not responding!',
        message: 'We got a status of '+url.status+' which means we could not reach the server '+url.url+'.',        
        contextMessage: 'You can mute this URL while you are fixing the issue or delete the URL if your no longer responsible',
        buttons: [{
            title: "Mute"
          //  iconUrl: "/path/to/yesIcon.png"
        }, {
            title: "Delete"
            //iconUrl: "/path/to/noIcon.png"
        }]
    };
    chrome.notifications.create(notification_id, notification_options);  
}


// Functions to save, load and delete from local storage
function save_urls() {
    chrome.storage.sync.set({ "urls": urls });
}

async function load_urls(){
     chrome.storage.sync.get("urls", function (result) {
        if (result) {
            urls = result.urls;
        } else {
            /// setting up example urls
            urls = [{                    
                "url": "https://checker.codingcow.de",
                "img": "https://checker.codingcow.de/res/img/favicon-32x32.png",
                "name": "CHecker.codingcow.de",
                "status": 0,
                "mute": false
            },
            {                    
                "url": "https://codingcow.de",
                "img": "https://codingcow.de/res/img/favicon-32x32.png",
                "name": "codingcow.de",
                "status": 0,
                "mute": false
            }]
        }
        chrome.storage.sync.set({ "urls": urls });            
    })       
}

// functions to read the settings from options
async function load_settings(){
 let settings;
 chrome.storage.sync.get("settings", function (result) {                    
        if(result){
            settings = result.settings
            setup_timer(Number(result.settings.interval))
            //setup_theme(result.settings.theme)            
        }else{
            settings = {'interval':5, 'theme':'dark'};    
            setup_timer(Number(settings.interval));         
        }                        
    })
}