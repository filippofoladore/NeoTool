document.getElementById("deleteConfig").addEventListener("click", () => {
    localStorage.setItem("config", "");
    localStorage.setItem("master", "");
    callAjax('/deleteConfig', function (e) {
        window.scrollTo(0, 0);
        let modal = document.querySelector(".popupConfig");
        modal.style.zIndex = 1;
        modal.style.display = "block";
        setTimeout(() => {
            modal.style.animation = "fadeout 1.25s linear";
            setTimeout(() => {
                modal.style.display = "none";
                window.location.replace("/dashboard");
            }, 500);
        }, 1500);
    })

});

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