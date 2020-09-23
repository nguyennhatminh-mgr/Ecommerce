const express=require("express");
const bodyParser=require("body-parser");
const cookieParser=require('cookie-parser');
const md5=require('md5');

const sql=require('mssql');
const multer=require('multer');

const app=express();

app.set('view engine','pug');
app.set('views','./views');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var config = {
    user: 'sa',
    password: '123456',
    server: 'localhost', 
    database: 'E_commerce' ,
    port: 1433
};

app.use(express.static("public"));
app.use(cookieParser());

var danhmuc;
// query ban dau de lay danh muc san pham
sql.connect(config).then(pool => {
    return pool.request().query('select * from CategoryProduct');
}).then(result =>{
    danhmuc=result.recordset;
}).catch(err=>{
    console.log(err);
});

//Cau hinh noi luu tru file sau khi tai len
var storage =multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'./public/images/Products')
    },
    filename: (req,file,cb)=>{
        cb(null,file.originalname)
    }
});
var upload=multer({storage:storage});

app.post('/addProduct/create',upload.single("imageURL"),(req,res)=>{
    var filepath=convertPathFile(req.file.path);
    
    var madanhmuc=findMaByTen(req.body.cateproductName);
    var proId=generateUniqueId("MSP");
    var macuahang=req.body.macuahang;
    //Gia su nguoi dung nhap dung
    var queryInsert="exec addproduct '"+madanhmuc+"','"+proId+"',N'"+req.body.productName+"',N'"+req.body.productDescription+"',"+req.body.priceBuy+","+req.body.priceSale+",'"+filepath+"',N'"+req.body.manufacterName+"',N'"+req.body.manufacterAddr+"','"+req.body.manufacterPhone+"','"+macuahang+"',"+req.body.numberOfProduct;
    
    sql.connect(config).then(pool => {
        return pool.request().query(queryInsert);
    }).then(result =>{
        res.redirect("/home");
    }).catch(err=>{
        console.log(err);
    });
});

app.post("/update/:masanpham",upload.single("imageURL"),(req,res)=>{
    var filepath=convertPathFile(req.file.path);
    var madanhmuc=findMaByTen(req.body.cateproductName);

    var queryUpdate="update Product set Madanhmuc='"+madanhmuc+"',Tensanpham=N'"+req.body.productName+"',Motachitiet=N'"+req.body.productDescription+"',Giamua="+req.body.priceBuy+",Giaban="+req.body.priceSale+",Hinhanh='"+filepath+"',Tennhasx=N'"+req.body.manufacterName+"',Diachinhasx=N'"+req.body.manufacterAddr+"',Sdtnhasx='"+req.body.manufacterPhone+"',Soluong="+req.body.numberOfProduct+"where Masanpham='"+req.params.masanpham+"'";
    
    sql.connect(config).then(pool => {
        return pool.request().query(queryUpdate);
    }).then(result =>{
        res.redirect("/products/"+madanhmuc+"-"+req.params.masanpham);
    }).catch(err=>{
        console.log(err);
    });
});

app.get("/",(req,res)=>{
    sql.connect(config).then(pool => {
        return pool.request().query('select Madanhmuc,Masanpham,Tensanpham,Hinhanh,Giaban from Product');
    }).then(result =>{
        res.render('home',{result:result,funcCutStringNumber:cutStringNumber,danhmuc:danhmuc});
    }).catch(err=>{
        console.log(err);
    });
});

app.get('/home',loginMiddleware,(req,res)=>{

    sql.connect(config).then(pool => {
        return pool.request().query('select Madanhmuc,Masanpham,Tensanpham,Hinhanh,Giaban from Product');
    }).then(result =>{
        res.render('home',{result:result,funcCutStringNumber:cutStringNumber,danhmuc:danhmuc});
    }).catch(err=>{
        console.log(err);
    });
});

app.get("/myProduct/:macuahang",loginMiddleware,(req,res)=>{
    var macuahang=req.params.macuahang;
    sql.connect(config).then(pool => {
        return pool.request().query("select Madanhmuc,Masanpham,Tensanpham,Hinhanh,Giaban from Product where Macuahang='"+macuahang+"'");
    }).then(result =>{
        if(result.rowsAffected[0] != 0)
            res.render('home',{result:result,funcCutStringNumber:cutStringNumber,danhmuc:danhmuc});
        else
            res.render('notfound',{result:result,funcCutStringNumber:cutStringNumber,danhmuc:danhmuc});
    }).catch(err=>{
        console.log(err);
    });
});

