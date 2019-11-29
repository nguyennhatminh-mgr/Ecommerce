document.addEventListener('DOMContentLoaded',()=>{
    var ngaythamgia=document.querySelector(".ngaythamgia");
    var d=new Date();
    var n=d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate();
    console.log(n);
    ngaythamgia.value=n;
},false);