chrome.runtime.onload = refresh()

var urls; 




var toggle_view_btn = document.getElementById("toggle-list");
if(toggle_view_btn){
    toggle_view_btn.addEventListener("click", toggle_view);
}

var add_frm = document.getElementById("add_url_form");
if(add_frm){
    add_frm.addEventListener("submit", add_url);
}


function toggle_view(){
    view = document.getElementById("url-card-view")    
    if(toggle_view_btn.innerText === "View Url List"){
        toggle_view_btn.innerText = "Hide Url List";
        populate()
    }else if(toggle_view_btn.innerText === "Hide Url List"){
        toggle_view_btn.innerText = "View Url List";
        view.innerHTML='';
    }
}



function add_url(){
    new_url = document.getElementById("url").value; 
    new_name = new_url.replace("https://","").replace("http://","");
    urls.push({'name':new_name, 'url':new_url, 'img':'img/32.png','status':0}) 
    save();
    console.log(urls)
    refresh();    

}

function delete_url(){    
        target = this;
        console.log(this+" target "+target)
        urls = urls.filter(data => data.url != target.name)
        save();
        refresh();
        populate();
}

async function save(){    
    chrome.storage.local.set({"urls":urls});  
}


function populate(){
    view = document.getElementById("url-card-view")    
    if(urls){
        view.innerHTML = '';
        urls.forEach(url => {
            let class_status = "status-400";
            view.innerHTML +="<div class='url-card'> <ul><li><img id='img"+url.name+"' src='"+url.img+"' class='"+class_status+"'  /> </li><li><a class='"+class_status+"' href='"+url.url+"' target='_blank' id='link"+url.name+"'>"+url.name+"</a></li><li><button class='btn del_btn' name="+url.url+">del</button></li></ul></div>";
            check_status(url.url,  response =>  {                
                    class_status = "status-"+response.status;                                   
                    document.getElementById('img'+url.name).classList = class_status;
                    document.getElementById('link'+url.name).classList = class_status;                    
                    console.log(response)                  
                    
            })
        
        // we need an index in our array
            
           
        });
        var del_btns = document.getElementsByClassName("del_btn");
        if(del_btns){
            console.log(del_btns)
            for(let i=0; i < del_btns.length; i++){
                del_btns.item(i).addEventListener("click", delete_url)
            }            
        }   
    }
}



async function check_status(url, callback)
{
    var xmlHttp = new XMLHttpRequest();
    
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4)
            callback(xmlHttp);
    }
    xmlHttp.open("HEAD", url, true); // true for asynchronous 
    xmlHttp.setRequestHeader("Access-Control-Allow-Origin", url)
    xmlHttp.send();
}

async function refresh(){    
    chrome.storage.local.get('urls',function(result){
        console.log(result.urls);
        urls = result.urls;
    })      
}