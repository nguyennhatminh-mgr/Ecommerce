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
    var macuahang="MCH222222";
    //Gia su nguoi dung nhap dung
    var queryInsert="insert into Product values('"+madanhmuc+"','"+proId+"',N'"+req.body.productName+"',N'"+req.body.productDescription+"',"+req.body.priceBuy+","+req.body.priceSale+",'"+filepath+"',N'"+req.body.manufacterName+"',N'"+req.body.manufacterAddr+"','"+req.body.manufacterPhone+"','"+macuahang+"',null,"+req.body.numberOfProduct+")";
    
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

    var queryUpdate="update Product set Madanhmuc='"+madanhmuc+"',Tensanpham=N'"+req.body.productName+"',Motachitiet=N'"+req.body.productDescription+"',Giamua="+req.body.priceBuy+",Giaban="+req.body.priceSale+",Tennhasx=N'"+req.body.manufacterName+"',Diachinhasx=N'"+req.body.manufacterAddr+"',Sdtnhasx='"+req.body.manufacterPhone+"',Soluong="+req.body.numberOfProduct+"where Masanpham='"+req.params.masanpham+"'";
    
    sql.connect(config).then(pool => {
        return pool.request().query(queryUpdate);
    }).then(result =>{
        res.redirect("/products/"+madanhmuc+"-"+req.params.masanpham);
    }).catch(err=>{
        console.log(err);
    });
});

app.get('/home',(req,res)=>{

    sql.connect(config).then(pool => {
        return pool.request().query('select Madanhmuc,Masanpham,Tensanpham,Hinhanh,Giaban from Product');
    }).then(result =>{
        res.render('home',{result:result,funcCutStringNumber:cutStringNumber,danhmuc:danhmuc});
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

app.get("/delete/product/:masanpham",loginMiddleware,(req,res)=>{
    sql.connect(config).then(pool => {
        return pool.request().query("delete from Product where Masanpham='"+req.params.masanpham+"'");
    }).then(result =>{
        res.redirect("/home");
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
    console.log(req.body);
    
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
                return;
            }
        }
    }).catch(err=>{
        console.log(err);
    });
    if(matkhau!== xacnhanmk){
        res.render("signup",{errors:"Password and confirm password are not same.",values:req.body});
            return;
    }
    // checkNull(req.body.hovaten,req,res);
    // checkNull(req.body.gioitinh,req,res);
    // checkNull(req.body.ngaysinh,req,res);
    // checkNull(req.body.diachi,req,res);
    // checkNull(req.body.loainguoidung,req,res);
    // checkNull(req.body.email,req,res);
    // checkNull(req.body.sodienthoai,req,res);
    // checkNull(req.body.tendangnhap,req,res);
    // checkNull(req.body.matkhau,req,res);
    // checkNull(req.body.xacnhanmk,req,res);

    //create query insert
    var manguoidung=generateUniqueId("MND");
    var mataikhoan=generateUniqueId("MTK");
    
    var matkhauhash=md5(req.body.matkhau);
    var queryInsertMyUser="insert into MyUser values('"+manguoidung+"',N'"+req.body.hovaten+"',N'"+req.body.gioitinh+"','"+req.body.ngaysinh+"',N'"+req.body.diachi+"','"+req.body.email+"','"+req.body.sodienthoai+"')";
    var queryInsertUserAccount="insert into UserAccount values('"+mataikhoan+"','"+req.body.tendangnhap+"','"+matkhauhash+"','"+manguoidung+"')";
    var queryInsertUserBuyProduct="insert into UserBuyProduct values('"+manguoidung+"',0)";
    

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
                    res.redirect("/home");
                    return;
                }).catch(err=>{
                    console.log(err);
                });
            }
            else{
                res.render("createShop",{manguoidung:manguoidung,danhmuc:danhmuc});
                return;
            }
            
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
    res.cookie('accountId','');
    res.redirect("/home");
});

app.listen("3000",()=>{
    console.log("Server is running...");
});

// some function
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

function checkNull(valueToCheck,req,res){
    if(!valueToCheck){
        res.render("signup",{errors:"Value of is null.",values:req.body});
        return;
    }
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
                console.log(userBuy);
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
                        console.log(userSale);
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
