document.addEventListener('DOMContentLoaded',()=>{
    var selectChooseBdate=document.querySelector(".selectChooseBdate");
    var selectChooseBmonth=document.querySelector(".selectChooseBmonth");
    var selectChooseByear=document.querySelector(".selectChooseByear");
    for(var i=1;i<32;i++){
        var ngay=document.createElement("option");
        ngay.text=i+"";
        selectChooseBdate.appendChild(ngay);
    }
    var d=new Date();
    for(var i=1;i<=12;i++){
        var month=document.createElement("option");
        month.text=i+"";
        selectChooseBmonth.appendChild(month);
    }
    for(var i=1899;i<d.getFullYear();i++){
        var year=document.createElement("option");
        year.text=i+"";
        selectChooseByear.appendChild(year);
    }
    console.log(selectChooseBdate);
    
});

function updateBdate(ngay,thang,nam){
    
    var selectChooseBdate=document.querySelector(".selectChooseBdate");
    var selectChooseBmonth=document.querySelector(".selectChooseBmonth");
    var selectChooseByear=document.querySelector(".selectChooseByear");
    
    var updateBdate=document.querySelector('.updateBdate');
    updateBdate.classList.remove('disappear');
    var initBdate=document.querySelector('.initBdate');
    initBdate.classList.add('disappear');

    var fakengaysinh=document.querySelector('.fakengaysinh');
    fakengaysinh.value="";

    checkUpdateBirthDate(selectChooseBdate,ngay);
    checkUpdateBirthDate(selectChooseBmonth,thang);
    checkUpdateBirthDate(selectChooseByear,nam);
    
}

function checkUpdateBirthDate(ele,ngay){
    var check=0;
    for(check=0;check<ele.options.length;check++){
        if(ele.options[check].value==ngay){
            ele.options[check].selected=true;
            break;
        }
    }
    for(var i=0;i<ele.options.length;i++){
        if(i!==check){
            ele.options[i].selected=false;
        }
    }
}

function updateGioitinh(gioitinh){
    console.log("click");
    var initgioitinh=document.querySelector('.initgioitinh');
    var aftergioitinh=document.querySelector('.aftergioitinh');
    var realgioitinh=document.querySelector('.gioitinh');

    initgioitinh.classList.add('disappear');
    aftergioitinh.classList.remove('disappear');
    
    
    var fakegioitinh=document.querySelector('.fakegioitinh');
    fakegioitinh.value="";
    

    checkUpdateBirthDate(realgioitinh,gioitinh);

}