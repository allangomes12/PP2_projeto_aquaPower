const express = require("express")
const exphbs = require("express-handlebars")

const path = require("path")

const Sequelize = require("./config/bd")

const Consumo = require("./models/Consumo")
const Eletrodomestico = require("./models/eletrodomestico")

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
app.set("views", path.join(__dirname, "views"))


// ==========================================
// VALIDAÇÕES
// ==========================================

const TIPOS_CONSUMO = ["Água", "Energia"]

const MENSAGENS_VALIDAS = ["cadastrado", "editado", "excluido"]

const CATEGORIAS = [
    "Cozinha",
    "Lavanderia",
    "Climatização",
    "Entretenimento",
    "Informática",
    "Limpeza",
    "Água",
    "Banheiro",
    "Cuidados pessoais"
]

function numeroValido(valor) {

    return valor !== undefined
        && valor !== ""
        && Number.isFinite(Number(valor))
        && Number(valor) >= 0

}

function consumoValido({ tipo, data, valor }) {

    return TIPOS_CONSUMO.includes(tipo)
        && /^\d{4}-\d{2}-\d{2}$/.test(data || "")
        && numeroValido(valor)

}

function equipamentoValido(corpo) {

    const nome = typeof corpo.nome === "string" ? corpo.nome.trim() : ""

    return nome.length >= 2
        && nome.length <= 100
        && CATEGORIAS.includes(corpo.categoria)
        && numeroValido(corpo.consumoEnergia)
        && numeroValido(corpo.consumoAgua)

}



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

            title: "Início",

            pagina: "inicio",

            consumos: consumos,

            totalAgua: totalAgua,

            totalEnergia: totalEnergia,

            mensagem: MENSAGENS_VALIDAS.includes(req.query.mensagem)
                ? req.query.mensagem
                : null

        })

    } catch (erro) {

        console.log("Erro ao buscar consumos:", erro)

        res.status(500).send("Erro ao carregar a página")

    }

})


// ==========================================
// /consumos (a lista de consumos fica na home)
// ==========================================

app.get("/consumos", (req, res) => {

    res.redirect("/")

})


// ==========================================
// FORMULÁRIO DE CADASTRO DE CONSUMO
// ==========================================

app.get("/consumos/cadastrar", (req, res) => {

    res.render("consumo/cadastrar", {
        title: "Novo consumo",
        pagina: "consumos"
    })

})


// ==========================================
// CADASTRAR CONSUMO
// ==========================================

app.post("/consumos/add", async (req, res) => {

    try {

        const { tipo, data, valor } = req.body

        if (!consumoValido({ tipo, data, valor })) {

            return res.status(400).send("Dados inválidos")

        }

        await Consumo.create({

            tipo: tipo,

            data: data,

            valor: valor

        })

        res.redirect("/?mensagem=cadastrado")

    } catch (erro) {

        console.log("Erro ao cadastrar consumo:", erro)

        res.status(500).send("Erro ao cadastrar consumo")

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

            return res.status(404).send("Consumo não encontrado")

        }

        res.render("consumo/editar", {
            title: "Editar consumo",
            pagina: "consumos",
            consumo: consumo
        })

    } catch (erro) {

        console.log("Erro ao buscar consumo:", erro)

        res.status(500).send("Erro ao buscar consumo")

    }

})


// ==========================================
// EDITAR CONSUMO
// ==========================================

app.post("/consumos/editar/:id", async (req, res) => {

    try {

        const id = req.params.id

        const { tipo, data, valor } = req.body

        if (!consumoValido({ tipo, data, valor })) {

            return res.status(400).send("Dados inválidos")

        }

        const consumo = await Consumo.findByPk(id)

        if (!consumo) {

            return res.status(404).send("Consumo não encontrado")

        }

        consumo.tipo = tipo

        consumo.data = data

        consumo.valor = valor

        await consumo.save()

        res.redirect("/?mensagem=editado")

    } catch (erro) {

        console.log("Erro ao editar consumo:", erro)

        res.status(500).send("Erro ao editar consumo")

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

            return res.status(404).send("Consumo não encontrado")

        }

        await consumo.destroy()

        res.redirect("/?mensagem=excluido")

    } catch (erro) {

        console.log("Erro ao excluir consumo:", erro)

        res.status(500).send("Erro ao excluir consumo")

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

            title: "Equipamentos",

            pagina: "equipamentos",

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

        if (!equipamentoValido(req.body)) {

            return res.status(400).send("Dados inválidos")

        }

        await Eletrodomestico.create({

            nome: req.body.nome.trim(),

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

        if (!equipamentoEditar) {

            return res.status(404).send("Equipamento não encontrado.")

        }

        res.render("eletrodomesticos", {

            title: "Editar equipamento",

            pagina: "equipamentos",

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

        if (!equipamentoValido(req.body)) {

            return res.status(400).send("Dados inválidos")

        }

        await Eletrodomestico.update({

            nome: req.body.nome.trim(),

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

            title: "Equipamentos ocultos",

            pagina: "equipamentos",

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
// /equipamentos (antiga página por usuário)
// ==========================================

app.get("/equipamentos", (req, res) => {

    res.redirect("/eletrodomesticos")

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

        console.log("Erro ao preparar o banco de dados:")

        throw erro

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