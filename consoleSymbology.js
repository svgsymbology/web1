
var FORDEMO = false;
var LIBID;
var CURRENTSYMBOLOGY = "";
var HTML = null;

$(document).ready(function () {

    var body = $("#body");
     
    $.get('http://10.0.0.106:8080/websvg/consoleSymbologyUI.html', function(contents) {
        HTML = $.parseHTML(contents);
        body.append(HTML);
        buildUI();
    },'text');    

});

function buildUI(){
    
    $(document).tooltip();

    if (symbologyId) {
        getSymbologysForSymbology(symbologyId);
    }

    $("#symbologyChoose").checkboxradio();

    $("#symbologyChoose").click(function () {
        $("#symbologysChooseL").empty();
        if (FORDEMO) {
            FORDEMO = false;
            $("#symbologysChooseL").append("Actual");
        } else {
            FORDEMO = true;
            $("#symbologysChooseL").append("Demo");
        }
        getSymbologyLibs(FORDEMO);
    });

    getSymbologyLibs(FORDEMO);
    $('#libSymbologys').dataTable({
        "paging": false,
        "searching": false,
        "ordering": false,
        "scrollCollapse": true,
        "scrollY": 520,
        "info": false,
        "lengthChange": true,
        "autoWidth": false,
        "header": false,
        fixedHeader: {
            "header": false,
            "footer": false
        }
    });    
}

function getSymbologyLibs(isForDemo) {
    $.ajax({
        url: BASEURL + "jquery/symbologyLibraries/?demo=" + isForDemo
    }).then(function (data) {
        var select = "<select id=\"symbologyLibs\" name=\"symbologyLibs\">\n<option value=\"0\">Symbology Libs</option>\n";
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
        var symbologyLibs = $("#symbologyLibs").selectmenu({width: 180});
        symbologyLibs.selectmenu("menuWidget").addClass("option_class");
        symbologyLibs.selectmenu("widget").addClass("option_class");
        $("#symbologyLibs").on("selectmenuchange", function () {
            getLibSymbologys(this.value);
        });
    });
}

function getLibSymbologys(lib) {
    $.ajax({
        url: BASEURL + "jquery/symbologies/" + lib + "/"
    }).then(function (data) {
        $("#navigatorContent").find("tr").remove().end();
        for (var i = 0; i < data.length; i++) {
            $("#navigatorContent").append("<tr><td><img onclick=\"viewSymbologySvg('" + data[i].uuid + "');\" src=\"" + data[i].base64image + "\" title=\"Symbology : " + data[i].name + " - " + data[i].uuid + "\" style=\"cursor:pointer;\"/></td><td onclick=\"viewSymbologySvg('" + data[i].uuid + "',true,true);\" title=\"Symbology : " + data[i].name + " - " + data[i].uuid + "\" style=\"cursor:pointer;\" class=\"symbologyText\">" + data[i].name + "</td></tr>");
        }
    });
}

function viewSymbologySvg(symbologyId) {
    CURRENTSYMBOLOGY = symbologyId;
    var url = BASEURL + "symbology/" + symbologyId + "/1.0/symbology.svg?fitWidth=480&fitHeight=500";
    $("#symbologyFrm").attr("src", url);
}

function getSymbologysForSymbology(symbologyId) {
    viewSymbologySvg(symbologyId);
    $.ajax({
        url: BASEURL + "jquery/symbology/" + symbologyId + "/"
    }).then(function (data) {
        LIBID = data.libraryId;
        if (LIBID < 8) {
            //demo context
            FORDEMO = true;
            getSymbologyLibs(FORDEMO);
        }
    });
    $.ajax({
        url: BASEURL + "jquery/siblingsymbologies/" + symbologyId + "/"
    }).then(function (data) {
        $("#navigatorContent").find("tr").remove().end();
        for (var i = 0; i < data.length; i++) {
            $("#navigatorContent").append("<tr><td><img onclick=\"viewSymbologySvg('" + data[i].uuid + "');\" src=\"" + data[i].base64image + "\" title=\"Symbology : " + data[i].name + " - " + data[i].uuid + "\" style=\"cursor:pointer;\"/></td><td onclick=\"viewSymbologySvg('" + data[i].uuid + "',true,true);\" title=\"Symbology : " + data[i].name + " - " + data[i].uuid + "\" style=\"cursor:pointer;\" class=\"symbologyText\">" + data[i].name + "</td></tr>");
        }
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
        case 'deviceViewportConsole.html':
            if (CURRENTSYMBOLOGY) {
                var url = BASEURL + page + '?symbologyId=' + CURRENTSYMBOLOGY;
                location.href = url;
            }
            break;
        case 'contextConsole.html':
            var url = BASEURL + page;
            location.href = url;
            break;
        case 'symbolConsole.html':
            var url = BASEURL + page;
            location.href = url;
            break;
        case 'channel.html':
            var WIDTH = $(document).width();
            var HEIGHT = $(document).height();
            if (!window.matchMedia("(pointer: coarse)").matches) {
                WIDTH = Math.ceil(WIDTH / 3);
                HEIGHT = Math.ceil(HEIGHT / 2);
            }
            var url = BASEURL + page + '?showTracker=true&trackerScale=1.0&glass=false&color=0178af&navColor=b5d7e8&fitWidth=' + WIDTH + '&fitHeight=' + HEIGHT;
            window.open(url, "_blank");
            break;
        default:
        // code block
    }
}