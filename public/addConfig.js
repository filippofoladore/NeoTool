var master = { nodes: [] }
localStorage.setItem('master', '')
const isFirefox = typeof InstallTrigger !== 'undefined';


document.getElementById('addPopupT').addEventListener('click', () => {
    if (document.getElementById('confTitle').value != '' && document.getElementById('confTitle').value != ' ') {
        localStorage.setItem('configName', document.getElementById('confTitle').value)
        document.getElementById('modalTitle').style.display = 'none'
        document.getElementById('container').style.display = 'block'
        master = { nodes: [] }
        addNodi()
    } else {
        document.getElementById('confTitle').classList.add('error');
        setTimeout(function () {
            document.getElementById('confTitle').classList.remove('error');
        }, 300);
        document.getElementById('confTitle').focus()
    }
})

document.getElementById('uploadConfig').addEventListener('click', () => {
    let file = document.forms['formUp']['fileUploaded'].files[0];
    if (file == undefined) {
        alert('Prima seleziona un file!')
    } else {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (e) {
            var rawLog = reader.result;
            localStorage.setItem('toModJSON', rawLog)
            let configName = file.name.substring(0, file.name.length - 5)
            localStorage.setItem('configName', configName)
            master = JSON.parse(localStorage.getItem('toModJSON'))
            document.getElementById('modalTitle').style.display = 'none'
            document.getElementById('container').style.display = 'block'
            addNodi()
        };
    }
})

document.getElementById('fileUploaded').addEventListener('change', () => {
    document.getElementById('uploadConfig').disabled = false
    document.querySelector('#uploadConfig').innerHTML = '<i class="fas fa-file-upload"></i> Carica'
    document.querySelector('#uploadConfig').style.backgroundColor = '#37d7a0'
})

document.getElementById('addContinue').addEventListener('click', () => {
    document.getElementById('attributesContainer').style.display = 'block'
    document.getElementById('container').style.display = 'none'
    let target = document.getElementById('nodeList')
    for (let i = 0; i < master.nodes.length; i++) {
        target.innerHTML += `<li class="nodeItem" id="${master.nodes[i].abbrv}">${master.nodes[i].title}</li>`
    }
    localStorage.setItem('master', JSON.stringify(master))
    attrListController()
})

document.getElementById('indietro').addEventListener('click', () => {
    window.location.replace('localhost:3000/createConfig')
    document.getElementById('attributesContainer').style.display = 'none'
    document.getElementById('container').style.display = 'block'
    document.getElementById('nodeList').innerHTML = ''
})

document.getElementById('addContinue2').addEventListener('click', () => {
    document.getElementById('attributesContainer').style.display = 'none'
    document.getElementById('relationshipContainer').style.display = 'block'
    let target = document.getElementById('relList')
    for (let i = 0; i < master.nodes.length; i++) {
        target.innerHTML += `<li class="nodeItem" id="${master.nodes[i].abbrv}">${master.nodes[i].title}</li>`
    }
    relsListController()
})

document.getElementById('indietro2').addEventListener('click', () => {
    document.getElementById('relList').innerHTML = ''
    document.getElementById('attributesContainer').style.display = 'block'
    document.getElementById('relationshipContainer').style.display = 'none'
})

document.getElementById('addContinueTerm').addEventListener('click', function (e) {
    e.preventDefault()
    e.stopPropagation()
    localStorage.setItem('master', JSON.stringify(master))
    //console.log(JSON.parse(master))
    download(localStorage.getItem('master'), `${localStorage.getItem('configName')}.json`, 'application/json')
})



