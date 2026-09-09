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

app.post("/login",async (req, res) => {
    try{
    const user = req.body
    const resultado = await db.pool.query(`
        SELECT email , senha FROM Cliente WHERE email =  ?`,
          [user.email]
    )
    const dados_db = resultado[0][0]

    if(!dados_db) {
        return res.status(401).json({mensagem: "Email ou senha inválido!"})
    }
    const senhaValida = bcrypt.compare(user.senha, dados_db.senha)
    if (senhaValida){}
    if (user.senha == dados_db.senha){
        return res.status(200).json({mensagem:"Login realizado com sucesso!"})
    } else{
        return res.status(401).json({mensagem:"Email ou senha inválido!"})
    }
    } catch (error) {
        res.status(500).json({erro: error.message})
    }})

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

app.get("/Cliente/:id", async (req, res) => {
    try {

        const id = req.params.id

        const [clientes] = await db.pool.query(`
            SELECT id, nome, cpf, celular, email
            FROM Cliente
            WHERE id = ?
        `, [id])

        if (clientes.length === 0) {
            return res.status(404).json({
                mensagem: "Cliente não encontrado"
            })
        }

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


app.listen(port, () => {
    console.log("API rodando na porta "+ port)
})