chrome.runtime.onload = refresh()

var urls;

var toggle_view_btn = document.getElementById("toggle-list-btn");
if (toggle_view_btn) {
    toggle_view_btn.addEventListener("click", toggle_view);
}

var add_btn = document.getElementById("add_url_btn");
if (add_btn) {
    add_btn.addEventListener("click", add_url);
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

    // check if input is valid and abort if not
    var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi
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

function save_urls() {
    chrome.storage.local.set({ "urls": urls });
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
             "'  /> </li><li><a class='" + class_status + "' href='" + url.url + 
             "' target='_blank' id='link" + url.name + "'>" + url.name + 
             "</a></li><li>"+       
             "<button class='btn "+class_muted+"' name='" + url.url + "' />"+
             "<button class='btn delete' name='" + url.url + "' />"+
             "</li></ul></div>";
        });
        register_delete_button_events();
        register_mute_button_events();
    }
}


function register_delete_button_events() {
    var delete_buttons = document.getElementsByClassName("delete");
    if (delete_buttons) {        
        for (let i = 0; i < delete_buttons.length; i++) {
            delete_buttons.item(i).addEventListener("click", delete_url);            
        }
    }
}

function register_mute_button_events() {
    var mute_buttons = document.getElementsByClassName("mute");     
    var muted_buttons = document.getElementsByClassName("muted");     
    if (mute_buttons || muted_buttons) {        
        for (let ji = 0; ji < mute_buttons.length; ji++) {
            mute_buttons.item(ji).addEventListener("click", toggle_mute_url_notification);                     
        }        
        for (let j = 0; j < muted_buttons.length; j++) {
            muted_buttons.item(j).addEventListener("click", toggle_mute_url_notification);                     
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
            var parser = new DOMParser();
            var response_dom = parser.parseFromString(html,"text/html");
            var link_rels = response_dom.getElementsByTagName("link");
            var icon_url;
            var icon_url_fallback = "./img/32.png";    

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
    chrome.storage.local.get('urls', function (result) {
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
