if (localStorage.getItem('config') === null || localStorage.getItem('config') == undefined || localStorage.getItem('config') === '') {
    let modal = document.querySelector('.popupConfig');
    modal.style.zIndex = 1;
    modal.style.display = "block";
} else {
    let modal = document.querySelector('.popupConfig');
    modal.style.display = "none";
    clearLS()
    var config = localStorage.getItem('config')
    let nodes = splitUnderscore(JSON.parse(localStorage.getItem('config')).nodes)
    setNavbar(nodes)
    navbarController()
}


document.getElementById('closePopup').addEventListener('click', () => {
    let modal = document.querySelector('.popupConfig');
    modal.style.display = "none";
})

function getConfig(url, callback) {
    var xhr = new XMLHttpRequest();;
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            callback(xhr.responseText);
        }
    }
    xhr.open("GET", url, true);
    xhr.send();
}

function splitUnderscore(obj) {
    for (let i = 0; i < obj.length; i++) {
        let str = obj[i].title
        str = str.replace(/_/g, ' ')
        obj[i].title = str
    }
    return obj
}

function setNavbar(obj) {
    localStorage.setItem('objLength', obj.length)
    document.getElementById('navbarTarget').innerHTML = '<ul id="navbar">'
    let manca = []
    for (let i = 0; i < obj.length; i++) {
        if (i < 5) {
            document.getElementById('navbarTarget').innerHTML += `<li id="nav_${obj[i].abbrv}"> ${obj[i].title} </li>`
        } else {
            manca.push(obj[i])
        }
    }
    if (obj.length > 5) {
        document.getElementById('navbarTarget').innerHTML += `<select id="more"> `
        document.getElementById('more').innerHTML += `<option id="moreDots">...</option>`
        document.getElementById('more').innerHTML += moreContent(manca)

    }
    document.getElementById('navbarTarget').innerHTML += `<li id="nav_co">Relazioni</li></ul>`
}

function moreContent(obj) {
    let a
    for (let i = 0; i < obj.length; i++) {
        a += `<option id="nav_${obj[i].abbrv}"> ${obj[i].title}</option>`
    }
    return a
}

function navbarController() {
    let navbarList = document.getElementById('navbarTarget').querySelectorAll('li')
    Array.prototype.slice.call(navbarList).forEach(function (listItem) {
        listItem.addEventListener('click', function (e) {
            document.getElementById('fieldsetTarget').innerHTML = ''
            localStorage.setItem('from', this.id.substr(4))
            e.preventDefault()
            e.stopPropagation();
            if (this.id === 'nav_co') {
                document.getElementById('connectForm').style.display = 'block'
                document.getElementById('inserimentoForm').style.display = 'none'
                document.getElementById('connectForm2').style.display = 'none'
                document.getElementById('radioList').innerHTML = ' '
                document.getElementById('selectNodiFrom').innerHTML = ' '
                document.getElementById('radioCheck').innerHTML = ' '
                document.getElementById('radioListTo').innerHTML = ' '
                document.getElementById('selectNodiTo').innerHTML = ' '

                connect()
            } else {
                document.getElementById('inserimentoForm').style.display = 'block'
                document.getElementById('connectForm').style.display = 'none'
                document.getElementById('connectForm2').style.display = 'none'
                document.getElementById('fieldsetTarget').innerHTML += '<h2> Inserisci: ' + document.getElementById(this.id).innerHTML + '</h2>'
                populateFieldset(localStorage.getItem('from'))
            }
        })
    })
    if (localStorage.getItem('objLength') > 5) {
        document.getElementById('more').addEventListener('change', (e) => {
            e.stopPropagation()
            e.preventDefault()
            let scelta = document.getElementById('more').options[document.getElementById('more').selectedIndex].id
            if (scelta !== 'moreDots') {
                localStorage.setItem('from', scelta.substr(4))
                document.getElementById('inserimentoForm').style.display = 'block'
                document.getElementById('connectForm').style.display = 'none'
                document.getElementById('fieldsetTarget').innerHTML = ''
                document.getElementById('fieldsetTarget').innerHTML += '<h2> Inserisci: ' + document.getElementById(scelta).innerHTML + '</h2>'
                populateFieldset(localStorage.getItem('from'))
            }
        })
    }
}

