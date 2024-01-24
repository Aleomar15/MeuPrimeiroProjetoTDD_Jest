const express = require("express");
const app = express();
const mongoose =  require("mongoose");
const user = require("./models/User");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const JWTSecret = "cjbcuibiusbciyscbyicbyscbyucbcuysbci"

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/guiapics").then(()=>{
    console.log("Banco conectado");
}).catch((err)=> {
    console.log(err);
}) 

let User = mongoose.model("User",user)


app.get("/", (req, res) => {
    res.json({});
});

app.post("/user",async (req, res) =>{
    if(req.body.name == "" || req.body.email == "" || req.body.password == ""){
        res.sendStatus(400)
        return;
    }
    
   
    try{
        let user = await User.findOne({"email": req.body.email});
        if(user != undefined){
            res.statusCode = 400;
            res.json({error: "E-mail já cadastrado"})
            return;
        }
        let password = req.body.password;
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(password, salt);


        let newUser = new User({name: req.body.name , email: req.body.email, password: hash});
        await newUser.save();
        res.json({email: req.body.email})
    }catch(err){
        res.sendStatus(500);
    }
    
});

app.post("/auth",async (req, res) => {
    let {email, password} = req.body;

    let user = await User.findOne({"email":email});

    if (user == undefined){
        res.statusCode = 403;
        res.json({errors: {email: "E-mail não cadastrado"}})
        return;
    }

    let isPassordRight = await bcrypt.compare(password, user.password);

    if(!isPassordRight){
        res.statusCode = 403;
        res.json({errors: {password: "Senha incorreta"}})
        return;
    }

    jwt.sign({email, name: user.name, id: user._id},JWTSecret,{expiresIn:'48h'},(err, token)=> {
        if(err){
            res.sendStatus(500);
            console.log(err);
        }else{
            res.json({token});
        }
    })
})

app.delete("/user:id", async(req, res) =>{
    await User.remove({"email":req.params.email});
    res.sendStatus(200);
})


module.exports = app;