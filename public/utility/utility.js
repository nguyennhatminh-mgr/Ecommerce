document.addEventListener('DOMContentLoaded',()=>{
    var sub=document.querySelector(".sub");
    var number=document.querySelector(".number");

    sub.addEventListener("click",()=>{
        if(parseInt(number.value)>1)
            number.value=parseInt(number.value)-1;
    });

    
},false);

function addClick(soluong){
    var number=document.querySelector(".number");
    if (parseInt(number.value)<soluong){
        number.value=parseInt(number.value)+1;
    }
}

