document.addEventListener("DOMContentLoaded", function (event) {
    let nodes = splitUnderscore(JSON.parse(localStorage.getItem('config')).nodes)
    let selectNodes = document.querySelector('#edit-select-type')
    for (let i = 0; i < nodes.length; i++) {
        selectNodes.innerHTML += `<option id="${nodes[i].abbrv}"> ${nodes[i].title} </option>`
    }

    selectNodes.addEventListener('change', (e) => {
        let sceltaSelect = selectNodes.options[selectNodes.selectedIndex].id
        if (sceltaSelect != '') {
            document.querySelector('#edit-form').innerHTML = ''
            let neo4jName = containAndReturn(JSON.parse(localStorage.getItem('config')).nodes, 'abbrv', sceltaSelect).neo4jName
            loadNodes(neo4jName, sceltaSelect)
        }
    })
});


function loadNodes(nodeName, abbrv) {
    let url = '/getNodes/' + nodeName
    callAjax(url, (response) => {
        document.getElementById('edit-select-container').innerHTML = ''
        document.getElementById('edit-select-container').innerHTML += `Seleziona il nodo: <select id="edit-select-nodes" class="select">
        <option value="">Choose node...</option>
      </select>`
        $('#edit-select-nodes').select2({
            placeholder: 'Search...',
            width: '100%',
            dropdownAutoWidth: true
        });
        response = JSON.parse(response).records
        let objectTarget = searchRequiredFields(rebuild(response), abbrv)
        for (let i = 0; i < objectTarget.length; i++) {
            localStorage.setItem('EditObj_' + i, JSON.stringify(objectTarget[i]))
            let optionText = populateSelectText(objectTarget[i])
            document.getElementById('edit-select-nodes').innerHTML += `<option class="node" id="EditObj_${i}" value="EditObj_${i}">${optionText}</option>`
        }
        handleSelect(nodeName, abbrv)
    })
}

function handleSelect(nodeName, abbrv) {
    $('#edit-select-nodes').on('change', function (e) {
        document.querySelector('#edit-form').innerHTML = ''
        let sceltaSelect = $('#edit-select-nodes option:selected').attr('id')
        localStorage.setItem('editObj', sceltaSelect)
        // showData(sceltaSelect, nodeName, abbrv) //funziona
        showData(nodeName, abbrv)
        handleRelation(nodeName, abbrv)
    })
}

function showData(nodeName, abbrv) {
    let obj = JSON.parse(localStorage.getItem(localStorage.getItem('editObj')))
    let url = '/getNode/' + nodeName
    callAjaxPost(url, obj, (response) => {
        if (JSON.parse(response).records.length > 0) {
            response = JSON.parse(response).records
            let target = document.querySelector('#edit-form')
            let req = searchRequiredFields(rebuild(response), abbrv)
            let reL = Object.keys(req[0]).length
            target.innerHTML = ''
            for (let i = 0; i < reL; i++) {
                target.innerHTML += `<label>${Object.keys(req[0])[i]}: ${Object.values(req[0])[i]}</label><br> `
            }
            let noReq = notRequired(rebuild(response), req, nodeName)
            let nreL = Object.keys(noReq).length
            target.innerHTML += `<div id="div-edit-form"></div>`
            let a = document.getElementById('div-edit-form')
            for (let i = 0; i < nreL; i++) {
                a.innerHTML += `<label>${Object.keys(noReq)[i]}:
                <input type="text" placeholder="${Object.values(noReq)[i]}" autocomplete="off" />
                </label><br> `
            }
            target.innerHTML += `<input type="submit" value="Send" id="edit-submit"/>`
            handleSubmit(req[0], nodeName)

            let queryTxt = ''
            for (let i = 0; i < Object.keys(req[0]).length; i++) {
                let objectKey = Object.keys(req[0])[i]
                let objectValue = Object.values(req[0])[i]
                if (i === Object.keys(req[0]).length - 1) {
                    queryTxt += objectKey + ': ' + "'" + objectValue + "'"
                } else {
                    queryTxt += objectKey + ': ' + "'" + objectValue + "'" + ', '
                }
            }


            callAjax('/getProcess', (response) => {
                response = JSON.parse(response)
                document.getElementById('edit-graph-ins').style.visibility = 'visible'
                drawGraph(response, nodeName, queryTxt)
            })


        }
    })
}


function searchRequiredFields(obj, choice) {
    let attr = containAndReturn(JSON.parse(localStorage.getItem('config')).nodes, 'abbrv', choice).attributes
    let requiredFields = []
    let objectReturn = []
    for (let i = 0; i < attr.length; i++) {
        if (attr[i].required == true) {
            requiredFields.push(attr[i].name)
        }
    }

    for (let i = 0; i < obj.length; i++) {
        var objectTemp = {}
        Object.entries(obj[i]).forEach(([key, value]) => {
            if (requiredFields.includes(key) == true) {
                objectInsert = { [key]: value }
                Object.assign(objectTemp, objectInsert)
            }
        })
        objectReturn.push(objectTemp)
    }
    return objectReturn
}

function notRequired(obj, req, from) {
    let nodes = splitUnderscore(JSON.parse(localStorage.getItem('config')).nodes)
    nodes = containAndReturn(JSON.parse(localStorage.getItem('config')).nodes, 'neo4jName', from).attributes
    let notReqFrom = []
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].required == undefined || nodes[i].required == null || !nodes[i].hasOwnProperty('required')) {
            let insert = {}
            insert = { [nodes[i].name]: '' }
            Object.assign(notReqFrom, insert)
        }
    }
    obj = obj[0]
    req = req[0]
    let objLength = Object.keys(obj).length
    let reqLength = Object.keys(req).length
    for (let i = 0; i < objLength; i++) {
        for (let j = 0; j < reqLength; j++) {
            if (Object.keys(obj)[i] == Object.keys(req)[j]) {
                delete obj[Object.keys(obj)[i]]
            }
        }
    }
    let returnObject = { ...notReqFrom, ...obj }
    return returnObject
}

