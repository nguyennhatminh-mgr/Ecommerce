document.addEventListener('DOMContentLoaded',()=>{
    var catename=document.querySelector("input.catename");
    var subselectCategory=document.querySelector(".subselectCategory");
    var listitemSelectCate=document.querySelectorAll(".itemSelectCate");

    catename.addEventListener('click',()=>{
        subselectCategory.classList.add("appear");
    });

    listitemSelectCate.forEach(element => {
        element.addEventListener("click",()=>{
            catename.value=element.innerHTML;
            subselectCategory.classList.remove("appear");
        });
    });

    
});


