var FORDEMO = false;
var LIBID;
var CURRENTCONTEXT = "";
var CURRENTSYMBOLOGY = "";
var HTML = null;

const CACHE_BASE64 = new Map();

$(document).ready(function () {

    var body = $("#body");

    $.get('https://cdn.jsdelivr.net/gh/svgsymbology/web1/consoleContextUI.html', function(contents) {
        HTML = $.parseHTML(contents);
        body.append(HTML);
        buildUI();        
    },'text');

});

function buildUI(){
    
    $(document).tooltip();

    $("#showNavigator").checkboxradio();
    $("#showNavigator").click(function () {
        $("#navigator").toggle();
    });

    $("#contextsChoose").checkboxradio();
    $("#contextsChoose").button().click(function () {
        $("#contextsChooseL").empty();
        if (FORDEMO) {
            FORDEMO = false;
            $("#contextsChooseL").append("Actual");
        } else {
            FORDEMO = true;
            $("#contextsChooseL").append("Demo");
        }
        getContextLibs(FORDEMO);
    });

    $("#navigator").toggle();
    var contextId = (new URL(location.href)).searchParams.get('contextId');
    if(!contextId){
        contextId = "00000000000000000000000000000000";    
    }
    if (contextId) {
        getContextsForContext(contextId);
    }

    getRootContexts();
    getContextLibs(FORDEMO);
    $('#libContexts').dataTable({
        "paging": false,
        "searching": false,
        "ordering": false,
        "scrollCollapse": true,
        "scrollY": 500,
        "info": false,
        "lengthChange": true,
        "autoWidth": false,
        "header": false,
        fixedHeader: {
            "header": false,
            "footer": false
        }
    });

    $('#rootTbl').dataTable({
        "paging": false,
        "searching": false,
        "ordering": false,
        "scrollCollapse": true,
        "scrollY": 500,
        "info": false,
        "lengthChange": true,
        "autoWidth": false,
        "header": false,
        fixedHeader: {
            "header": false,
            "footer": false
        }
    });    
    
    $("#symbologyInfo").button({text: false,icons: {primary: "ui-icon.symbology"}});

}

function getRootContexts() {
    $.ajax({
        url: BASEURL + "jquery/rootabrevcontexts/"
    }).then(function (data) {
        $("#rootContent").find("tr").remove().end();
        for (var i = 0; i < data.length; i++) {
            $("#rootContent").append("<tr><td><img onclick=\"viewContextSvg('" + data[i].id + "',true,true);\" src=\"" + data[i].base64image + "\" title=\"Context : " + data[i].name + " - " + data[i].id + "\" style=\"cursor:pointer;\"/></td></tr>");
        }
    });
}

function getContextLibs(isForDemo) {
    $.ajax({
        url: BASEURL + "jquery/contextLibraries/?demo=" + isForDemo
    }).then(function (data) {

        var select = "<select id=\"contextLibs\" name=\"contextLibs\">\n<option value=\"0\">Context Libs</option>\n";

        for (var i = 0; i < data.length; i++) {
            if (LIBID) {
                if (data[i].id === LIBID) {
                    select += "<option selected=\"selected\" value=" + data[i].id + ">" + data[i].name + "</option>";
                } else {
                    select += "<option value=" + data[i].id + ">" + data[i].name + "</option>";
                }
            } else {
                select += "<option value=" + data[i].id + ">" + data[i].name + "</option>";
            }
        }
        select += "</select>";

        $("#selectMenu").empty();
        $("#selectMenu").append(select);

        var contextLibs = $("#contextLibs").selectmenu({width: 180});
        contextLibs.selectmenu("menuWidget").addClass("option_class");
        contextLibs.selectmenu("widget").addClass("option_class");
        $("#contextLibs").on("selectmenuchange", function () {
            getLibContexts(this.value);
        });
    });
}

function getLibContexts(lib) {
    $.ajax({
        url: BASEURL + "jquery/contextLibraryContexts/" + lib + "/"
    }).then(function (data) {
        $("#navigatorContent").find("tr").remove().end();
        for (var i = 0; i < data.length; i++) {
            $("#navigatorContent").append("<tr><td><img onclick=\"viewContextSvg('" + data[i].id + "',true,true);\" src=\"" + data[i].base64image + "\" title=\"Context : " + data[i].name + " - " + data[i].id + "\" style=\"cursor:pointer;\"/></td><td onclick=\"viewContextSvg('" + data[i].id + "',true,true);\" title=\"Context : " + data[i].name + " - " + data[i].id + "\" style=\"cursor:pointer;\" class=\"contextText\">" + data[i].name + "</td></tr>");
        }
    });
}

