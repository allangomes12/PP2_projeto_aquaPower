const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");


const UsuarioEquipamento = sequelize.define("UsuarioEquipamento", {

    usuario_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },


    equipamento_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },


    visivel:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    }

});


module.exports = UsuarioEquipamento;