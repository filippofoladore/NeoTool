document.addEventListener('DOMContentLoaded', () => {
    drawGraph()
})

function drawGraph(rBool) {
    callAjax('/getProcess', (response) => {
        response = JSON.parse(response)
        if (rBool !== undefined) {
            if (rBool) {
                var config = {
                    container_id: "graph2",
                    server_url: response.port,
                    server_user: response.user,
                    server_password: response.password,
                    initial_cypher: `MATCH (n), (n1)-[r]-() RETURN n,n1,r`
                }
                let viz = new NeoVis.default(config)
                viz.render()
            } else {
                var config = {
                    container_id: "graph2",
                    server_url: response.port,
                    server_user: response.user,
                    server_password: response.password,
                    initial_cypher: `MATCH (n) RETURN n LIMIT 25`
                }
                let viz = new NeoVis.default(config)
                viz.render()
            }
        } else {
            var config = {
                container_id: "graph2",
                server_url: response.port,
                server_user: response.user,
                server_password: response.password,
                initial_cypher: `MATCH (n) RETURN n LIMIT 25`
            }
            let viz = new NeoVis.default(config)
            viz.render()
        }


        let check = document.getElementById('toggleConnessione')
        check.addEventListener('click', () => {
            if (check.checked == true) {
                drawGraph(check.checked)
            } else {
                drawGraph(check.checked)
            }
        })



    })
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