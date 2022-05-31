chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>{    
});


var urls;

chrome.runtime.onInstalled.addListener(
    function(){
        chrome.storage.local.get("urls",function(result){        
            if(result){
                urls = result.urls;
            }else{
                urls = [{
                    "id":0,
                    "url":"https://bbtest.de/",
                    "img":"https://checker.codingcow.de/res/img/favicon-32x32.png",    
                    "name":"Test 200",
                    "status":0
                },
                {
                    "id":1,
                    "url":"https://bbtest.de/nothing_here",
                    "img":"https://codingcow.de/res/img/favicon-32x32.png",    
                    "name":"Test 400",
                    "status":0
                }]
            }
            chrome.storage.local.set({"urls":urls});
            })
    })   
  

chrome.alarms.create("5min", {
    delayInMinutes: 10,
    periodInMinutes: 10
});

      
chrome.alarms.onAlarm.addListener(function(alarm) {
if (alarm.name === "5min") {
        check_urls()
}
});


function check_urls(){
    chrome.storage.local.get("urls",function(result){        
        urls = result.urls             
    })      
    
    urls.forEach(url => {
         check_status(url);
    });
}


async function check_status(url)
{
    fetch(url.url)
    .then((response) => {
        url.status = response.status;      
        chrome.storage.local.set({"urls":urls})  
    })
    .catch(function(err) {
        url.status = 0;      
        chrome.storage.local.set({"urls":urls})  
        /// fire notification 
    });
}
