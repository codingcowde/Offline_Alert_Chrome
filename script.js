chrome.runtime.onload = refresh()

let urls;



let toggle_view_btn = document.getElementById("toggle-list-btn");
if (toggle_view_btn) {
    toggle_view_btn.addEventListener("click", toggle_view);
}

let save_btn = document.getElementById("add_url_btn");
if (save_btn) {
    save_btn.addEventListener("click", add_url);
}


function show_urls() {    
    toggle_view_btn.innerText = "Hide Url List";            
    toggle_view_btn.classList="list_shown";
    populate()
}

function hide_urls() {    
    toggle_view_btn.innerText = "View Url List";            
    toggle_view_btn.classList="list_hidden";
    view.innerHTML = '';
}

function toggle_view() {
    view = document.getElementById("urls-view")
    if (toggle_view_btn.innerText === "View Url List") {
        
       show_urls()
    } else if (toggle_view_btn.innerText === "Hide Url List") {
        hide_urls()
    }
}

function add_url() {
    // get the value from the input field
    new_url = document.getElementById("new_url").value;        
    chrome.runtime.sendMessage({action: "url_added"});

    // check if input is valid and abort if not
    let expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi
    if(!expression.test(new_url)){
        alert('Enter a valid URL, please.')
        return; 
    }

    // if input was valid clear the input field
    document.getElementById("new_url").value = '';

    // we need to find a better solution
    new_name = new_url.replace("https://", "").replace("http://", "");
    new_url = 'https://' + new_name;
    
    // delete all existing entrys with same url
    urls = urls.filter(data => data.url != new_url); 
    
    // add new url to urls    
    urls.push({ 'name': new_name, 'url': new_url, 'img': 'img/32.png', 'status': 0, 'mute':false})      

    // save to storage and reload view
    save_urls();
    refresh();
    
}
// called by the del_btn click event
function delete_url() {
    target = this;
    urls = urls.filter(data => data.url != target.name)
    save_urls();
    refresh(); 
}

// called by the mute buttons click event
function toggle_mute_url_notification() {
    target = this;    
    // get the selected url 
    url = urls.filter(data => data.url === target.name)[0];    
    // check if mute true false or undefined and reverse value
    url.mute = url.mute === undefined ? true : !url.mute;        
    save_urls();
    refresh(); 
}

function toggle_url_settings() {
    target = this;       
    settings_box = document.getElementById("url-settings-"+this.name);
    if(settings_box.classList == "url-settings hidden"){
        settings_box.classList = "url-settings visible";
        return;
    }
    if(settings_box.classList == "url-settings visible"){
        settings_box.classList ="url-settings hidden";
        return;
    }      
    
    //refresh(); 
}


function save_urls() {
    chrome.storage.sync.set({ "urls": urls });
}

function populate() {
    view = document.getElementById("urls-view");
    if (urls) {
        view.innerHTML = '';
        urls.forEach(url => {
            let class_status = "status-"+url.status;
            let class_muted = url.mute ? "muted":"mute";                       
            view.innerHTML += "<div class='url'> <ul><li><img id='img" +
            url.name + "' src='" + url.img + "' class='" + class_status +
             "'  /> </li><li><a class='" + class_status +" url-"+class_muted+" ' href='" + url.url + 
             "' target='_blank' id='link" + url.name + "'>" + url.name + 
             "</a></li><li>"+       
             "<button class='btn settings' name='" + url.url + "' />"+
             "<button class='btn "+class_muted+"' name='" + url.url + "' />"+
             "<button class='btn delete' name='" + url.url + "' />"+
             "</li></ul>"+
                "<div class='url-settings hidden' id='url-settings-"+url.url+"'>"+
                    "<div>"+
                        "<div>"+
                            "<label for='url_"+url.url+"'>Url: </label>"+
                            "<input type='url' id='url_"+url.url+"' value='"+url.url+"'>"+
                        "</div><div>"+
                        "<label for='name_"+url.url+"'>Name: </label>"+
                            "<input type='text' value='"+url.name+"'>"+
                        "</div><div>"+
                            "<label for='favico_"+url.url+"'>Icon: </label>"+
                            "<input type='url' value='"+url.img+"'>"+
                        "</div>"+     
                        "<div>"+     
                            "<button > Save </button>"+
                        "</div>"+     
                        "<div>"+     
                            "status: "+url.status+             
                        "</div>"+     
                    "</div>"+          
                "</div>"+
             "</div>";
        });
        register_delete_button_events();
        register_mute_button_events();
        register_settings_button_events();
    }
}


function register_delete_button_events() {
    let delete_buttons = document.getElementsByClassName("btn delete");
    if (delete_buttons) {        
        for (let i = 0; i < delete_buttons.length; i++) {
            delete_buttons.item(i).addEventListener("click", delete_url);            
        }
    }
}

function register_mute_button_events() {
    let mute_buttons = document.getElementsByClassName("btn mute");     
    let muted_buttons = document.getElementsByClassName("btn muted");     
    if (mute_buttons || muted_buttons) {        
        for (let ji = 0; ji < mute_buttons.length; ji++) {
            mute_buttons.item(ji).addEventListener("click", toggle_mute_url_notification);                     
        }        
        for (let j = 0; j < muted_buttons.length; j++) {
            muted_buttons.item(j).addEventListener("click", toggle_mute_url_notification);                     
        }        
    }
}

function register_settings_button_events() {
    let settings_buttons = document.getElementsByClassName("btn settings");
    if (settings_buttons) {        
        for (let i = 0; i < settings_buttons.length; i++) {
            settings_buttons.item(i).addEventListener("click", toggle_url_settings);            
        }
    }
}



// we have to handle this here as the backend doesn't allow for html parsing - ToDo: go check the docs
async function update_url(url) {
    fetch(url.url)
        .then((response) => {
            url.status = response.status;            
            return response.text()
        })        
        .then((html) => {
            let parser = new DOMParser();
            let response_dom = parser.parseFromString(html,"text/html");
            let link_rels = response_dom.getElementsByTagName("link");
            let icon_url;
            let icon_url_fallback = "./img/32.png";    

            // get the favicon and possible fallbacks       
            for (let i = 0; i < link_rels.length; i++) {
                if(link_rels.item(i).rel ==="icon"){
                    // there is no need for additional logic as the above line replaces only relative pathes found in the href
                    icon_url = link_rels.item(i).href.replace("chrome-extension://"+chrome.runtime.id,url.url);                   
                }
                if(link_rels.item(i).rel.indexOf("icon") >= 0 || link_rels.item(i).rel === "apple-touch" ){
                    // there is no need for additional logic as the above line replaces only relative pathes found in the href
                    icon_url_fallback = link_rels.item(i).href.replace("chrome-extension://"+chrome.runtime.id,url.url);                   
                }
            }            
            // set the icon for the url object
            if(icon_url){
                url.img = icon_url;                
            } else {
                url.img = icon_url_fallback;                
            }
            save_urls()
        })
        .catch(function (err) {
            console.log(err);
            if(url.status === undefined) {
                url.status = 0;
            }
            url.img = "./img/32.png";            
            save_urls()            
        });
}


function refresh() {
    chrome.storage.sync.get('urls', function (result) {
        urls = result.urls;
        update_urls();
        show_urls();
    });    
}

function update_urls() {
    urls.forEach(url => {       
        update_url(url);
    });
}

// Message Listener in a frontend script ????
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {   
    if(request.type === "play_alarm" ){
        audio = new Audio('media/dong01.ogg');
        audio.play()        
    } 
});