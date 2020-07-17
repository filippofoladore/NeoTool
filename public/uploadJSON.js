localStorage.setItem('template', `{
    "nodes": [
      {
        "title": "Node title (space is underscore _)",
        "abbrv": "Node initial",
        "neo4jName": "Graph node name",
        "attributes": [
          {
            "name": "Attribute name (no spaces! Use underscore _)",
            "placeholder": "Attribute placeholder (you can use spaces)",
            "type": "Choice between 'text' / 'multi' / 'date' / 'number' ",
            "multi": ["Value 1", "Value 2"], //Use multi property only if type is multi!
            "required": true / false 
          } //remember comma if you add multiple attributes!
        ],
        "relationship": [
          {
            "relName": "Relationship name (no spaces! use underscore _)",
            "relTarget": ["Target1", "Target2"], //Use node initial of the target node
            "relAttr": true / false, //does the relation allow attributes?
            "relAttrName": ["Attribute1", "Attribute2"]
          } //remember comma if you add multiple relationships!
        ]
      } //remember comma if you add multiple nodes!
    ]
  } `)

var master = { nodes: [] }

document.getElementById('uploadForm').addEventListener('click', () => {
    let formData = new FormData()
    let file = document.forms['formUp']['fileUploaded'].files[0];
    if (file == undefined) {
        alert('Prima seleziona un file!')
    } else {
        var r = new FileReader()
        r.onload = (function (file) {
            return function (e) {
                var contents = e.target.result;
                contents = JSON.parse(contents)
                if (contents.nodes[0].hasOwnProperty('@context')) {
                    let objectData = jsonldHandler(contents)
                    let blob = new Blob([JSON.stringify(objectData)], { type: 'application/json' })
                    let file = new File([blob], 'config.json', { type: "application/json", lastModified: Date.now() })
                    formData.append("config", file, 'config.json');
                    sendFile(formData, (response) => {
                        let modal = document.querySelector('.modalbox');
                        modal.style.backgroundColor = '#21bf73'
                        modal.style.zIndex = 1;
                        modal.style.width = '30%';
                        modal.style.display = "block";
                        setTimeout(() => {
                            modal.style.animation = 'fadeout .7s linear';
                            setTimeout(() => {
                                modal.style.display = 'none';
                                window.location.replace("/dashboard");
                            }, 500);
                        }, 1500);
                    })
                } else {
                    console.log(file)
                    formData.append("config", file, 'config.json');
                    sendFile(formData, (response) => {
                        let modal = document.querySelector('.modalbox');
                        modal.style.backgroundColor = '#21bf73'
                        modal.style.zIndex = 1;
                        modal.style.width = '30%';
                        modal.style.display = "block";
                        setTimeout(() => {
                            modal.style.animation = 'fadeout .7s linear';
                            setTimeout(() => {
                                modal.style.display = 'none';
                                window.location.replace("/dashboard");
                            }, 500);
                        }, 1500);
                    })
                }

            }
        })(file)
        r.readAsText(file)
    }
})

document.getElementById('fileUploaded').addEventListener('change', () => {
    document.getElementById('uploadForm').disabled = false
    document.querySelector('#uploadForm').innerHTML = '<i class="fas fa-file-upload"></i> Upload now!'
    //document.querySelector('#uploadForm').style.backgroundColor = '#44217c'

})

document.getElementById('guidaContainer').addEventListener('click', () => {
    let modal = document.getElementById('rules')
    modal.style.backgroundColor = '#21bf73'
    modal.style.zIndex = 1;
    modal.style.width = '80%';
    modal.style.display = "block";
})

document.getElementById('downloadTemplate').addEventListener('click', function (e) {
    e.stopPropagation()
    e.preventDefault()
    download(localStorage.getItem('template'), 'config.json', 'application/json')
})

document.getElementById('closeTemplatePopup').addEventListener('click', () => {
    let modal = document.getElementById('rules')
    modal.style.display = "none";
})

function sendFile(data, callback) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            callback(xhr.responseText);
            localStorage.setItem('config', xhr.responseText)
        }
    }
    xhr.open("POST", "/uploadJSON");
    xhr.send(data)
}

function download(text, name, type) {
    let btn = document.getElementById("download");
    let file = new Blob([text], { type: type });
    btn.href = URL.createObjectURL(file);
    btn.download = name;
    document.getElementById('download').click()
}

function jsonldHandler(obj) {
    for (let i = 0; i < obj.nodes.length; i++) {
        extractNodes(obj.nodes[i])
    }
    removeDuplicate(master)
    return master
}

function extractNodes(obj) {
    var objReturn = {
        id: (Date.now() % Math.random() * (100 - 1) + 1).toString().substring(0, 6).replace('.', ""),
        type: obj['@type'],
        title: obj['@type'],
        abbrv: '',
        neo4jNodeName: obj['@type'],
        attributes: [],
        relationship: []
    }
    objReturn.abbrv = obj['@type'].substring(0, 3).toLowerCase() + '_' + objReturn.id
    var nested = []
    for (property in obj) {
        if (typeof (obj[property]) !== 'object' && property.charAt(0) !== '@') {
            let attribute = {
                name: property,
                placeholder: property.charAt(0).toUpperCase() + property.slice(1).replace(/([A-Z])/g, ' $1').trim(),
                type: 'text'
            }
            objReturn.attributes.push(attribute)
        } else if (typeof (obj[property]) == 'object') {
            nested.push(property)
            extractNodes(obj[property])
        }
    }

    for (let i = 0; i < nested.length; i++) {
        var relation = {
            relName: nested[i],
            relTarget: ''
        }
        let abbrvObject = containAndReturn(obj[nested[i]]['@type']).abbrv
        relation.relTarget = abbrvObject
        objReturn.relationship.push(relation)
    }
    master.nodes.push(objReturn)
}

function removeDuplicate(obj) {
    obj.nodes = obj.nodes.filter((element, index, self) =>
        index === self.findIndex((e) => (
            e.type === element.type
        ))
    )
}

function containAndReturn(value) {
    for (var i = 0; i < master.nodes.length; i++) {
        if (master.nodes[i]['type'] === value) return master.nodes[i];
    }
    return false;
}