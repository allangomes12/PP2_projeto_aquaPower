const express=require("express");
const {engine}=require("express-handlebars");
const path=require("path");

const sequelize=require("./config/bd");

const Eletrodomestico=require("./models/eletrodomestico");
const Equipamento=require("./models/equipamento");
const UsuarioEquipamento=require("./models/usuarioEquipamento");

const app=express();

app.engine("handlebars",engine());
app.set("view engine","handlebars");

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(express.static(path.join(__dirname,"public")));

const equipamentosIniciais=[

{
nome:"Geladeira",
categoria:"Cozinha",
consumoEnergia:55,
consumoAgua:0
},

{
nome:"Freezer",
categoria:"Cozinha",
consumoEnergia:60,
consumoAgua:0
},

{
nome:"Micro-ondas",
categoria:"Cozinha",
consumoEnergia:12,
consumoAgua:0
},

{
nome:"Air Fryer",
categoria:"Cozinha",
consumoEnergia:10,
consumoAgua:0
},

{
nome:"Máquina de lavar",
categoria:"Lavanderia",
consumoEnergia:14,
consumoAgua:1200
},

{
nome:"Notebook",
categoria:"Informática",
consumoEnergia:20,
consumoAgua:0
},

{
nome:"TV Smart",
categoria:"Entretenimento",
consumoEnergia:30,
consumoAgua:0
},

{
nome:"Ventilador",
categoria:"Climatização",
consumoEnergia:8,
consumoAgua:0
},

{
nome:"Purificador de água",
categoria:"Água",
consumoEnergia:10,
consumoAgua:30
},

{
nome:"Chuveiro elétrico",
categoria:"Banheiro",
consumoEnergia:250,
consumoAgua:3000
}

];

async function iniciar(){

try{

await sequelize.sync();

const quantidade=await Eletrodomestico.count();

if(quantidade===0){

await Eletrodomestico.bulkCreate(equipamentosIniciais);

console.log("Equipamentos iniciais cadastrados.");

}

}catch(erro){

console.log(erro);

}

}

app.get("/",(req,res)=>{

res.render("home");

});


//ELETRODOMÉSTICOS


//READ

app.get("/eletrodomesticos",async(req,res)=>{

try{

const equipamentos=await Eletrodomestico.findAll({

where:{
visivel:true
},

order:[
["categoria","ASC"],
["nome","ASC"]
]

});

res.render("eletrodomesticos",{

equipamentos:equipamentos.map(e=>e.get({plain:true})),

equipamentoEditar:null

});

}catch(erro){

console.log(erro);

res.status(500).send("Erro ao listar equipamentos.");

}

});

//CREATE

app.post("/eletrodomesticos",async(req,res)=>{

try{

await Eletrodomestico.create({

nome:req.body.nome,

categoria:req.body.categoria,

consumoEnergia:req.body.consumoEnergia,

consumoAgua:req.body.consumoAgua,

visivel:true

});

res.redirect("/eletrodomesticos");

}catch(erro){

console.log(erro);

res.status(500).send("Erro ao cadastrar equipamento.");

}

});

//ABRIR EDIÇÃO

app.get("/eletrodomesticos/editar/:id",async(req,res)=>{

try{

const equipamentos=await Eletrodomestico.findAll({

where:{
visivel:true
},

order:[
["categoria","ASC"],
["nome","ASC"]
]

});

const equipamentoEditar=await Eletrodomestico.findByPk(

req.params.id

);

res.render("eletrodomesticos",{

equipamentos:equipamentos.map(e=>e.get({plain:true})),

equipamentoEditar:equipamentoEditar.get({plain:true})

});

}catch(erro){

console.log(erro);

res.status(500).send("Erro ao abrir edição.");

}

});

//UPDATE

app.post("/eletrodomesticos/editar/:id",async(req,res)=>{

try{

await Eletrodomestico.update({

nome:req.body.nome,

categoria:req.body.categoria,

consumoEnergia:req.body.consumoEnergia,

consumoAgua:req.body.consumoAgua

},{

where:{
id:req.params.id
}

});

res.redirect("/eletrodomesticos");

}catch(erro){

console.log(erro);

res.status(500).send("Erro ao editar equipamento.");

}

});


//OCULTAR


app.post("/ocultar/:id",async(req,res)=>{

try{

await Eletrodomestico.update({

visivel:false

},{

where:{
id:req.params.id
}

});

res.redirect("/eletrodomesticos");

}catch(erro){

console.log(erro);

res.status(500).send("Erro ao ocultar equipamento.");

}

});


//OCULTOS


app.get("/equipamentos-ocultos",async(req,res)=>{

try{

const equipamentos=await Eletrodomestico.findAll({

where:{
visivel:false
},

order:[
["categoria","ASC"],
["nome","ASC"]
]

});

res.render("ocultos",{

equipamentos:equipamentos.map(e=>e.get({plain:true}))

});

}catch(erro){

console.log(erro);

res.status(500).send("Erro ao listar ocultos.");

}

});


//RESTAURAR


app.post("/restaurar/:id",async(req,res)=>{

try{

await Eletrodomestico.update({

visivel:true

},{

where:{
id:req.params.id
}

});

res.redirect("/equipamentos-ocultos");

}catch(erro){

console.log(erro);

res.status(500).send("Erro ao restaurar equipamento.");

}

});


//EQUIPAMENTOS DO USUÁRIO


app.get("/equipamentos",async(req,res)=>{

try{

const usuario=1;

const equipamentos=await Equipamento.findAll({

include:[

{

model:UsuarioEquipamento,

where:{
usuario_id:usuario
},

required:false

}

]

});

res.render("equipamentos",{

equipamentos

});

}catch(erro){

console.log(erro);

res.status(500).send("Erro ao listar equipamentos.");

}

});

app.put("/equipamentos/:id/visibilidade",async(req,res)=>{

try{

await UsuarioEquipamento.update(

{

visivel:req.body.visivel

},

{

where:{

equipamento_id:req.params.id,

usuario_id:1

}

}

);

res.redirect("/equipamentos");

}catch(erro){

console.log(erro);

res.status(500).send("Erro ao alterar visibilidade.");

}

});


//INICIAR SERVIDOR


iniciar().then(()=>{

app.listen(3000,()=>{

console.log("Servidor rodando em http://localhost:3000");

});

}).catch((erro)=>{

console.log("Erro ao iniciar aplicação:");

console.log(erro);

});