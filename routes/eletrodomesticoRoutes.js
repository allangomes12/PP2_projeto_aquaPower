const express=require("express");

const router=express.Router();

const controller=require("../controllers/eletrodomesticoController");


//READ


router.get(
"/eletrodomesticos",
controller.listarEquipamentos
);


//CREATE


router.post(
"/eletrodomesticos",
controller.cadastrarEquipamento
);


//UPDATE


router.get(
"/eletrodomesticos/editar/:id",
controller.abrirEdicao
);

router.post(
"/eletrodomesticos/editar/:id",
controller.editarEquipamento
);


//DELETE


router.post(
"/ocultar/:id",
controller.ocultarEquipamento
);


//OCULTOS


router.get(
"/equipamentos-ocultos",
controller.listarOcultos
);


//RESTAURAR


router.post(
"/restaurar/:id",
controller.restaurarEquipamento
);

module.exports=router;