function clearLS() {
    let arr = [];
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).substring(0, 8) == 'ObjFrom_' || localStorage.key(i).substring(0, 6) == 'ObjTo_') {
            arr.push(localStorage.key(i));
        }
    }
    for (let i = 0; i < arr.length; i++) {
        localStorage.removeItem(arr[i]);
    }
    localStorage.setItem('middle', '')
    localStorage.setItem('fromObj', '')
    localStorage.setItem('toObj', '')
}

function populateFieldset(from) {
    // let config = JSON.parse(window.config)
    let config = JSON.parse(localStorage.getItem('config'))
    let objectReturn = containAndReturn(config.nodes, 'abbrv', from).attributes
    let fieldset = document.getElementById('fieldsetTarget')
    objectReturn.forEach(item => {
        if (item.type === 'multi') {
            if (item.required === true) {
                fieldset.innerHTML += `<div><select class="select selectJS" id="${item.name + '_' + from}" required >${populateSelect(item.multi, item.placeholder)}</select><div class="slider"</div></div>`
            } else {
                fieldset.innerHTML += `<div><select class="select selectJS" id="${item.name + '_' + from}">${populateSelect(item.multi, item.placeholder)}</select><div class="slider"</div></div>`
            }
        } else {
            if (item.type === 'date') {
                if (item.required === true) {
                    fieldset.innerHTML += `<div><input class="input" placeholder="${item.placeholder}*" id="${item.name + '_' + from}" pattern="[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}" type="date" autocomplete="off" required><div class="slider"</div></div>`
                } else {
                    fieldset.innerHTML += `<div><input class="input" placeholder="${item.placeholder}" id="${item.name + '_' + from}" pattern="[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}" type="date" autocomplete="off" ><div class="slider"</div></div>`
                }
            } else if (item.type === 'number') {
                if (item.required === true) {
                    fieldset.innerHTML += `<div><input class="input" placeholder="${item.placeholder}*" id="${item.name + '_' + from}" type="number" autocomplete="off" required><div class="slider"</div></div>`
                } else {
                    fieldset.innerHTML += `<div><input class="input" placeholder="${item.placeholder}" id="${item.name + '_' + from}" type="number" autocomplete="off" ><div class="slider"</div></div>`
                }
            } else {
                if (item.required === true) {
                    fieldset.innerHTML += `<div><input class="input" placeholder="${item.placeholder + '*'}" id="${item.name + '_' + from}" type="text" autocomplete="off" required ><div class="slider"</div> </div>`
                } else {
                    fieldset.innerHTML += `<div><input class="input" placeholder="${item.placeholder + ''}" id="${item.name + '_' + from}" type="text" autocomplete="off"  ><div class="slider"</div> </div>`
                }
            }
        }
    });
    fieldset.innerHTML += `<input type="submit" id="insert_btn" name="${from}" class="ins_btn" value="Inserisci">`
    getValue(from)
}

function populateSelect(array, placeholder) {
    let textTarget = ''
    for (let i = 0; i < array.length; i++) {
        textTarget += `<option value ="${array[i]}"> ${placeholder + ': ' + array[i]}</option>`
    }
    return textTarget
}

function containAndReturn(object, property, value) {
    for (var i = 0; i < object.length; i++) {
        if (object[i][property] === value) return object[i];
    }
    return false;
}

