const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");


const Eletrodomestico = sequelize.define("Eletrodomestico", {

    nome:{
        type:DataTypes.STRING,
        allowNull:false
    },


    categoria:{
        type:DataTypes.STRING
    },


    consumoEnergia:{
        type:DataTypes.FLOAT
    },


    consumoAgua:{
        type:DataTypes.FLOAT
    }

});


module.exports = Eletrodomestico;