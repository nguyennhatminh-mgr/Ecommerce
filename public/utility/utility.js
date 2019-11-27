document.addEventListener('DOMContentLoaded',()=>{
    var sub=document.querySelector(".sub");
    var number=document.querySelector(".number");

    sub.addEventListener("click",()=>{
        if(parseInt(number.innerHTML)>1)
            number.innerHTML=parseInt(number.innerHTML)-1;
    });

    
},false);

function addClick(soluong){
    var number=document.querySelector(".number");
    if (parseInt(number.innerHTML)<soluong){
        number.innerHTML=parseInt(number.innerHTML)+1;
    }
}