function getValue(from) {
    document.getElementById('insert_btn').addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (validate()) {
            if (validateFindOne()) {
                let target = document.getElementsByClassName('input')
                let insertValues = {}
                const select = document.getElementsByClassName('selectJS')
                if (select.length != 0) {
                    for (let i = 0; i < select.length; i++) {
                        const sel = select[i].options[select[i].selectedIndex].value
                        let insert = {}
                        let key = select[i].id
                        key = key.substr(0, key.lastIndexOf('_'))
                        insert = { [key]: sel }
                        Object.assign(insertValues, insert)
                    }
                }
                for (let i = 0; i < target.length; i++) {
                    let insert = {}
                    let value = target[i].value
                    let key = target[i].id
                    key = key.substr(0, key.lastIndexOf('_'))
                    insert = { [key]: value }
                    Object.assign(insertValues, insert)
                }

                console.log(insertValues)
                addNodes(insertValues, from)
            }
        }
    })

}

function validate() {
    var form = document.getElementById('fieldsetTarget')
    let length = form.childNodes.length - 1
    for (let i = 1; i < length; i++) {
        if (form.childNodes[i].firstChild.value === '' && form.childNodes[i].firstChild.hasAttribute('required')) {
            let id = form.childNodes[i].firstChild.id
            document.getElementById(id).classList.add('error');
            $(`#${id}`).css("border-color", "#fe6d73");
            setTimeout(function () {
                document.getElementById(id).classList.remove('error');
                $(`#${id}`).css("border-color", "#ccc");
            }, 500);
            return false
        }
    }
    return true
}

function validateFindOne() {
    let from = containAndReturn(JSON.parse(localStorage.getItem('config')).nodes, 'abbrv', localStorage.getItem('from')).neo4jName

    const form = document.getElementById('fieldsetTarget')
    let length = form.childNodes.length - 1
    let objFind = {}

    for (let i = 1; i < length; i++) {
        if (form.childNodes[i].firstChild.hasAttribute('required')) {
            let insert = {}
            let value = form.childNodes[i].firstChild.value
            let key = form.childNodes[i].firstChild.id
            key = key.substr(0, key.lastIndexOf('_'))
            insert = { [key]: value }
            Object.assign(objFind, insert)
        }
    }

    $.ajax({
        url: '/findOne/' + from,
        method: 'POST',
        data: objFind,
        async: false,
        success: function (data) {
            var r = checkData(data)
            localStorage.setItem('resultFindOne', null)
            localStorage.setItem('resultFindOne', r)
            const a = checkR(localStorage.getItem('resultFindOne'))
        }
    })
    if (localStorage.getItem('validateResult') === 'false') {
        alert('Node is already present in the database!')
        return false
    } else {
        return true
    }
}

function addNodes(obj, from) {
    let config = JSON.parse(window.config)
    const objectReturn = containAndReturn(config.nodes, 'abbrv', from).neo4jName
    const url = '/addNode/' + objectReturn
    const txt = 'Node insertion successful!'
    callAjaxPost(url, obj, popup(txt))
}

function checkData(data) {
    let number = Object.values(data.records[0]._fields[0])
    number = number[0]
    return number
}

function checkR(r) {
    if (r == 0) {
        localStorage.setItem('resultFindOne', null)
        localStorage.setItem('validateResult', true)
        return true
    } else {
        localStorage.setItem('resultFindOne', null)
        localStorage.setItem('validateResult', false)
        return false
    }
}