function drawGraph(data, name, txt) {
    let config = {
        container_id: "graph",
        server_url: data.port,
        server_user: data.user,
        server_password: data.password,
        initial_cypher: `MATCH (n:${name} {${txt}}), (a:${name} {${txt}})-[r]->(b) RETURN n,a,r,b LIMIT 25`
    }
    let viz = new NeoVis.default(config)
    viz.render()
    document.getElementById('graph-show-relation').addEventListener('click', () => {
        if (document.getElementById('graph-show-relation').checked == true) {
            let config = {
                container_id: "graph",
                server_url: data.port,
                server_user: data.user,
                server_password: data.password,
                initial_cypher: `MATCH (n:${name} {${txt}}) RETURN n`
            }
            let viz = new NeoVis.default(config)
            viz.render()
        } else {
            let config = {
                container_id: "graph",
                server_url: data.port,
                server_user: data.user,
                server_password: data.password,
                initial_cypher: `MATCH (n:${name} {${txt}}), (a:${name} {${txt}})-[r]->(b) RETURN n,a,r,b LIMIT 25`
            }
            let viz = new NeoVis.default(config)
            viz.render()
        }
    })
}

function handleSubmit(req, from) {
    $('#edit-form').one('submit', function (e) {
        e.preventDefault()
        e.stopPropagation()
        let object = {
            required: [],
            edit: []
        }
        let reqObject = {}
        object.required.push(req)
        const form = document.getElementById('div-edit-form').getElementsByTagName('label')
        for (let i = 0; i < form.length; i++) {
            let insert = {}
            let property = form[i].childNodes[0].textContent
            property = property.replace(/\s/g, '')
            property = property.slice(0, -1)
            if (form[i].childNodes[1].value != '') {
                var value = form[i].childNodes[1].value
            } else {
                var value = form[i].childNodes[1].placeholder
            }
            insert = { [property]: value }
            Object.assign(reqObject, insert)
        }
        object.edit.push(reqObject)
        const url = '/editNode/' + from
        callAjaxPost(url, object, (response) => {
            alert('Node edited! Press OK to edit another one!')
            location.reload()
        })
    })
}

function handleRelation(from, id) {
    let obj = JSON.parse(localStorage.getItem(localStorage.getItem('editObj')))
    document.getElementById('edit-show-relation').disabled = false
    document.getElementById('edit-show-relation').addEventListener('click', () => {
        const url = '/getRelations/' + from
        callAjaxPost(url, obj, (response) => {
            response = JSON.parse(response).records
            let target = document.getElementById('edit-relation-box')
            for (let i = 0; i < response.length; i++) {
                let savedRelation = {
                    sourceLabel: response[i]._fields[1].labels[0],
                    relName: response[i]._fields[0],
                    destLabel: response[i]._fields[2].labels[0],
                    source: response[i]._fields[1].properties,
                    dest: response[i]._fields[2].properties
                }
                localStorage.setItem('savedRelation_' + i, JSON.stringify(savedRelation))
                target.innerHTML += ` <div class="edit-relation"><div class="tooltip">${savedRelation.sourceLabel}<i class="fa fa-info-circle" aria-hidden="true"></i><span class="tooltip-text">${tooltipText(savedRelation.source)}</span></div><p>${savedRelation.relName}</p><div class="tooltip">${savedRelation.destLabel} <i class="fa fa-info-circle" aria-hidden="true"></i><span class="tooltip-text">${tooltipText(savedRelation.dest)}</span></div><button id="savedRelation_${i}" class="edit-relation-delete">Delete relation</button></div>`
            }
            handleDeleteButton()
        })
    })
}

function handleDeleteButton() {
    let list = document.getElementById('edit-relation-box').querySelectorAll('button')
    Array.prototype.slice.call(list).forEach(function (listItem) {
        listItem.addEventListener('click', function (e) {
            e.preventDefault()
            e.stopPropagation()
            let obj = JSON.parse(localStorage.getItem(this.id))
            console.log(obj)
            callAjaxPost('/deleteRelations', obj, (response) => {
                alert('Relationship edited! Press OK to edit another one!')
                location.reload()
            })
        })
    })
}






















function splitUnderscore(obj) {
    for (let i = 0; i < obj.length; i++) {
        let str = obj[i].title
        str = str.replace(/_/g, ' ')
        obj[i].title = str
    }
    return obj
}

function containAndReturn(object, property, value) {
    for (var i = 0; i < object.length; i++) {
        if (object[i][property] === value) return object[i];
    }
    return false;
}

function tooltipText(obj) {
    var result = ''
    for (let [key, value] of Object.entries(obj)) {
        result += key + ': ' + value + '\n'
    }
    return result
}

function populateSelectText(obj) {
    var result = ''
    for (let [key, value] of Object.entries(obj)) {
        result += key + ': ' + value + ' '
    }
    return result
}

function callAjax(url, callback) {
    var xhr;
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            callback(xhr.responseText);
        }
    }
    xhr.open("GET", url, true);
    xhr.send();
}

function callAjaxPost(url, data, callback) {
    data = JSON.stringify(data)
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            callback(xhr.responseText);
        }
    }
    xhr.open('POST', url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
}

function rebuild(obj) {
    let objectReturn = []
    for (let i = 0; i < obj.length; i++) {
        let objectProperties = obj[i]._fields[0].properties
        objectReturn.push(objectProperties)
    }
    return objectReturn
}