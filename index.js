let $ = require('jquery') // jQuery now loaded and assigned to $
let down = require("./download.js")
let fs = require("fs")
var list = []

/**
 * Render the download task list
 */
function render() {
    document.getElementById("list").innerHTML = ""

    for (var i = 0; i < list.length; i++) {
        var clr = ""
        if (list[i].status == "error") clr = "list-group-item-danger"
        else if (list[i].bytes > 0) clr = "list-group-item-success"
        else if (list[i].status.startsWith("status: ")) clr = "list-group-item-danger"
        $("#list").append("<a id=" + i + " href=\"#\" class=\"list-group-item list-group-item-action " + clr + "\">" +
            list[i].urlSplit[0] + "//" + list[i].urlSplit[2] + "/.../" + list[i].urlSplit[list[i].urlSplit.length - 1]
            + " (" + list[i].status + ")</a>")
    }
}
/**
 * Returns the actual timestamp
 * 
 * @returns {string} the actual timestamp
 */
function tstamp() {
    var d = new Date()
    return d.getTime()
}

/**
 * Downloads next chunk 
 * 
 * @param {*} field the download task 
 */
function next(field) {

    // removing file extension (if exists)
    var parts = field.current.split(".")
    var l = "", n = ""

    // Adding +1 to the N value of the chunk filename (only to the last numbers of the filename)
    for (var i = parts[0].length - 1; i > -1; i--) {
        if ("1234567890".includes(parts[0][i]) && l == "") {
            n = parts[0][i] + "" + n
        } else {
            l = parts[0][i] + l
        }
    }
    // exiting if N value is void
    if (n == "") {
        field.status = field.path + field.filename + " - " + field.bytes + " bytes"
        return
    }
    n++// Adding +1 

    // creating new filename (and adding extension if exists)
    if (parts.length == 2)
        field.current = l + n + "." + parts[1]
    else
        field.current = l + n

    // updating download task fields
    field.iteration++
    field.urlSplit[field.urlSplit.length - 1] = field.current
    field.url = field.urlSplit.join("/")

    // adding params url (if exists)
    if (field.params != undefined)
        field.url = field.url + "?" + field.params

    // downloading chunk
    down.download(field, function (body) {
        fs.appendFileSync(field.path + field.filename, body, "binary")
        next(field)// downloading next chunk 
    })

    // rendering download list
    render()
}

/**
 * Downloads data from URL and writes to disk
 */
function download() {

    // Path is required
    if ($("#path").val().length < 3) {
        alert("Path must be set")
        $("#path").focus()
        return
    }

    // Checking for valid url
    let url = $("#url").val()
    if (url.length > 2) {
        // creating download task
        var field = {}
        field.url = url
        field.path = $("#path").val()
        field.iteration = 0
        field.status = "downloading..."
        field.bytes = 0
        field.urlSplit = field.url.split("?")[0].split("/");
        if (field.url.split("?").length > 1)
            field.params = field.url.split("?")[1]
        var ext = field.urlSplit[field.urlSplit.length - 1].split(".")
        if (ext.length == 1)
            field.filename = tstamp() // + "." + field.urlSplit[field.urlSplit.length - 1]
        else
            field.filename = tstamp() + "." + ext[ext.length - 1]
        field.current = field.urlSplit[field.urlSplit.length - 1]
        list.push(field)// Adding to download task list

        // downloading chunk
        down.download(field, function (body) {
            console.log("SAVED::fileName = " + field.path + field.filename)
            fs.writeFileSync(field.path + field.filename, body, "binary")
            next(field)
        })

        // rendering download list
        render()
    }
}

/**
 * Reset form
 */
function rset() {
    $("#url").val("")
    list = []
    $("#url").focus()
    render()
}

// Adding onclick events (buttons)
$("#reset").on("click", () => {
    rset()
})
$("#download").on("click", () => {
    download()
    $("#url").val("")
    $("#url").focus()
})
$("#list").on("click", () => {
    if (list[window.event.target.id].bytes > 0) {
        var file = list[window.event.target.id].path + list[window.event.target.id].filename
        require('child_process').exec('start "" \"' + file + '\"');
    }
})
// Focusing
$("#url").focus()

// Setting refresh download list interval 
setInterval(function () { render() }, 2000);