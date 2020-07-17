const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const neo4j = require('neo4j-driver').v1
const dotenv = require('dotenv')
const fs = require('fs')
const favicon = require('serve-favicon')

var multer = require('multer')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + process.env.SLASH + 'public')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

var upload = multer({ storage: storage });

//inizializzazione 
const app = express();
dotenv.config()
//settaggio view engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

//body parser per recuperare i dati passati in richiesta
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//neo4j driver setup
const driver = neo4j.driver(process.env.PORT, neo4j.auth.basic(process.env.USERNAME_NEO4J, process.env.PASSWORD_NEO4J), {
    encrypted: 'ENCRYPTION_OFF'
})

const session = driver.session()


app.get('/', function (req, res) {
    res.render('landing.html')
})

app.get('/dashboard', (req,res) => {
    res.render('dashboard.html')
})

//pagina inserimento
app.get('/insert', function (req, res) {
    res.render('insert.html')
})

//pagina esplora
app.get('/explore', function (req, res) {
    res.render('explore.html')
})

app.get('/configuration', function (req, res) {
    res.render('configuration.html')
})

app.get('/uploadConfig', function (req, res) {
    res.render('uploadConfig.html')
})

app.get('/createConfig', function (req, res) {
    res.render('createConfig.html')
})

app.get('/edit', function (req, res) {
    res.render('edit.html')
})

app.get('/about', (req, res) => {
    res.render('about.html')
})


app.post('/uploadJSON', function (req, res) {
    var upload = multer({ storage: storage }).single('config')
    upload(req, res, function (err) {
        if (err) {
            console.log(err)
        } else {
            let filePath = path.join(__dirname, 'public/config.json')
            res.sendFile(filePath)
        }
    })
})

app.get('/deleteConfig', function (req, res) {
    const file = path.join(__dirname, '/public/config.json')
    fs.unlink(file, () => {
        res.send('OK')
    })
})

app.get('/getConfig', function (req, res) {
    let filePath = path.join(__dirname, 'public/config.json')
    res.sendFile(filePath)
})

app.post('/connect', function (req, res) {
    if (req.body.length > 3) {
        var lengthAttr = Object.keys(req.body[3]).length
    }

    if (req.body.length === 3) {
        var middle = req.body[1].middle
        var queryMiddle = 'CREATE (a)-[r:' + middle + ']->(b) RETURN type(r)'
    } else {
        if (lengthAttr === 1) {
            var middle = req.body[1].middle
            let attr = req.body[3]
            var queryMiddle = `CREATE (a)-[r:${middle} {${Object.keys(attr)[0]}: "${Object.values(attr)[0]}"}]->(b) RETURN type(r)`
        } else {
            var middle = req.body[1].middle
            let attr = req.body[3]
            let attrText = ''
            for (let i = 0; i < lengthAttr; i++) {
                if (i < lengthAttr - 1) {
                    attrText += `${Object.keys(attr)[i]} : "${Object.values(attr)[i]}", `
                } else {
                    attrText += `${Object.keys(attr)[i]} : "${Object.values(attr)[i]}" `
                }
            }
            var queryMiddle = `CREATE (a)-[r:${middle} {${attrText}}]->(b) RETURN type(r)`
        }
    }


    let queryFrom = 'MATCH (a) WHERE a.'
    let queryTo = 'MATCH (b) WHERE b.'
    let queryStart = 'MATCH (a), (b) '
    let fromSize = Object.keys(req.body[0]).length
    let toSize = Object.keys(req.body[2]).length

    for (let i = 0; i < fromSize; i++) {
        if (i < fromSize - 1) {
            queryFrom += `${Object.keys(req.body[0])[i]} = "${Object.values(req.body[0])[i]}" AND a.`
        } else {
            queryFrom += `${Object.keys(req.body[0])[i]} = "${Object.values(req.body[0])[i]}" `
        }
    }

    for (let i = 0; i < toSize; i++) {
        if (i < toSize - 1) {
            queryTo += `${Object.keys(req.body[2])[i]} = "${Object.values(req.body[2])[i]}" AND b.`
        } else {
            queryTo += `${Object.keys(req.body[2])[i]} = "${Object.values(req.body[2])[i]}" `
        }
    }

    let queryFinal = queryStart + queryFrom + queryTo + queryMiddle
    session
        .run(queryFinal)
        .then((result) => {
            res.json(result)
            session.close()
        })
        .catch((err) => {
            console.log(err)
        })

})

app.post('/addNode/:from', function (req, res) {
    let object = req.body
    let size = Object.keys(object).length
    let objectText = ''
    for (let i = 0; i < size; i++) {
        let objectKey = Object.keys(object)[i]
        let objectValue = Object.values(object)[i]
        if (i === size - 1) {
            objectText += objectKey + ': ' + "'" + objectValue + "'"
        } else {
            objectText += objectKey + ': ' + "'" + objectValue + "'" + ', '
        }
    }
    let query = `CREATE (n: ${req.params.from} {${objectText}}) RETURN n`
    session
        .run(query)
        .then(function () {
            res.send()
            session.close()
        })
        .catch(function (err) {
            console.log(err)
        })
})