function addNodi() {
    //popola list if node are present
    let list = document.querySelector('.nodeList')
    list.innerHTML = ''
    if (master.nodes.length != 0) {
        for (let i = 0; i < master.nodes.length; i++) {
            list.insertAdjacentHTML('beforeend', `<li class="node" data-key="${master.nodes[i].id}"><span>${master.nodes[i].title} (Abbrv: ${master.nodes[i].abbrv} - Neo4j: ${master.nodes[i].neo4jName})</span><button class="deleteNode jsDeleteNode"><svg><use href="#nodeDelete"></use></svg></button></li>`);
        }
    }
    document.getElementById('addNodeForm').addEventListener('submit', (e) => {
        e.preventDefault()
        e.stopPropagation()

        const add = {
            title: document.getElementById('nodeTitle').value,
            abbrv: document.getElementById('nodeAbbrv').value,
            neo4jName: document.getElementById('nodeNeo').value,
            attributes: [],
            relationship: [],
            id: Date.now()
        }

        master.nodes.push(add);
        const list = document.querySelector('.jsNodeList');
        list.insertAdjacentHTML('beforeend', `
        <li class="node" data-key="${add.id}">
          <span>${add.title} (Abbrv: ${add.abbrv} - Neo4j: ${add.neo4jName})</span>
          <button class="deleteNode jsDeleteNode">
            <svg><use href="#nodeDelete"></use></svg>
          </button>
        </li>
      `);
        document.getElementById('nodeTitle').value = ''
        document.getElementById('nodeAbbrv').value = ''
        document.getElementById('nodeNeo').value = ''
        document.getElementById('nodeTitle').focus()
    })

    const listNodes = document.querySelector('.jsNodeList');
    listNodes.addEventListener('click', event => {
        if (event.target.classList.contains('jsDeleteNode')) {
            const itemKey = event.target.parentElement.dataset.key;
            deleteNode(itemKey);
        }
    });
}

function deleteNode(key) {
    nodes = master.nodes.filter(item => item.id !== Number(key));
    const item = document.querySelector(`[data-key='${key}']`);
    item.remove();
    document.getElementById('nodeList').innerHTML = ''
    for (let i = 0; i < master.nodes.length; i++) {
        if (master.nodes[i].id === parseInt(key)) {
            master.nodes.splice(i, 1)
        }
    }
}

function deleteAttr(key, id) {
    master.nodes[id].attributes = master.nodes[id].attributes.filter(item => item.id !== Number(key));
    const item = document.querySelector(`[data-key='${key}']`);
    item.remove();
}

function deleteRel(key, id) {
    master.nodes[id].relationship = master.nodes[id].relationship.filter(item => item.id !== Number(key))
    const item = document.querySelector(`[data-key='${key}']`);
    item.remove();
}

function getIofObj(id) {
    let objId
    for (let i = 0; i < master.nodes.length; i++) {
        if (master.nodes[i].abbrv === id) {
            objId = i
        }
    }
    return objId
}

function attrListController() {
    let target = document.getElementById('nodeList').querySelectorAll('li')
    Array.prototype.slice.call(target).forEach(function (listItem) {
        listItem.addEventListener('click', function (e) {
            e.preventDefault()
            e.stopPropagation()
            addAttr(this.id)
        })
    })
}

function relsListController() {
    let target = document.getElementById('relList').querySelectorAll('li')
    Array.prototype.slice.call(target).forEach(function (listItem) {
        listItem.addEventListener('click', function (e) {
            e.preventDefault()
            e.stopPropagation()
            addRels(this.id)
        })
    })
}

