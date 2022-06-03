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
    new_url = document.getElementById("new_url").value;    
    document.getElementById("new_url").value = '';
    urls = urls.filter(data => data.url != new_url); // delete all existing entrys with same url
    new_name = new_url.replace("https://", "").replace("http://", "");
    urls.push({ 'name': new_name, 'url': new_url, 'img': 'img/32.png', 'status': 0 })    
    save();
    refresh();
    show_urls();
}

function delete_url() {
    target = this;
    urls = urls.filter(data => data.url != target.name)
    save();
    refresh();
    show_urls();
}

function save() {
    chrome.storage.local.set({ "urls": urls });
}


function populate() {
    view = document.getElementById("urls-view")
    if (urls) {
        view.innerHTML = '';
        urls.forEach(url => {
            let class_status = "status-400";
            view.innerHTML += "<div class='url'> <ul><li><img id='img" + url.name + "' src='" + url.img + "' class='" + class_status + "'  /> </li><li><a class='" + class_status + "' href='" + url.url + "' target='_blank' id='link" + url.name + "'>" + url.name + "</a></li><li><button class='btn del_btn' name=" + url.url + ">del</button></li></ul></div>";
            check_status(url.url, response => {
                class_status = "status-" + response.status;
                document.getElementById('img' + url.name).classList = class_status;
                document.getElementById('link' + url.name).classList = class_status;
            })
        });
        var del_btns = document.getElementsByClassName("del_btn");
        if (del_btns) {
            console.log(del_btns)
            for (let i = 0; i < del_btns.length; i++) {
                del_btns.item(i).addEventListener("click", delete_url)
            }
        }
    }
}


async function check_status(url, callback) {
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4)
            callback(xmlHttp);
    }
    xmlHttp.open("HEAD", url, true); // true for asynchronous 
    xmlHttp.setRequestHeader("Access-Control-Allow-Origin", url)
    xmlHttp.send();
}

function refresh() {
    chrome.storage.local.get('urls', function (result) {
        urls = result.urls;
        show_urls();
    });    
}