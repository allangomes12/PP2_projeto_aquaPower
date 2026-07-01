const Eletrodomestico=require("../models/eletrodomestico");

//==============================
//LISTAR
//==============================

async function listarEquipamentos(req,res){

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

}

//==============================
//ABRIR EDIÇÃO
//==============================

async function abrirEdicao(req,res){

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

}

//==============================
//CADASTRAR
//==============================

async function cadastrarEquipamento(req,res){

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

res.status(500).send("Erro ao cadastrar.");

}

}

//==============================
//EDITAR
//==============================

async function editarEquipamento(req,res){

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

res.status(500).send("Erro ao editar.");

}

}

//==============================
//OCULTAR
//==============================

async function ocultarEquipamento(req,res){

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

res.status(500).send("Erro ao ocultar.");

}

}

//==============================
//LISTAR OCULTOS
//==============================

async function listarOcultos(req,res){

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

}

//==============================
//RESTAURAR
//==============================

async function restaurarEquipamento(req,res){

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

res.status(500).send("Erro ao restaurar.");

}

}

module.exports={

listarEquipamentos,
abrirEdicao,
cadastrarEquipamento,
editarEquipamento,
ocultarEquipamento,
listarOcultos,
restaurarEquipamento

};