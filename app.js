const express = require("express")
const exphbs = require("express-handlebars")

const path = require("path")

const Sequelize = require("./config/bd")

const Consumo = require("./models/Consumo")
const Eletrodomestico = require("./models/eletrodomestico")
const Equipamento = require("./models/equipamento")
const UsuarioEquipamento = require("./models/usuarioEquipamento")

const app = express()
const port = 3000


// ==========================================
// EXPRESS
// ==========================================

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))


// ==========================================
// HANDLEBARS
// ==========================================

app.engine("handlebars", exphbs.engine({

    defaultLayout: "main",

    helpers: {

        eq: function (a, b) {
            return a === b
        },

        formatDate: function (data) {

            if (!data) {
                return ""
            }

            const partes = data.split("-")

            return `${partes[2]}/${partes[1]}/${partes[0]}`
        }

    }

}))

app.set("view engine", "handlebars")
app.set("views", "./views")


// ==========================================
// HOME
// ==========================================

app.get("/", async (req, res) => {

    try {

        const consumos = await Consumo.findAll({

            raw: true,

            order: [
                ["data", "DESC"]
            ]

        })

        let totalAgua = 0
        let totalEnergia = 0

        consumos.forEach(consumo => {

            if (consumo.tipo === "Água") {
                totalAgua += Number(consumo.valor)
            }

            if (consumo.tipo === "Energia") {
                totalEnergia += Number(consumo.valor)
            }

        })

        res.render("home", {

            consumos: consumos,

            totalAgua: totalAgua,

            totalEnergia: totalEnergia,

            mensagem: req.query.mensagem

        })

    } catch (erro) {

        console.log("Erro ao buscar consumos:", erro)

        res.send("Erro ao carregar a página")

    }

})


// ==========================================
// FORMULÁRIO DE CADASTRO DE CONSUMO
// ==========================================

app.get("/consumos/cadastrar", (req, res) => {

    res.render("consumo/cadastrar")

})


// ==========================================
// CADASTRAR CONSUMO
// ==========================================

app.post("/consumos/add", async (req, res) => {

    try {

        const { tipo, data, valor } = req.body

        await Consumo.create({

            tipo: tipo,

            data: data,

            valor: valor

        })

        res.redirect("/?mensagem=cadastrado")

    } catch (erro) {

        console.log("Erro ao cadastrar consumo:", erro)

        res.send("Erro ao cadastrar consumo")

    }

})


// ==========================================
// FORMULÁRIO DE EDIÇÃO DE CONSUMO
// ==========================================

app.get("/consumos/editar/:id", async (req, res) => {

    try {

        const id = req.params.id

        const consumo = await Consumo.findByPk(id, {
            raw: true
        })

        if (!consumo) {

            return res.send("Consumo não encontrado")

        }

        res.render("consumo/editar", {
            consumo: consumo
        })

    } catch (erro) {

        console.log("Erro ao buscar consumo:", erro)

        res.send("Erro ao buscar consumo")

    }

})


// ==========================================
// EDITAR CONSUMO
// ==========================================

app.post("/consumos/editar/:id", async (req, res) => {

    try {

        const id = req.params.id

        const { tipo, data, valor } = req.body

        const consumo = await Consumo.findByPk(id)

        if (!consumo) {

            return res.send("Consumo não encontrado")

        }

        consumo.tipo = tipo

        consumo.data = data

        consumo.valor = valor

        await consumo.save()

        res.redirect("/?mensagem=editado")

    } catch (erro) {

        console.log("Erro ao editar consumo:", erro)

        res.send("Erro ao editar consumo")

    }

})


// ==========================================
// EXCLUIR CONSUMO
// ==========================================

app.post("/consumos/excluir/:id", async (req, res) => {

    try {

        const id = req.params.id

        const consumo = await Consumo.findByPk(id)

        if (!consumo) {

            return res.send("Consumo não encontrado")

        }

        await consumo.destroy()

        res.redirect("/?mensagem=excluido")

    } catch (erro) {

        console.log("Erro ao excluir consumo:", erro)

        res.send("Erro ao excluir consumo")

    }

})


// ==========================================
// ELETRODOMÉSTICOS
// ==========================================

const equipamentosIniciais = [

    {
        nome: "Geladeira",
        categoria: "Cozinha",
        consumoEnergia: 55,
        consumoAgua: 0
    },

    {
        nome: "Freezer",
        categoria: "Cozinha",
        consumoEnergia: 60,
        consumoAgua: 0
    },

    {
        nome: "Micro-ondas",
        categoria: "Cozinha",
        consumoEnergia: 12,
        consumoAgua: 0
    },

    {
        nome: "Air Fryer",
        categoria: "Cozinha",
        consumoEnergia: 10,
        consumoAgua: 0
    },

    {
        nome: "Máquina de lavar",
        categoria: "Lavanderia",
        consumoEnergia: 14,
        consumoAgua: 1200
    },

    {
        nome: "Notebook",
        categoria: "Informática",
        consumoEnergia: 20,
        consumoAgua: 0
    },

    {
        nome: "TV Smart",
        categoria: "Entretenimento",
        consumoEnergia: 30,
        consumoAgua: 0
    },

    {
        nome: "Ventilador",
        categoria: "Climatização",
        consumoEnergia: 8,
        consumoAgua: 0
    },

    {
        nome: "Purificador de água",
        categoria: "Água",
        consumoEnergia: 10,
        consumoAgua: 30
    },

    {
        nome: "Chuveiro elétrico",
        categoria: "Banheiro",
        consumoEnergia: 250,
        consumoAgua: 3000
    }

]


