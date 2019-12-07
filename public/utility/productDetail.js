document.addEventListener('DOMContentLoaded',()=>{
    var btnDel=document.querySelector(".deletePro");
    var alertDelete=document.querySelector(".alertDelete");
    var nodelete=document.querySelector(".nodelete");

    btnDel.addEventListener("click",()=>{
        alertDelete.classList.add("appear");
    });

    nodelete.addEventListener("click",()=>{
        alertDelete.classList.remove("appear");
    });
});