function addAttr(id) {
    localStorage.setItem('objNo', id) //chissa se serve
    let obj = containAndReturn(master.nodes, 'abbrv', id)
    let modal = document.querySelector('.modalAttributes')
    let text = document.getElementById('popupConfig')
    var list = document.getElementById('attributesList')

    //mostra popup
    modal.style.display = 'block'
    text.textContent = ''
    text.textContent = 'Aggiungi attributi per ' + obj.title

    //load current attributes if present
    list.innerHTML = ''
    if (obj.attributes.length != 0) {
        for (let i = 0; i < obj.attributes.length; i++) {
            list.insertAdjacentHTML('beforeend', `<li class="node" data-key="${obj.attributes[i].id}"><span>${obj.attributes[i].placeholder} (Req: ${obj.attributes[i].required} - Type: ${obj.attributes[i].type})</span><button class="deleteNode jsDeleteNode"><svg><use href="#nodeDelete"></use></svg></button></li>`)
        }
    }

    document.getElementById('addAttributes').addEventListener('submit', (e) => {
        e.preventDefault()
        e.stopPropagation()
        let attr = {}
        if (document.getElementById('attrType').options[document.getElementById('attrType').selectedIndex].value === 'text') {
            attr = {
                id: Date.now(),
                name: document.getElementById('attrName').value,
                placeholder: document.getElementById('attrPlaceholder').value,
                type: 'text',
                required: document.getElementById('attrRequired').checked,
            }
        } else if (document.getElementById('attrType').options[document.getElementById('attrType').selectedIndex].value === 'date') {
            attr = {
                id: Date.now(),
                name: document.getElementById('attrName').value,
                placeholder: document.getElementById('attrPlaceholder').value,
                required: document.getElementById('attrRequired').checked,
                type: "date",
            }
        } else if (document.getElementById('attrType').options[document.getElementById('attrType').selectedIndex].value === 'number') {
            attr = {
                id: Date.now(),
                name: document.getElementById('attrName').value,
                placeholder: document.getElementById('attrPlaceholder').value,
                required: document.getElementById('attrRequired').checked,
                type: "number"
            }
        } else {
            attr = {
                id: Date.now(),
                name: document.getElementById('attrName').value,
                placeholder: document.getElementById('attrPlaceholder').value,
                required: document.getElementById('attrRequired').checked,
                type: "multi",
                multi: splitOption(document.getElementById('multiOption').value),
            }
        }

        if (attr.placeholder != '') {
            let objIndex = getIofObj(localStorage.getItem('objNo'))
            master.nodes[objIndex].attributes.push(attr)
            localStorage.setItem('master', JSON.stringify(master))
            const list = document.querySelector('.jsAttrList');
            list.insertAdjacentHTML('beforeend', `
            <li class="node" data-key="${attr.id}">
              <span>${attr.placeholder} (Req: ${attr.required} - Type: ${attr.type})</span>
              <button class="deleteNode jsDeleteNode">
                <svg><use href="#nodeDelete"></use></svg>
              </button>
            </li>
          `);
        }

        document.getElementById('attrName').value = ''
        document.getElementById('attrName').focus()
        document.getElementById('attrPlaceholder').value = ''
        document.getElementById('multiOption').value = ''
    })

    document.getElementById('attrType').addEventListener('change', function (e) {
        if (this.value === 'multi') {
            document.getElementById('multiOptionDiv').style.display = 'block'
            document.getElementById('multiOption').required = true
        } else {
            document.getElementById('multiOptionDiv').style.display = 'none'
            document.getElementById('multiOption').required = false
        }
    })

    const listAttr = document.querySelector('.jsAttrList');
    listAttr.addEventListener('click', event => {
        if (event.target.classList.contains('jsDeleteNode')) {
            const itemKey = event.target.parentElement.dataset.key;
            deleteAttr(itemKey, getIofObj(localStorage.getItem('objNo')));
        }
    });

    document.getElementById('closePopup').addEventListener('click', () => {
        let modal = document.querySelector('.modalAttributes');
        modal.style.display = "none";
        text.textContent = ''
    })
}