app.get('/getNodes/:id', function (req, res) {
    let query = `MATCH (n:${req.params.id}) RETURN n`
    session
        .run(query)
        .then(function (result) {
            res.json(result)
            session.close()
        })
        .catch(function (err) {
            console.log(err)
        })
})

app.get('/getProcess', function (req, res) {
    let obj = {
        user : process.env.USERNAME_NEO4J,
        password : process.env.PASSWORD_NEO4J,
        port: process.env.PORT
    }
    res.send(obj)
})

app.post('/getNode/:id', function (req, res) {
    let size = Object.keys(req.body).length
    let objectText = ''
    for (let i = 0; i < size; i++) {
        let objectKey = Object.keys(req.body)[i]
        let objectValue = Object.values(req.body)[i]
        if (i === size - 1) {
            objectText += objectKey + ': ' + "'" + objectValue + "'"
        } else {
            objectText += objectKey + ': ' + "'" + objectValue + "'" + ', '
        }
    }
    let query = `MATCH (n:${req.params.id} {${objectText}}) RETURN n`
    session
        .run(query)
        .then(function (result) {
            res.send(result)
            session.close()
        })
        .catch(function (err) {
            console.log(err)
        })
})

app.post('/editNode/:id', function (req, res) {
    let sizeReq = Object.keys(req.body.required[0]).length
    let sizeEdit = Object.keys(req.body.edit[0]).length
    let reqText = ''
    let editText = ''
    for (let i = 0; i < sizeReq; i++) {
        let objectKey = Object.keys(req.body.required[0])[i]
        let objectValue = Object.values(req.body.required[0])[i]
        if (i === sizeReq - 1) {
            reqText += objectKey + ': ' + "'" + objectValue + "'"
        } else {
            reqText += objectKey + ': ' + "'" + objectValue + "'" + ', '
        }
    }

    for (let i = 0; i < sizeEdit; i++) {
        let objectKey = Object.keys(req.body.edit[0])[i]
        let objectValue = Object.values(req.body.edit[0])[i]
        if (i === sizeEdit - 1) {
            editText += 'n.' + objectKey + '= ' + "'" + objectValue + "'"
        } else {
            editText += 'n.' + objectKey + '= ' + "'" + objectValue + "'" + ', '
        }
    }

    let query = `MATCH (n:${req.params.id} {${reqText}}) SET ${editText} RETURN n`
    session
        .run(query)
        .then(function (result) {
            res.json(result)
            session.close()
        })
        .catch(function (err) {
            console.log(err)
        })
})

app.post('/findOne/:id', function (req, res) {
    let object = req.body
    let size = Object.keys(object).length
    let objectText = ''
    for (let i = 0; i < size; i++) {
        let objectKey = Object.keys(object)[i]
        let objectValue = Object.values(object)[i]
        if (i === size - 1) {
            objectText += objectKey + ': ' + "'" + objectValue + "'"
        } else {
            objectText += objectKey + ': ' + "'" + objectValue + "'" + ', '
        }
    }
    let query = `MATCH (a:${req.params.id} {${objectText}}) RETURN COUNT (a)`
    session
        .run(query)
        .then(function (result) {
            res.json(result)
            session.close()
        })
        .catch(function (err) {
            console.log(err)
        })
})

app.post('/getRelations/:id', function (req, res) {
    let size = Object.keys(req.body).length
    let objectText = ''
    for (let i = 0; i < size; i++) {
        let objectKey = Object.keys(req.body)[i]
        let objectValue = Object.values(req.body)[i]
        if (i === size - 1) {
            objectText += objectKey + ': ' + "'" + objectValue + "'"
        } else {
            objectText += objectKey + ': ' + "'" + objectValue + "'" + ', '
        }
    }
    let query = `MATCH (a:${req.params.id} {${objectText}})-[r]->(b) RETURN type(r), a, b`
    session
        .run(query)
        .then(function (result) {
            res.send(result)
            session.close()
        })
        .catch(function (err) {
            console.log(err)
        })
})

app.post('/deleteRelations', function (req, res) {
    let sourceSize = Object.keys(req.body.source).length
    let destSize = Object.keys(req.body.dest).length
    let sourceText = ''
    let destText = ''
    for (let i = 0; i < sourceSize; i++) {
        let objectKey = Object.keys(req.body.source)[i]
        let objectValue = Object.values(req.body.source)[i]
        if (i === sourceSize - 1) {
            sourceText += objectKey + ': ' + "'" + objectValue + "'"
        } else {
            sourceText += objectKey + ': ' + "'" + objectValue + "'" + ', '
        }
    }

    for (let i = 0; i < destSize; i++) {
        let objectKey = Object.keys(req.body.dest)[i]
        let objectValue = Object.values(req.body.dest)[i]
        if (i === destSize - 1) {
            destText += objectKey + ': ' + "'" + objectValue + "'"
        } else {
            destText += objectKey + ': ' + "'" + objectValue + "'" + ', '
        }
    }


    let query = `MATCH (a:${req.body.sourceLabel} {${sourceText}})-[r:${req.body.relName}]->(b:${req.body.destLabel} {${destText}}) DELETE r`
    session
        .run(query)
        .then(function (result) {
            res.send(result)
            session.close()
        })
        .catch(function (err) {
            console.log(err)
        })

})

//settaggio porta
app.listen(3000, () => console.log('Server started on port 3000.'));

//esportazione app
module.exports = app;
