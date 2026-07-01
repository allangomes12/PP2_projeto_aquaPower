const express = require("express");
const exphbs = require("express-handlebars");
const sequelize = require("./config/bd");
const Usuario = require('./models/Usuario');
const port = 3000;
const app = express();

app.use(express.static('public'));
app.engine('handlebars', exphbs.engine({defaultLayout: false}));
app.set('view engine', 'handlebars');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) =>{
    res.send("Pagina inicial")
})
app.get('/usuarios/cadastrar', async (req, res) => {
    res.render('cadastrar');
});

app.post('/usuarios/add', async (req, res) => {
    const { nome, email, senha } = req.body;
    await Usuario.create({
        nome,
        email,
        senha
    });
    res.redirect("/"); 
});

app.get('/usuarios', async (req, res) => {
    const usuarios = await Usuario.findAll({
        raw: true
    });
    res.render('usuarios', {
        usuarios
    });
});

app.get('/usuarios/editar/:id', async (req, res) => {
    const id = req.params.id;
    const usuario = await Usuario.findByPk(id, {
        raw: true
    });

    res.render('editar', {
        usuario
    });
});

app.post('/usuarios/update', async (req, res) => {

    const { id, nome, email, senha } = req.body;

    await Usuario.update(
        {
            nome,
            email,
            senha
        },
        {
            where: {
                id
            }
        }
    );

    res.redirect('/usuarios');
});

app.post('/usuarios/delete/:id', async (req, res) => {

    const id = req.params.id;

    await Usuario.destroy({
        where: {
            id
        }
    });

    res.redirect('/usuarios/cadastrar');
});

app.listen(port, () =>{
    console.log("Servidor ok")
})

async function conectarBD() {
  try {
    await sequelize.sync();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
  } catch (erro) {
    console.error('Erro ao conectar:', erro);
  }
}

conectarBD();