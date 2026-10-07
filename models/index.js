const Usuario = require("./usuario");
const Eletrodomestico = require("./eletrodomestico");
const UsuarioEquipamento = require("./usuarioEquipamento");


Usuario.belongsToMany(Eletrodomestico,{
    through:UsuarioEquipamento,
    foreignKey:"usuario_id"
});


Eletrodomestico.belongsToMany(Usuario,{
    through:UsuarioEquipamento,
    foreignKey:"equipamento_id"
});


module.exports = {
    Usuario,
    Eletrodomestico,
    UsuarioEquipamento
};