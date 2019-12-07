document.addEventListener('DOMContentLoaded',()=>{
    var giaohang=document.querySelector("input.giaohang");
    var hinhthucgiaohang=document.querySelector(".hinhthucgiaohang");
    giaohang.addEventListener("click",()=>{
        hinhthucgiaohang.classList.add("appearorder");
    });
    var thuong=document.querySelector(".thuong");
    var nhanh=document.querySelector(".nhanh");
    thuong.addEventListener("click",()=>{
        giaohang.value=thuong.innerHTML;
        hinhthucgiaohang.classList.remove("appearorder");
    });
    nhanh.addEventListener("click",()=>{
        giaohang.value=nhanh.innerHTML;
        hinhthucgiaohang.classList.remove("appearorder");
    });
},false);
