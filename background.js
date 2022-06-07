chrome.runtime.onload = function (){
    load_urls()
    check_urls()
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
});

/// chrome.notifications.onShowSettings.addListener()

let urls;

chrome.runtime.onInstalled.addListener(
    function () {
        chrome.storage.local.get("urls", function (result) {
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
            chrome.storage.local.set({ "urls": urls });
        })
    })

// setup the timer ToDo make configurable with fixed options 1min 5min 10min 1h
chrome.alarms.create("5min", {
    delayInMinutes: 0.5,
    periodInMinutes: 0.5
});

// register alarm listener
chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === "5min") {
        check_urls()
    }
});

// iterate urls and run check_status on them
function check_urls() {      
    urls.forEach(url => {
        check_status(url);
    });
}

// this function checks the status of all stored urls
async function check_status(url) {
    fetch(url.url)
        .then((response) => {
            url.status = response.status;            
            save_urls();
            console.log(url.name+" is live ans shows "+ url.status)         
          
        })
        .catch(function (err) {            
            if(url.status === undefined) {
                url.status = 0;
            }
            save_urls()
            push_notification(url);            
            
        });}


// Push Notification
function push_notification(url) {
    console.log("No notification sent as url.mute is"+url.mute)

    if(url === undefined || url.mute){
        console.log("No notification sent as url.mute is"+url.mute)
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
async function save_urls() {
    chrome.storage.local.set({ "urls": urls });
}

async function load_urls(){
    chrome.storage.local.get("urls", function (result) {
        urls = result.urls
    })
}
