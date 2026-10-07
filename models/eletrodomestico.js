const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");

const Eletrodomestico = sequelize.define("Eletrodomestico", {

    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },

    categoria: {
        type: DataTypes.STRING,
        allowNull: false
    },

    consumoEnergia: {
        type: DataTypes.FLOAT,
        allowNull: false
    },

    consumoAgua: {
        type: DataTypes.FLOAT,
        allowNull: false
    },

    visivel: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }

});

module.exports = Eletrodomestico;