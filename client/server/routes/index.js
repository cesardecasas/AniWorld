const express = require('express')
const router = express.Router()

router.get('/response',(req,res)=>{
    res.end('I did it')
})


module.exports = router