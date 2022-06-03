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
                    "status": 0
                },
                {                    
                    "url": "https://codingcow.de",
                    "img": "https://codingcow.de/res/img/favicon-32x32.png",
                    "name": "codingcow.de",
                    "status": 0
                }]
            }
            chrome.storage.local.set({ "urls": urls });
        })
    })

// setup the timer ToDo make configurable with fixed options 1min 5min 10min 1h
chrome.alarms.create("5min", {
    delayInMinutes: 5,
    periodInMinutes: 5
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
            console.log("fire");
            if(url.status === undefined) {
                url.status = 0;
            }
            save_urls()
            push_notification(url);            
            
        });}


// Push Notification
function push_notification(url) {
    if(url === undefined){
        return;
    }
    const notification_id = 'url'+url.name+'?status='+url.status;

    const notification_options = {
        type: 'basic',
        iconUrl: 'img/512.png',
        title: 'Your Page '+url.name+' is not responding!',
        message: 'We got a status of '+url.status+' which means we could not reach the server '+url.url+'.'
    };
    chrome.notifications.create(notification_id, notification_options);  
}

// Functions to save, load and delete from local storage
function save_urls() {
    chrome.storage.local.set({ "urls": urls });
}

function load_urls(){
    chrome.storage.local.get("urls", function (result) {
        urls = result.urls
    })
}
