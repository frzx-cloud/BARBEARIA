// npm init
//np, i express
const express = require("express")
const app = express()
const port = 3000
app.use(express.json())

//npm i mysql2
const db = require("./db")

//npm i bcrypt
const bcrypt = require("bcrypt")


//AQUI FAZEMOS AS OPERACOES DO BD
app.post("/Cliente", async (req, res) => {
    try{
        const dados = req.body
        const senhaCrypt = bcrypt.hashSync(dados.senha, 10)
        dados.senha = senhaCrypt

        const resultado = await db.pool.query(`
        INSERT INTO Cliente(
            nome, cpf, senha, celular, email
          ) VALUES(?, ?, ?, ?, ?);`,
          [dados.nome, dados.cpf, dados.senha, dados.celular, dados.email]
        )
        res.status(201).json({mensagem: "Cliente cadastrado, id = " + resultado[0].insertId})

    } catch (error) {
        res.status(500).json({erro: error.message})
    }
})

app.post("/login", async (req,res) => {
    try {
        const user = req.body
        const resultado = await db.pool.query(
            "SELECT id, nome, email, senha FROM Cliente WHERE email = ?", [user.email]
        )
        const dados_bd = resultado[0][0]
        if(!dados_bd) {
            return res.status(401).json({msg: "Email não cadastrado!"})
        }

        const senha_valida = await bcrypt.compare(user.senha, dados_bd.senha)

        if(!senha_valida) {
            return res.status(401).json({msg: "Credenciais inválidas!"})
        }

        const payload = {
            id: dados_bd.id,
            email: dados_bd.email
        } 
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1m' })
        return res.status(200).json({nome: dados_bd.nome, token: token})

    } catch (error) {
        res.status(500).json({erro: error.message})
    }
})
app.get("/Cliente", async (req , res)=>{
    try {
        const [clientes] = await db.pool.query(`
        SELECT id, nome, cpf, celular, email
        FROM Cliente
    `)

    res.status(200).json(clientes)

    } catch (error) {
        res.status(500).json({erro: error.message})
    }
})

app.get("/Cliente/perfil", autenticar, async (req, res) => {
    try {

        const id = req.params.id

        const [clientes] = await db.pool.query(`
            SELECT * FROM cliente WHERE id = ?`, [id])

        if (clientes.length === 0) {
            return res.status(404).json({
                mensagem: "Cliente não encontrado"
            })
        }
        const cliente = resultado[0][0]
        delete cliente.senha
        res.status(500).json

        res.status(200).json(clientes[0])

    } catch (error) {
        res.status(500).json({
            erro: error.message
        })
    }
})

app.delete("/Cliente/:id", async (req, res) => {
    try {

        const id = req.params.id

        const [resultado] = await db.pool.query(`
            DELETE FROM Cliente
            WHERE id = ?
        `, [id])

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Cliente não encontrado"
            })
        }

        res.status(200).json({
            mensagem: "Cliente excluído com sucesso"
        })

    } catch (error) {
        res.status(500).json({
            erro: error.message
        })
    }
})


app.put("/Cliente/:id", async (req, res) => {
    try {

        const id = req.params.id
        const dados = req.body

        const [resultado] = await db.pool.query(`
            UPDATE Cliente
            SET nome = ?,
                cpf = ?,
                celular = ?,
                email = ?
            WHERE id = ?
        `, [
            dados.nome,
            dados.cpf,
            dados.celular,
            dados.email,
            id
        ])

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Cliente não encontrado"
            })
        }

        res.status(200).json({
            mensagem: "Cliente alterado com sucesso"
        })

    } catch (error) {
        res.status(500).json({
            erro: error.message
        })
    }
})




function autenticar(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null){
        return res.status(401).json({erro: "Token não enviado, usar Authorization Bearer <token>"})
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
        if (err) return res.status(403).json({erro: "Token inválido"})
        req.usuario = usuario
        next()
    })   
}
app.listen(port, () => {
    console.log("API rodando na porta "+ port)
})

//colocar arquivo .env na prox aula