app.get('/products/:id',loginMiddleware,(req,res)=>{
    var tempId=req.params.id.split("-");
    var madanhmuc=tempId[0];
    var masanpham=tempId[1];
    sql.connect(config).then(pool => {
        return pool.request().query("select* from Product where Madanhmuc='"+madanhmuc+"' and Masanpham='"+masanpham+"'");
    }).then(result =>{
        res.render("productDetail",{result:result,funcCutStringNumber:cutStringNumber,danhmuc:danhmuc});
    }).catch(err=>{
        console.log(err);
    });
});

app.get("/search/category/:madanhmuc",loginMiddleware,(req,res)=>{
    var madanhmuc=req.params.madanhmuc;

    sql.connect(config).then(pool => {
        return pool.request().query("select Product.Madanhmuc,Masanpham,Tensanpham,Hinhanh,Giaban from Product,CategoryProduct where Product.Madanhmuc=CategoryProduct.Madanhmuc and CategoryProduct.Madanhmuc='"+madanhmuc+"'");
    }).then(result =>{
        if(result.rowsAffected[0] != 0)
            res.render('home',{result:result,funcCutStringNumber:cutStringNumber,danhmuc:danhmuc});
        else
            res.render('notfound',{result:result,funcCutStringNumber:cutStringNumber,danhmuc:danhmuc});
    }).catch(err=>{
        console.log(err);
    });
});

app.post("/search/product",loginMiddleware,urlencodedParser,(req,res)=>{
    sql.connect(config).then(pool => {
        return pool.request().query('select Madanhmuc,Masanpham,Tensanpham,Hinhanh,Giaban from Product');
    }).then(result =>{
        var getListsanpham=findIdProductByName(req.body.searchProduct,result.recordset);
        if(getListsanpham.recordset.length>0)
            res.render('home',{result:getListsanpham,funcCutStringNumber:cutStringNumber,danhmuc:danhmuc,searchPro:req.body.searchProduct});
        else
            res.render('notfound',{result:getListsanpham,funcCutStringNumber:cutStringNumber,danhmuc:danhmuc,searchPro:req.body.searchProduct});
    }).catch(err=>{
        console.log(err);
    });
});

app.get("/addProduct",loginMiddleware,(req,res)=>{
    res.render("addProduct",{danhmuc:danhmuc,add:"Tạo",myAction:"/addProduct/create"});
});

app.get("/updateProduct/:masanpham",loginMiddleware,(req,res)=>{
    sql.connect(config).then(pool => {
        return pool.request().query("select* from Product where Masanpham='"+req.params.masanpham+"'");
    }).then(result =>{
        result.recordset[0].Tendanhmuc=findTendanhmucByMadanhmuc(result.recordset[0].Madanhmuc);
        res.render("addProduct",{danhmuc:danhmuc,sanpham:result.recordset[0],add:"Cập nhật",myAction:"/update/"+req.params.masanpham,funcConvert:uncovertPathFile});
    }).catch(err=>{
        console.log(err);
    });
    
});

