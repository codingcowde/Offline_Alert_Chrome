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
    populate()
}

function hide_urls() {    
    toggle_view_btn.innerText = "View Url List";            
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
    urls.push({ 'name': new_name, 'url': new_url, 'img': 'img/32.png', 'status': 0 })  
    

    // save to storage and reload view
    save_urls();
    refresh();
    
}

function delete_url() {
    target = this;
    urls = urls.filter(data => data.url != target.name)
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
            view.innerHTML += "<div class='url'> <ul><li><img id='img" + url.name + "' src='" + url.img + "' class='" + class_status + "'  /> </li><li><a class='" + class_status + "' href='" + url.url + "' target='_blank' id='link" + url.name + "'>" + url.name + "</a></li><li><button class='btn del_btn' name=" + url.url + ">del</button></li></ul></div>";
        });
        register_del_btn_events();
    }
}


function register_del_btn_events() {
    var del_btns = document.getElementsByClassName("del_btn");
    if (del_btns) {        
        for (let i = 0; i < del_btns.length; i++) {
            del_btns.item(i).addEventListener("click", delete_url);
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
