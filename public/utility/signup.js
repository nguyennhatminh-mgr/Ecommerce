document.addEventListener('DOMContentLoaded',()=>{
    var gioitinh=document.getElementById("gioitinh");
    var hienthigioitinh=document.querySelector(".hienthigioitinh");
    var listitemgioitinh=document.querySelectorAll("p.itemgioitinh");

    createClick(gioitinh,hienthigioitinh,listitemgioitinh);
    
    var loainguoidung=document.getElementById("loainguoidung");
    var hienthiloaind=document.querySelector(".hienthiloaind");
    var listitemloaind=document.querySelectorAll("p.itemloaind");

    createClick(loainguoidung,hienthiloaind,listitemloaind);

},false);

function createClick(itemClick,itemAffected,listItem){
    itemClick.addEventListener("click",()=>{
        itemAffected.classList.add("appear");
    });
    
    listItem.forEach(element => {
        element.addEventListener("click",()=>{
            itemClick.value=element.innerHTML;
            itemAffected.classList.remove("appear");
        });
    });
}