// ==========================================
// LISTAR ELETRODOMÉSTICOS
// ==========================================

app.get("/eletrodomesticos", async (req, res) => {

    try {

        const equipamentos = await Eletrodomestico.findAll({

            where: {
                visivel: true
            },

            order: [
                ["categoria", "ASC"],
                ["nome", "ASC"]
            ]

        })

        res.render("eletrodomesticos", {

            equipamentos: equipamentos.map(e => e.get({ plain: true })),

            equipamentoEditar: null

        })

    } catch (erro) {

        console.log(erro)

        res.status(500).send("Erro ao listar equipamentos.")

    }

})


// ==========================================
// CADASTRAR ELETRODOMÉSTICO
// ==========================================

app.post("/eletrodomesticos", async (req, res) => {

    try {

        await Eletrodomestico.create({

            nome: req.body.nome,

            categoria: req.body.categoria,

            consumoEnergia: req.body.consumoEnergia,

            consumoAgua: req.body.consumoAgua,

            visivel: true

        })

        res.redirect("/eletrodomesticos")

    } catch (erro) {

        console.log(erro)

        res.status(500).send("Erro ao cadastrar equipamento.")

    }

})


// ==========================================
// ABRIR EDIÇÃO
// ==========================================

app.get("/eletrodomesticos/editar/:id", async (req, res) => {

    try {

        const equipamentos = await Eletrodomestico.findAll({

            where: {
                visivel: true
            },

            order: [
                ["categoria", "ASC"],
                ["nome", "ASC"]
            ]

        })

        const equipamentoEditar = await Eletrodomestico.findByPk(
            req.params.id
        )

        res.render("eletrodomesticos", {

            equipamentos: equipamentos.map(e => e.get({ plain: true })),

            equipamentoEditar: equipamentoEditar.get({ plain: true })

        })

    } catch (erro) {

        console.log(erro)

        res.status(500).send("Erro ao abrir edição.")

    }

})


// ==========================================
// ATUALIZAR ELETRODOMÉSTICO
// ==========================================

app.post("/eletrodomesticos/editar/:id", async (req, res) => {

    try {

        await Eletrodomestico.update({

            nome: req.body.nome,

            categoria: req.body.categoria,

            consumoEnergia: req.body.consumoEnergia,

            consumoAgua: req.body.consumoAgua

        }, {

            where: {
                id: req.params.id
            }

        })

        res.redirect("/eletrodomesticos")

    } catch (erro) {

        console.log(erro)

        res.status(500).send("Erro ao editar equipamento.")

    }

})


// ==========================================
// OCULTAR ELETRODOMÉSTICO
// ==========================================

app.post("/ocultar/:id", async (req, res) => {

    try {

        await Eletrodomestico.update({

            visivel: false

        }, {

            where: {
                id: req.params.id
            }

        })

        res.redirect("/eletrodomesticos")

    } catch (erro) {

        console.log(erro)

        res.status(500).send("Erro ao ocultar equipamento.")

    }

})


// ==========================================
// EQUIPAMENTOS OCULTOS
// ==========================================

app.get("/equipamentos-ocultos", async (req, res) => {

    try {

        const equipamentos = await Eletrodomestico.findAll({

            where: {
                visivel: false
            },

            order: [
                ["categoria", "ASC"],
                ["nome", "ASC"]
            ]

        })

        res.render("ocultos", {

            equipamentos: equipamentos.map(e => e.get({ plain: true }))

        })

    } catch (erro) {

        console.log(erro)

        res.status(500).send("Erro ao listar ocultos.")

    }

})


// ==========================================
// RESTAURAR ELETRODOMÉSTICO
// ==========================================

app.post("/restaurar/:id", async (req, res) => {

    try {

        await Eletrodomestico.update({

            visivel: true

        }, {

            where: {
                id: req.params.id
            }

        })

        res.redirect("/equipamentos-ocultos")

    } catch (erro) {

        console.log(erro)

        res.status(500).send("Erro ao restaurar equipamento.")

    }

})


// ==========================================
// EQUIPAMENTOS DO USUÁRIO
// ==========================================

app.get("/equipamentos", async (req, res) => {

    try {

        const usuario = 1

        const equipamentos = await Equipamento.findAll({

            include: [

                {

                    model: UsuarioEquipamento,

                    where: {
                        usuario_id: usuario
                    },

                    required: false

                }

            ]

        })

        res.render("equipamentos", {

            equipamentos

        })

    } catch (erro) {

        console.log(erro)

        res.status(500).send("Erro ao listar equipamentos.")

    }

})


app.put("/equipamentos/:id/visibilidade", async (req, res) => {

    try {

        await UsuarioEquipamento.update(

            {

                visivel: req.body.visivel

            },

            {

                where: {

                    equipamento_id: req.params.id,

                    usuario_id: 1

                }

            }

        )

        res.redirect("/equipamentos")

    } catch (erro) {

        console.log(erro)

        res.status(500).send("Erro ao alterar visibilidade.")

    }

})


// ==========================================
// INICIAR BANCO E SERVIDOR
// ==========================================

async function iniciar() {

    try {

        await Sequelize.sync()

        const quantidade = await Eletrodomestico.count()

        if (quantidade === 0) {

            await Eletrodomestico.bulkCreate(equipamentosIniciais)

            console.log("Equipamentos iniciais cadastrados.")

        }

    } catch (erro) {

        console.log(erro)

    }

}

iniciar().then(() => {

    app.listen(port, () => {

        console.log(`Servidor rodando em http://localhost:${port}`)

    })

}).catch((erro) => {

    console.log("Erro ao iniciar aplicação:")

    console.log(erro)

})