app.get("/delete/product/:ma",loginMiddleware,(req,res)=>{
    var getMa=req.params.ma.split("-");
    var madanhmuc=getMa[0];
    var masanpham=getMa[1];
    sql.connect(config).then(pool => {
        return pool.request().query("exec dbo.deleteProduct '"+madanhmuc+"','"+masanpham+"'");
    }).then(result =>{
        if(!result.recordset){
            res.redirect("/home");
        }
        else{
            res.render("productDetail",{result:result,funcCutStringNumber:cutStringNumber,danhmuc:danhmuc,error:"Can not delete!!!"});
        }
        
    }).catch(err=>{
        console.log(err);
    });
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.post("/login",urlencodedParser,(req,res)=>{
    var username=req.body.tendangnhap;
    var password=req.body.matkhau;

    sql.connect(config).then(pool => {
        return pool.request().query("select * from UserAccount");
    }).then(result =>{
        validateUser(username,password,result.recordset,req,res);
    }).catch(err=>{
        console.log(err);
    });
});

app.get("/signup",(req,res)=>{
    res.render("signup");
});

app.post("/signup",urlencodedParser,(req,res)=>{
    var tendangnhap=req.body.tendangnhap;
    var matkhau=req.body.matkhau;
    var xacnhanmk=req.body.xacnhanmk;
    
    //check tendangnhap is duplicate or not
    sql.connect(config).then(pool => {
        return pool.request().query("select * from UserAccount");
    }).then(result =>{
        for(var i=0;i<result.recordset.length;i++){
            if(tendangnhap===result.recordset[i].tendangnhap){
                res.render("signup",{errors:"Username is exist.",values:req.body});
                check=true;
                return;
            }
        }

        if(matkhau!== xacnhanmk){
            res.render("signup",{errors:"Password and confirm password are not same.",values:req.body});
                return;
        }
        
        //create query insert
        var manguoidung=generateUniqueId("MND");
        var mataikhoan=generateUniqueId("MTK");
        var magiohang=generateUniqueId("MGH");
        
        var matkhauhash=md5(req.body.matkhau);
        var queryInsertMyUser="insert into MyUser values('"+manguoidung+"',N'"+req.body.hovaten+"',N'"+req.body.gioitinh+"','"+req.body.ngaysinh+"',N'"+req.body.diachi+"','"+req.body.email+"','"+req.body.sodienthoai+"')";
        var queryInsertUserAccount="insert into UserAccount values('"+mataikhoan+"','"+req.body.tendangnhap+"','"+matkhauhash+"','"+manguoidung+"')";
        var queryInsertUserBuyProduct="insert into UserBuyProduct values('"+manguoidung+"',0)";
        var queryInsertCart="insert into Cart values('"+magiohang+"','"+manguoidung+"')";
    
        //Insert to table MyUser
        sql.connect(config).then(pool => {
            return pool.request().query(queryInsertMyUser);
        }).then(result =>{
            //Insert to table UserAccount
            sql.connect(config).then(pool => {
                return pool.request().query(queryInsertUserAccount);
            }).then(result =>{
                res.cookie('accountId',mataikhoan);
                if(req.body.loainguoidung==="Người mua hàng"){
                    sql.connect(config).then(pool => {
                        return pool.request().query(queryInsertUserBuyProduct);
                    }).then(result =>{
                        sql.connect(config).then(pool => {
                            return pool.request().query(queryInsertCart);
                        }).then(result =>{
                            res.redirect("/home");
                            return;
                        }).catch(err=>{
                            console.log(err);
                        });
                    }).catch(err=>{
                        console.log(err);
                    });
                }
                else{
                    var d=new Date();
                    var getd=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
                    res.render("createShop",{manguoidung:manguoidung,getd:getd,danhmuc:danhmuc,myAction:"/createshop",btn:"Tạo"});
                    return;
                }
                
            }).catch(err=>{
                console.log(err);
            });
        }).catch(err=>{
            console.log(err);
        });
    }).catch(err=>{
        console.log(err);
    });
    
    

});

app.post("/createshop",urlencodedParser,(req,res)=>{
    var macuahang=generateUniqueId("MCH");
    var queryInsertShop="insert into Shop values('"+macuahang+"',N'"+req.body.tencuahang+"',N'"+req.body.diachi+"','"+req.body.ngaythamgia+"')";
    var queryInsertSaleProduct="insert into UserSaleProduct values('"+req.body.manguoidung+"','"+macuahang+"')";
    sql.connect(config).then(pool => {
        return pool.request().query(queryInsertShop);
    }).then(result =>{
        sql.connect(config).then(pool => {
            return pool.request().query(queryInsertSaleProduct);
        }).then(result =>{
            res.redirect("/home");
        }).catch(err=>{
            console.log(err);
        });
    }).catch(err=>{
        console.log(err);
    });
});

app.get("/logout",(req,res)=>{
    res.clearCookie('accountId');
    // res.cookie('accountId','');
    res.redirect("/");
});

app.get("/viewUser/:manguoidung",loginMiddleware,(req,res)=>{
    var manguoidung=req.params.manguoidung;
    sql.connect(config).then(pool => {
        return pool.request().query("select * from MyUser where MyUser.Manguoidung='"+manguoidung+"'");
    }).then(result =>{
        var d=new Date(result.recordset[0].ngaysinh);
        result.recordset[0].ngay=d.getDate();
        result.recordset[0].thang=d.getMonth()+1;
        result.recordset[0].nam=d.getFullYear();
        
        res.render("viewuser",{danhmuc:danhmuc,result:result.recordset[0]});
    }).catch(err=>{
        console.log(err);
    });
});

app.post("/viewUser/:manguoidung",urlencodedParser,(req,res)=>{
    var manguoidung=req.params.manguoidung;
    var ngaysinh = null;
    var gioitinh=null;
    if (req.body.fakengaysinh!==""){
        ngaysinh=req.body.fakengaysinh;
    }
    else{
        ngaysinh=req.body.nam+"-"+req.body.thang+"-"+req.body.ngay;
    }
    if(req.body.fakegioitinh!==""){
        gioitinh=req.body.fakegioitinh;
    }
    else{
        gioitinh=req.body.gioitinh;
    }
    
    var queryUpdate="update MyUser set hovaten=N'"+req.body.hovaten+"' ,gioitinh=N'"+gioitinh+"', ngaysinh='"+ngaysinh+"', diachi=N'"+req.body.diachi+"',email='"+req.body.email+"',sdt='"+req.body.sodienthoai+"' where manguoidung='"+manguoidung+"'";
    sql.connect(config).then(pool => {
        return pool.request().query(queryUpdate);
    }).then(result =>{
        res.redirect("/viewUser/"+manguoidung);
    }).catch(err=>{
        console.log(err);
    });
});

app.get("/myShop/:macuahang",loginMiddleware,(req,res)=>{
    var macuahang=req.params.macuahang;
    sql.connect(config).then(pool => {
        return pool.request().query("select Shop.macuahang,manguoidung,tencuahang,diachi,ngaythamgia from Shop,UserSaleProduct where Shop.macuahang=UserSaleProduct.macuahang and Shop.macuahang='"+macuahang+"'");
    }).then(result =>{
        var d=new Date(result.recordset[0].ngaythamgia);
        result.recordset[0].ngaythamgia=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
        
        res.render("createShop",{danhmuc:danhmuc,manguoidung:result.recordset[0].manguoidung,result:result.recordset[0],myAction:"/updateShop",btn:"Cập nhật"})
        
    }).catch(err=>{
        console.log(err);
    });
});

app.post("/updateShop",urlencodedParser,(req,res)=>{
    var macuahang=req.body.macuahang;
    var queryUpdate="update Shop set tencuahang=N'"+req.body.tencuahang+"',diachi=N'"+req.body.diachi+"' where macuahang='"+macuahang+"'";
    sql.connect(config).then(pool => {
        return pool.request().query(queryUpdate);
    }).then(result =>{
        res.redirect("/myShop/"+macuahang);
    }).catch(err=>{
        console.log(err);
    });
});

app.get("/cart/:manguoidung",loginMiddleware,(req,res)=>{
    var manguoidung=req.params.manguoidung;
    sql.connect(config).then(pool => {
        return pool.request().query("exec dbo.get_list_pro_in_cart '"+manguoidung+"'");
    }).then(result =>{
        var getList=result.recordset;
        
        if(getList){
            sql.connect(config).then(pool => {
                return pool.request().query("select dbo.cal_num_of_money_cart(magiohang) as totalMoney from Cart where magiohang='"+getList[0].magiohang+"'");
            }).then(result =>{
                res.render("cart",{result:getList,totalMoney:result.recordset[0].totalMoney,danhmuc:danhmuc,funcCut:cutStringNumber});
            }).catch(err=>{
                console.log(err);
            });
        }
        else{
            res.render('notfound',{result:result,funcCutStringNumber:cutStringNumber,danhmuc:danhmuc});
        }
       
    }).catch(err=>{
        console.log(err);
    });
});

app.get("/deleteproincart/:ma",loginMiddleware,(req,res)=>{
    var getMa=req.params.ma.split("-");
    var magiohang=getMa[0];
    var madanhmuc=getMa[1];
    var masanpham=getMa[2];
    var manguoidung=getMa[3];
    var queryDelete="delete from CartDetail where magiohang='"+magiohang+"' and madanhmuc='"+madanhmuc+"' and masanpham='"+masanpham+"'";
    sql.connect(config).then(pool => {
        return pool.request().query("exec dbo.increaseProOnDelFromCart '"+magiohang+"','"+madanhmuc+"','"+masanpham+"'");
    }).then(result =>{
        sql.connect(config).then(pool => {
            return pool.request().query(queryDelete);
        }).then(result =>{
            res.redirect("/cart/"+manguoidung);
        }).catch(err=>{
            console.log(err);
        });
    }).catch(err=>{
        console.log(err);
    });
});

app.post("/addToCard",urlencodedParser,(req,res)=>{
    var queryInsertCartDetail="exec dbo.addProToCart '"+req.body.manguoidung+"','"+req.body.madanhmuc+"','"+req.body.masanpham+"',"+req.body.soluong;
    sql.connect(config).then(pool => {
        return pool.request().query(queryInsertCartDetail);
    }).then(result =>{
        res.redirect("/cart/"+req.body.manguoidung);
    }).catch(err=>{
        console.log(err);
    });
});

app.get("/conductorder/:ma",loginMiddleware,(req,res)=>{
    var getList=req.params.ma.split("-");
    var manguoidung=getList[0];
    var totalMoney=getList[1];
    sql.connect(config).then(pool => {
        return pool.request().query("exec dbo.get_list_pro_in_cart '"+manguoidung+"'");
    }).then(result =>{
        var getList=result.recordset;
        sql.connect(config).then(pool => {
            return pool.request().query("select diachi from MyUser where manguoidung='"+manguoidung+"'");
        }).then(result =>{
            res.render("order",{danhmuc:danhmuc,diachi:result.recordset[0].diachi,totalMoney:totalMoney,result:getList,funcCutStringNumber:cutStringNumber});
        }).catch(err=>{
            console.log(err);
        });
        
    }).catch(err=>{
        console.log(err);
    });
    
});

app.post("/conductorder/:ma",urlencodedParser,(req,res)=>{
    var getList=req.params.ma.split("-");
    var magiohang=getList[0];
    var manguoidung=getList[1];
    var totalMoney=getList[2];
    var madonhang=generateUniqueId("MDH");
    var tinhtrang="Chưa được xử lý";
    var d=new Date();
    var getd=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
    var queryOrder="exec dbo.conductOrders '"+magiohang+"','"+madonhang+"','"+manguoidung+"',N'"+tinhtrang+"','"+getd+"',N'"+req.body.ghichu+"',N'"+req.body.hinhthucgiaohang+"',N'"+req.body.diachigiaohang+"'";
    sql.connect(config).then(pool => {
        return pool.request().query(queryOrder);
    }).then(result =>{
        res.redirect("/home");
    }).catch(err=>{
        console.log(err);
    });
});

app.get("/listorders/:manguoidung",loginMiddleware,(req,res)=>{
    var manguoidung=req.params.manguoidung;
    sql.connect(config).then(pool => {
        return pool.request().query("select * from Orders where manguoidung='"+manguoidung+"'");
    }).then(result =>{
        covertDateList(result.recordset);
        var getList=result.recordset;
        res.render("listorders",{danhmuc:danhmuc,result:result.recordset});
    }).catch(err=>{
        console.log(err);
    });
    
});

app.get("/orderdetail/:ma",loginMiddleware,(req,res)=>{
    var madonhang=req.params.ma;
    sql.connect(config).then(pool => {
        return pool.request().query("exec dbo.get_list_pro_in_order '"+madonhang+"'");
    }).then(result =>{
        var getList=result.recordset;
        sql.connect(config).then(pool => {
            return pool.request().query("select diachigiaohang,loaidonhang,ghichu from Orders where madonhang='"+madonhang+"'");
        }).then(result =>{
            var getInfo=result.recordset[0];
            sql.connect(config).then(pool => {
                return pool.request().query("select dbo.cal_num_of_money_order(madonhang) as totalMoney from Orders where madonhang='"+madonhang+"'");
            }).then(result =>{
                var totalMoney=result.recordset[0].totalMoney;
                res.render("order",{danhmuc:danhmuc,diachi:getInfo.diachigiaohang,addInfo:getInfo,totalMoney:totalMoney,result:getList,funcCutStringNumber:cutStringNumber,isdetail:true});
            }).catch(err=>{
                console.log(err);
            });
            
        }).catch(err=>{
            console.log(err);
        });
        
    }).catch(err=>{
        console.log(err);
    });
    
});

app.get("/deleteOrder/:ma",loginMiddleware,(req,res)=>{
    var getList=req.params.ma.split("-");
    var manguoidung=getList[0];
    var madonhang=getList[1];
    sql.connect(config).then(pool => {
        return pool.request().query("exec dbo.deleteorders '"+madonhang+"'");
    }).then(result =>{
        res.redirect("/listorders/"+manguoidung);
    }).catch(err=>{
        console.log(err);
    });
});

app.get("/viewTopProduct",loginMiddleware,(req,res)=>{
    sql.connect(config).then(pool => {
        return pool.request().query("exec dbo.get_pro_top_trending");
    }).then(result =>{
        if(result.rowsAffected[0] != 0)
            res.render('home',{result:result,funcCutStringNumber:cutStringNumber,danhmuc:danhmuc});
        else
            res.render('notfound',{result:result,funcCutStringNumber:cutStringNumber,danhmuc:danhmuc});
    }).catch(err=>{
        console.log(err);
    });
});

app.listen("3000",()=>{
    console.log("Server is running...");
});

// some function
function covertDateList(listItems){
    for (let index = 0; index < listItems.length; index++) {
        var d=new Date(listItems[index].ngaylap)
        listItems[index].ngaylap=d.getDate()+"-"+(d.getMonth()+1)+"-"+d.getFullYear();
    }
}

function cutStringNumber(number){
    number=parseInt(number);
    if(number<=1000){
        return number;
    }
    return cutStringNumber(number/1000)+","+((number%1000<10)?"00"+(number%1000):((number%1000>=10 && number%1000<100)?"0"+(number%1000):number%1000));
}


function convertPathFile(path){
    var arr=path.split('\\');
    var filepath="";
    for(var i=1;i<arr.length;i++){
        filepath+="/"+arr[i];
    }
    return filepath;
}

function uncovertPathFile(path){
    var arr=path.split('/');
    var filepath="";
    for(var i=1;i<arr.length;i++){
        filepath+="\\"+arr[i];
    }
    return filepath;
}

function findMaByTen(ten){
    for (let index = 0; index < danhmuc.length; index++) {
        if(danhmuc[index].Tendanhmuc.localeCompare(ten)===0){
            return danhmuc[index].Madanhmuc;
        }
    }
}

function findTendanhmucByMadanhmuc(Madanhmuc){
    for(var i=0;i<danhmuc.length;i++){
        if(danhmuc[i].Madanhmuc===Madanhmuc){
            return danhmuc[i].Tendanhmuc;
        }
    }
}

function generateUniqueId(ma){
    return ma+Math.random().toString(36).substr(4,6);
}

function findIdProductByName(name,arr){
    var arrResult=[];
    for(var i=0;i<arr.length;i++){
        if(arr[i].Tensanpham.toLowerCase().indexOf(name.toLowerCase()) !== -1){
            arrResult.push(arr[i]);
        }
    }
    return {recordset:arrResult};
}

function validateUser(username,password,listUser,req,res){
    var user=null;
    for(var i=0;i<listUser.length;i++){
        if(username===listUser[i].tendangnhap){
            user=listUser[i];
        }
    }
    if(!user){
        res.render("login",{danhmuc:danhmuc,errors:"User does not exist.",values:req.body});
        return;
    }
    var hashPassword=md5(password);

    if(user.matkhau!==hashPassword){
        res.render("login",{danhmuc:danhmuc,errors:"Password is wrong.",values:req.body})
        return;
    }
    res.cookie('accountId',user.mataikhoan);
    res.redirect("/home");
}




// function Middleware
function loginMiddleware(req,res,next){
    if(!req.cookies.accountId){
        res.redirect("/login");
        return;
    }
    // var listUser=null;
    var userAccount=null;

    sql.connect(config).then(pool => {
        return pool.request().query("select * from UserAccount where mataikhoan='"+req.cookies.accountId+"'");
    }).then(result =>{
        userAccount=result.recordset[0];
        //check accountid có tồn tại hay không
        if(!userAccount){
            res.redirect("/login");
            return;
        }
        //Câu lệnh truy vấn để tìm người dùng là bán hàng hoặc mua hàng
        var queryUserBuy="select MyUser.manguoidung,hovaten,diem from MyUser,UserBuyProduct where MyUser.manguoidung='"+userAccount.manguoidung+"' and MyUser.manguoidung=UserBuyProduct.manguoidung";
        var queryUserSale="select MyUser.manguoidung,macuahang,hovaten from MyUser,UserSaleProduct where MyUser.manguoidung='"+userAccount.manguoidung+"' and MyUser.manguoidung=UserSaleProduct.manguoidung";
        sql.connect(config).then(pool => {
            return pool.request().query(queryUserBuy);
        }).then(result =>{
            var userBuy=null;
            userBuy=result.recordset[0];
            //Nếu là người mua hàng
            if(userBuy){
                userBuy.loainguoidung="Buy";
                res.locals.user=userBuy;
                next();
            }
            //Nếu là người bán hàng
            else{
                sql.connect(config).then(pool => {
                    return pool.request().query(queryUserSale);
                }).then(result =>{
                    var userSale=null;
                    userSale=result.recordset[0];
                    if(userSale){
                        userSale.loainguoidung="Sale";
                        res.locals.user=userSale;
                        next();
                    }
                }).catch(err=>{
                    console.log(err);
                });   
            }
        }).catch(err=>{
            console.log(err);
        });    

    }).catch(err=>{
        console.log(err);
    });

}

