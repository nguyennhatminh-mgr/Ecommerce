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
    var proId=generateUniqueId();
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
    res.render("login",{danhmuc:danhmuc});
});

app.post("/login",urlencodedParser,(req,res)=>{
    console.log(req.body);
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

function generateUniqueId(){
    return "MSP"+Math.random().toString(36).substr(4,6);
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
    var listUser=null;
    var user=null;

    sql.connect(config).then(pool => {
        return pool.request().query("select * from UserAccount");
    }).then(result =>{
        listUser=result.recordset;
        for(var i=0;i<listUser.length;i++){
            if(listUser[i].mataikhoan===req.cookies.accountId){
                user=listUser[i];
            }
        }
        if(!user){
            res.redirect("/login");
            return;
        }
        res.locals.user=user;
        next();
    }).catch(err=>{
        console.log(err);
    });

}