function addRels(id) {
    let obj = containAndReturn(master.nodes, 'abbrv', id)
    localStorage.setItem('objNoR', id)
    let modal = document.getElementById('modalRels')
    let text = document.getElementById('popupConfig2')
    // var list = document.getElementById('targetRels')
    modal.style.display = 'block'
    text.textContent = ''
    text.textContent = 'Aggiungi relazione per ' + obj.title

    //targetRels
    let relCheck = document.getElementById('targetRels')
    relCheck.innerHTML = ''
    for (let i = 0; i < master.nodes.length; i++) {
        relCheck.innerHTML += `<label class="checkcontainer">${master.nodes[i].title}<input type="checkbox" id="${master.nodes[i].abbrv}" /><span class="checkmark"></span></label>`
    }

    //load current relationship if present
    var list = document.getElementById('relsList')
    list.innerHTML = ''
    if (obj.relationship.length != 0) {
        for (let i = 0; i < obj.relationship.length; i++) {
            list.insertAdjacentHTML('beforeend', `<li class="node" data-key="${obj.relationship[i].id}"><span>${obj.relationship[i].relName}</span>
            <button class="deleteNode jsDeleteNode"><svg><use href="#nodeDelete"></use></svg></button></li>`)
        }
    }

    const attrCheck = document.querySelector('#attrRels')

    attrCheck.addEventListener('change', () => {
        if (attrCheck.checked) {
            document.querySelector('#attrNameAttr').style.display = 'block'
            document.querySelector('#attrNomeAttr').required = true
        } else {
            document.querySelector('#attrNameAttr').style.display = 'none'
            document.querySelector('#attrNomeAttr').required = false
        }
    })

    document.getElementById('addRels').addEventListener('submit', function (e) {
        e.preventDefault()
        e.stopPropagation()

        if (attrCheck && document.querySelector('#attrNomeAttr').value != '' && document.querySelector('#attrNomeAttr').value != ' ') {
            var relation = {
                id: Date.now(),
                relName: document.getElementById('relName').value,
                relTarget: getChecked(),
                relAttr: document.getElementById('attrRels').checked,
                relAttrName: splitOption(document.querySelector('#attrNomeAttr').value)
            }
        } else {
            var relation = {
                id: Date.now(),
                relName: document.getElementById('relName').value,
                relTarget: getChecked(),
                relAttr: document.getElementById('attrRels').checked
            }
        }

        if (relation.relName != '') {
            let objIndex = getIofObj(localStorage.getItem('objNoR'))
            master.nodes[objIndex].relationship.push(relation)
            localStorage.setItem('master', JSON.stringify(master))
            const list = document.querySelector('.jsRelsList');
            list.insertAdjacentHTML('beforeend', `<li class="node" data-key="${relation.id}"><span>${relation.relName}</span>
          <button class="deleteNode jsDeleteNode"><svg><use href="#nodeDelete"></use></svg></button></li>
          `);
        }
        document.getElementById('relName').value = ''
        document.querySelector('#attrNomeAttr').value = ''
        document.getElementById('relName').focus()
    })

    const listRels = document.querySelector('.jsRelsList');
    listRels.addEventListener('click', event => {
        if (event.target.classList.contains('jsDeleteNode')) {
            const itemKey = event.target.parentElement.dataset.key;
            deleteRel(itemKey, getIofObj(localStorage.getItem('objNoR')));
        }
    });


    document.getElementById('closePopupR').addEventListener('click', function () {
        let modal = document.querySelector('.modalRels');
        modal.style.display = "none";
        text.textContent = ''
    })

}

function containAndReturn(object, property, value) {
    for (var i = 0; i < object.length; i++) {
        if (object[i][property] === value) return object[i];
    }
    return false;
}

function getChecked() {
    var checkedBoxes = document.querySelectorAll("#targetRels input")
    let check = []
    for (let i = 0; i < checkedBoxes.length; i++) {
        if (checkedBoxes[i].checked) {
            check.push(checkedBoxes[i].id)
        }
    }
    return check
}

function splitOption(string) {
    let arr = string.split(';')
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == '') {
            arr.splice(i, 1)
        }
    }
    return arr
}

function download(text, name, type) {
    if (isFirefox) {
        const preBtn = document.querySelector('#download')
        preBtn.parentNode.removeChild(preBtn);
        const postBtn = document.createElement('a')
        postBtn.setAttribute('id', 'download');
        postBtn.setAttribute("type", "hidden");
        console.log(postBtn)
        let file = new Blob([text], { type: type });
        postBtn.href = URL.createObjectURL(file);
        postBtn.download = name;
        console.log(postBtn)
        postBtn.click()
    } else {
        let btn = document.getElementById("download");
        let file = new Blob([text], { type: type });
        btn.href = URL.createObjectURL(file);
        btn.download = name;
        document.getElementById('download').click()
        window.location.replace("/dashboard");
    }

}




