const express = require('express')
const next = require('next')
const cors = require('cors')
const bodyParser = require('body-parser')

const PORT = process.env.PORT || 3000
const dev =  process.env.NODE_ENV !== 'production'
const app = next({dev})
const handle = app.getRequestHandler()

app
    .prepare().then(()=>{
        const server = express()
        const routes = require('./routes/index')

        server.use(cors())
        server.use(bodyParser.json())
        server.use(bodyParser.urlencoded({ extended: true }))
        server.disable('X-Powered-By')

        server.get('*', (req,res)=>{
            return handle(req,res)
        })

        server.use('/api', routes)
        server.get('/h', (req, res) => res.json({ message: 'Server Works x2' }))


        server.get('/hello', (req,res)=>{
            res.send({
                hello:'world'
            })
        })


        server.listen(PORT, err =>{
            if(err){throw(err)}
            console.log(`> Ready to start on ${PORT}`)
            console.log(server)

        })


    }).catch(ex =>{
        console.log(ex.stack)
        process.exit(1)
    })