function viewContextSvg(contextId, addViewContextIcon, clearContextIcons) {
    CURRENTCONTEXT = contextId;
    var url = BASEURL + "contextConsole/" + contextId + "/contextConsole.html?fitWidth=480&fitHeight=500";
    $("#contentFrm").attr("src", url);
    if (clearContextIcons) {
        CACHE_BASE64.clear();
        $("#trackerDiv").empty();
    }
    if (addViewContextIcon) {
        viewContextIcon(contextId);
    }
    loopTracker(CURRENTCONTEXT);
}

function viewContextIcon(contextId) {
    $.ajax({
        url: BASEURL + "jquery/symbologyContextById/" + contextId + "/"
    }).then(function (data) {
        CURRENTCONTEXT = contextId;
        CURRENTSYMBOLOGY = data.symbologyId;
        trackerImages();
        if(!CACHE_BASE64.get(CURRENTCONTEXT)){
            CACHE_BASE64.set(CURRENTCONTEXT, CURRENTCONTEXT);
            $("#trackerDiv").append(wrapBase64Image(data));
        }
        loopTracker(CURRENTCONTEXT);
    });
}

function loopTracker(contextId){
    $("#trackerDiv").children('img').each(function() { 
        var image = $(this); 
        if(image.attr('id') == contextId){
            image.css('border', "solid 2px red");
        }else{
            image.css('border', "solid 0px white");
        }
    });
}

function getContextsForContext(contextId) {
    viewContextSvg(contextId, true, false);
    $.ajax({
        url: BASEURL + "jquery/symbologyContextById/" + contextId + "/"
    }).then(function (data) {
        LIBID = data.libraryId;
        getLibContexts(data.libraryId);
        if (data.libraryId < 8) {
            //demo context
            $("#contextsChooseL").empty();
            $("#contextsChooseL").append("Demo");
            FORDEMO = true;
            $("#selectMenu").empty();
            var select = "<select id=\"contextLibs\" name=\"contextLibs\" title=\"Context Library\"><option value=\"0\">Context Libs</option></select>";
            $("#selectMenu").append(select);
            getContextLibs(FORDEMO);
        }
    });
}

function wrapBase64Image(data) {
    return "<img src=\"" + data.base64image + "\" onclick=\"viewContextSvg('" + data.id + "',false,false);\" title=\"Context : " + data.name + " - " + data.id + "\" id=\"" + data.id + "\" style=\"cursor:pointer;margin-right:4px;\" alt=\"Base64Image\" />";
}

function trackerImages() {
    $('#trackerDiv').children().each((index, element) => {
        //console.log(index + " - " + $(element).attr("name"));     // children's index
    });
}

function getQueryParam(param, defaultValue = undefined) {
    location.search.substr(1)
            .split("&")
            .some(function (item) { // returns first occurence and stops
                return item.split("=")[0] == param && (defaultValue = item.split("=")[1], true);
            });
    return defaultValue;
}

function navigateConsole(page) {
    switch (page) {
        case 'channel.html':
//            $(window).width();   // returns width of browser viewport
//            $(document).width(); // returns width of HTML document
            var WIDTH = 500;
            var HEIGHT = 400;
            if (window.matchMedia("(pointer: coarse)").matches) {
                // TOUCH DEVICE
                console.log('TOUCH');
                WIDTH = $(window).width();
                HEIGHT = $(window).height();
            }else{
                console.log('PC');
            }
            var url = '';
            if (CURRENTCONTEXT) {
                url = BASEURL + page + '?showTracker=true&trackerScale=1.0&glass=false&color=0178af&navColor=b5d7e8&fitWidth=' + WIDTH + '&fitHeight=' + HEIGHT + '&contextId=' + CURRENTCONTEXT;
            } else {
                url = BASEURL + page + '?showTracker=true&trackerScale=1.0&glass=false&color=0178af&navColor=b5d7e8&fitWidth=' + WIDTH + '&fitHeight=' + HEIGHT;
            }
            window.open(url, "_blank");
            break;
        case 'context.svg':
            var WIDTH = 500;
            var HEIGHT = 400;            
            if (window.matchMedia("(pointer: coarse)").matches) {
                // TOUCH DEVICE
                console.log('TOUCH');
                WIDTH = $(window).width();
                HEIGHT = $(window).height();
            }            
            if (CURRENTCONTEXT) {
                var url = BASEURL + 'animatedContext/' + CURRENTCONTEXT + '/1.0/animatedContext.html?fitWidth=' + WIDTH + '&fitHeight=' + HEIGHT;
                window.open(url, "_blank");
            }
            break;
        case 'deviceViewportConsole.html':
            if (CURRENTCONTEXT) {
                var url = BASEURL + page + '?contextId=' + CURRENTCONTEXT;
                location.href = url;
            }
            break;
        case 'symbologyConsole.html':
            if (CURRENTSYMBOLOGY) {
                var url = BASEURL + page + '?symbologyId=' + CURRENTSYMBOLOGY;
                location.href = url;
            }
            break;
        case 'symbolConsole.html':
            var url = BASEURL + page;
            location.href = url;
            break;
        default:
    }
}