settings = {}

let save_btn = document.getElementById("Save");
if (save_btn) {
    save_btn.addEventListener("click", save_settings);
}


function load_settings(){
    chrome.storage.sync.get("settings", function (result) {            
        settings = result.settings
        if(result.settings === undefined){
            settings = {'interval':5, 'theme':'dark'} 
        }        
        document.getElementById('timer_minutes').value = settings.interval;    
        return result.settings
    })
}

document.onload = load_settings()

function save_settings(){            
    settings.interval = document.getElementById('timer_minutes').value
    chrome.storage.sync.set({ "settings": settings });    
}






