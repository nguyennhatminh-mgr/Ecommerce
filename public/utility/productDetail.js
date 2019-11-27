document.addEventListener('DOMContentLoaded',()=>{
    var btnDel=document.querySelectorAll(".selectBuy")[1];
    var alertDelete=document.querySelector(".alertDelete");
    var nodelete=document.querySelector(".nodelete");

    btnDel.addEventListener("click",()=>{
        alertDelete.classList.add("appear");
    });

    nodelete.addEventListener("click",()=>{
        alertDelete.classList.remove("appear");
    });
});