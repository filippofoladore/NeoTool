if (localStorage.getItem('config') === null || localStorage.getItem('config') == undefined || localStorage.getItem('config') === '') {
    let modal = document.querySelector('.popupConfig');
    modal.style.zIndex = 1;
    modal.style.display = "block";
} else {
    let modal = document.querySelector('.popupConfig');
    modal.style.display = "none";
}


document.getElementById('closePopup').addEventListener('click', () => {
    let modal = document.querySelector('.popupConfig');
    modal.style.display = "none";
})