function callAjaxPost(url, data, callback) {
    data = JSON.stringify(data)
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log(xhr.responseText);
        }
    }
    xhr.open('POST', url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
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

function popup(txt) {
    window.scrollTo(0, 0);
    var modal = document.querySelector('.modalbox');
    var text = document.querySelector('#modal-text');
    text.textContent = txt;
    modal.style.zIndex = 1;
    modal.style.display = "block";
    setTimeout(() => {
        modal.style.animation = 'fadeout .7s linear';
        setTimeout(() => {
            modal.style.display = 'none';
            location.reload()
        }, 500);
    }, 1500);
}

function rebuild(obj) {
    let objectReturn = []
    for (let i = 0; i < obj.length; i++) {
        let objectProperties = obj[i]._fields[0].properties
        objectReturn.push(objectProperties)
    }
    return objectReturn
}

function connect() {
    fromController()
}

function loadNodes(nameUrl, choice, from) {
    url = '/getNodes/' + nameUrl
    callAjax(url, function (response) {
        if (from == 'first') {
            $('#selectNodiFrom').select2({
                placeholder: 'Cerca...',
            });
            $('#selectNodiFrom').width(250)
            $('#selectNodiTo').width(250)

            document.getElementById('selectNodiFrom').innerHTML = ' '
            document.getElementById('selectNodiFrom').innerHTML = '<option value=""> Scegli </option>'
            response = JSON.parse(response).records
            let objectTarget = searchRequiredFields(rebuild(response), choice)
            for (let i = 0; i < objectTarget.length; i++) {
                localStorage.setItem('ObjFrom_' + i, JSON.stringify(objectTarget[i]))
                let optionText = populateSelectText(objectTarget[i])
                document.getElementById('selectNodiFrom').innerHTML += `<option class="node" id="ObjFrom_${i}" value="ObjFrom_${i}">${optionText}</option>`
            }
            $('#selectNodiFrom').on('change', function () {
                let sceltaSelect = $('#selectNodiFrom option:selected').attr('id')
                localStorage.setItem('fromObj', sceltaSelect)

                // drawGraph(nameUrl, sceltaSelect)
                let rels = containAndReturn(JSON.parse(localStorage.getItem('config')).nodes, 'abbrv', localStorage.getItem('fromList')).relationship
                let radioCheck = document.getElementById('radioCheck')
                radioCheck.innerHTML = ' '
                for (let i = 0; i < rels.length; i++) {
                    radioCheck.innerHTML += `<li id='${rels[i].relName}'> <input type="radio" name='choice' id='${rels[i].relName + '_middle2'}'> <label
                       for="${rels[i].relName}_s">${rels[i].relName}</label> </li>`
                }
                let checkList = document.getElementById('radioCheck').querySelectorAll('li')
                Array.prototype.slice.call(checkList).forEach(function (listItem) {
                    listItem.addEventListener('click', function (e) {
                        document.getElementById('radioListTo').innerHTML = ' '
                        e.preventDefault()
                        e.stopPropagation()
                        let objWithAttr = containAndReturn(rels, 'relName', this.id)
                        if (objWithAttr.relAttr) {
                            document.getElementById('modalAttr').style.display = 'block'
                            document.getElementById('formAddAttr').innerHTML = ''
                            for (let i = 0; i < objWithAttr.relAttrName.length; i++) {
                                document.getElementById('formAddAttr').innerHTML += `<label for="relAttr_${objWithAttr.relAttrName[i]}">Inserisci attributo ${objWithAttr.relAttrName[i]}:<input autofocus type="text" name="name" id="relAttr_${objWithAttr.relAttrName[i]}" placeholder="Inserisci" required autocomplete="off"required /></label> <br>`
                            }
                            document.getElementById('formAddAttr').innerHTML += ' <button type="submit" id="addPopupA"><i class="fas fa-pencil-alt"></i> Ok</button>'

                            //localStorage.setItem('relAttrName', containAndReturn(rels, 'relName', this.id).relAttrName)

                            this.childNodes[1].checked = true
                            relAttrController(rels, this.id)
                        } else {
                            localStorage.setItem('middleAttr', '')
                            this.childNodes[1].checked = true
                            localStorage.setItem('middle', this.id.toUpperCase())
                            toController(rels)
                        }
                    })
                })
            })

        } else {
            $('#selectNodiTo').select2({
                placeholder: 'Search...',
            });
            $('#selectNodiTo').width(250)
            document.getElementById('selectNodiTo').innerHTML = ' '
            document.getElementById('selectNodiTo').innerHTML = '<option value=""> Choose... </option>'
            response = JSON.parse(response).records
            let objectTarget = searchRequiredFields(rebuild(response), choice.substr(0, choice.indexOf('_')))

            for (let i = 0; i < objectTarget.length; i++) {
                localStorage.setItem('ObjTo_' + i, JSON.stringify(objectTarget[i]))
                let optionText = populateSelectText(objectTarget[i])
                document.getElementById('selectNodiTo').innerHTML += `<option class="node" id="ObjTo_${i}" value="ObjTo_${i}">${optionText}</option>`
            }
            $('#selectNodiTo').on('change', function () {
                let sceltaSelect = $('#selectNodiTo option:selected').attr('id')
                localStorage.setItem('toObj', sceltaSelect)
                connection()
            })
        }

    })
}

function drawGraph(name, txt) {
    document.getElementById('edit-graph-ins').style.visibility = 'visible'
    txt = JSON.parse(localStorage.getItem(txt))
    let queryTxt = ''
    for (let i = 0; i < Object.keys(txt).length; i++) {
        let objectKey = Object.keys(txt)[i]
        let objectValue = Object.values(txt)[i]
        if (i === Object.keys(txt).length - 1) {
            queryTxt += objectKey + ': ' + "'" + objectValue + "'"
        } else {
            queryTxt += objectKey + ': ' + "'" + objectValue + "'" + ', '
        }
    }
    callAjax('/getProcess', (response) => {
        response = JSON.parse(response)
        let config = {
            container_id: "graph",
            server_url: response.port,
            server_user: response.user,
            server_password: response.password,
            initial_cypher: `MATCH (n:${name} {${queryTxt}}), (a:${name} {${queryTxt}})-[r]->(b) RETURN n,a,r,b LIMIT 25`
        }
        let viz = new NeoVis.default(config)
        viz.render()
        document.getElementById('graph-show-relation').addEventListener('click', () => {
            if (document.getElementById('graph-show-relation').checked == true) {
                let config = {
                    container_id: "edit-graph",
                    server_url: response.port,
                    server_user: response.user,
                    server_password: response.password,
                    initial_cypher: `MATCH (n:${name} {${queryTxt}}) RETURN n`
                }
                let viz = new NeoVis.default(config)
                viz.render()
            } else {
                let config = {
                    container_id: "edit-graph",
                    server_url: response.port,
                    server_user: response.user,
                    server_password: response.password,
                    initial_cypher: `MATCH (n:${name} {${queryTxt}}), (a:${name} {${queryTxt}})-[r]->(b) RETURN n,a,r,b LIMIT 25`
                }
                let viz = new NeoVis.default(config)
                viz.render()
            }
        })
    })
}

function has(object, key) {
    return object ? hasOwnProperty.call(object, key) : false;
}

function relAttrController(rels, id) {
    document.getElementById('addPopupA').addEventListener('click', (e) => {
        localStorage.setItem('middleAttr', '')
        localStorage.setItem('middle', '')
        e.stopPropagation()
        e.preventDefault()
        var form = document.querySelectorAll('#formAddAttr input')
        let length = form.length
        let obj = {}
        for (let i = 0; i < length; i++) {
            if (form[i].value != '' && form[i].value != ' ') {
                let insert = {}
                let value = form[i].value.toString()
                let key = form[i].id.substr(form[i].id.indexOf('_') + 1, form[i].id.length)
                insert = { [key]: value }
                Object.assign(obj, insert)
            } else {
                form[i].classList.add('error')
                setTimeout(function () {
                    form[i].classList.remove('error');
                }, 300);
                form[i].focus()
            }
        }
        if (Object.keys(obj).length == length) {
            document.getElementById('modalAttr').style.display = 'none'
            localStorage.setItem('middleAttr', JSON.stringify(obj))
            localStorage.setItem('middle', id.toUpperCase())
            toController(rels)
        }
    })
    document.getElementById('closePopupA').addEventListener('click', () => {
        document.getElementById('modalAttr').style.display = 'none'
    })
}

function searchRequiredFields(obj, choice) {
    let attr = containAndReturn(JSON.parse(window.config).nodes, 'abbrv', choice).attributes
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

function populateSelectText(obj) {
    var result = ''
    for (let [key, value] of Object.entries(obj)) {
        result += key + ': ' + value + ' '
    }
    return result
}

function fromController() {
    let radioTarget = document.getElementById('radioList')
    radioTarget.innerHTML = ' '
    let nodes = splitUnderscore(JSON.parse(localStorage.getItem('config')).nodes)
    for (let i = 0; i < nodes.length; i++) {
        radioTarget.innerHTML += `<li class="listItem" id="${nodes[i].abbrv}"><input type="radio" class="radioBtn" name="choice" id="${nodes[i].abbrv + '_opt'}" /> <label for="${nodes[i].abbrv + '_opt'}" class="radioLabel">${nodes[i].title}</label></li>`
    }

    let radioListFrom = document.getElementById('radioList').querySelectorAll('li')
    Array.prototype.slice.call(radioListFrom).forEach(function (listItem) {
        listItem.addEventListener('click', function (e) {
            e.preventDefault()
            e.stopPropagation()
            let radioCheck = document.getElementById('radioCheck')
            radioCheck.innerHTML = ' '
            localStorage.setItem('fromList', '')
            localStorage.setItem('middle', '')
            localStorage.setItem('fromList', this.id)
            let idChoice = this.id + '_opt'
            document.getElementById(idChoice).checked = true
            let neo4jName = containAndReturn(JSON.parse(localStorage.getItem('config')).nodes, 'abbrv', this.id).neo4jName
            loadNodes(neo4jName, this.id, 'first')
        })
    })
}

function toController(rels) {
    setTimeout(() => {
        document.getElementById('connectForm').style.display = 'none'
        document.getElementById('connectForm2').style.display = 'block'
    }, 1500);
    document.getElementById('back_co').addEventListener('click', () => {
        document.getElementById('connectForm').style.display = 'block'
        document.getElementById('connectForm2').style.display = 'none'
    })
    let from = localStorage.getItem('middle').toLowerCase()
    let targetNodes = []
    for (let i = 0; i < rels.length; i++) {
        if (rels[i].relName.toLowerCase() === from) {
            targetNodes.push(rels[i].relTarget)
        }
    }
    targetNodes = targetNodes[0]

    let target = document.getElementById('radioListTo')
    for (let i = 0; i < targetNodes.length; i++) {
        let title = containAndReturn(splitUnderscore(JSON.parse(localStorage.getItem('config')).nodes), 'abbrv', targetNodes[i]).title
        target.innerHTML += ` <li class="listItem" id="${targetNodes[i] + '_to'}"> <input type="radio" class="radioBtn" name="choice" id="${targetNodes[i] + '_opt_to'}" /> <label for="${targetNodes[i] + '_opt_to'}" class="radioLabel">${title}</label></li>`
    }

    let radioListTo = document.getElementById('radioListTo').querySelectorAll('li')
    Array.prototype.slice.call(radioListTo).forEach(function (listItem) {
        listItem.addEventListener('click', function (e) {
            e.preventDefault()
            e.stopPropagation()
            let idChoice = this.id.substr(0, this.id.indexOf('_'))
            document.getElementById(idChoice + '_opt_to').checked = true;
            let neo4jName = containAndReturn(JSON.parse(localStorage.getItem('config')).nodes, 'abbrv', idChoice).neo4jName
            loadNodes(neo4jName, this.id, 'second')
        })
    })
}

function connection() {
    const url = '/connect'
    const txt = 'Connection successful!'
    let data = []
    let from = JSON.parse(localStorage.getItem(localStorage.getItem('fromObj')))
    data.push(from)
    let middle = localStorage.getItem('middle')
    middle = { middle: middle }
    data.push(middle)
    let to = JSON.parse(localStorage.getItem(localStorage.getItem('toObj')))
    data.push(to)
    if (localStorage.getItem('middleAttr') != '') {
        var attr = JSON.parse(localStorage.getItem('middleAttr'))
        data.push(attr)
    }
    data = JSON.stringify(data)
    console.log(data)
    callConnect(url, data, popup(txt))
}

function callConnect(url, data, callback) {
    let xhr;
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log(xhr.responseText);
        }
    }
    xhr.open('POST', url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
}

