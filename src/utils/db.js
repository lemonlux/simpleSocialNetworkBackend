const dotenv = require ("dotenv")
dotenv.config()
const mongoose = require("mongoose")

const MONGO_URI = process.env.MONGO_URI

const connect = async () =>{
    try {
        const db = await mongoose.connect(MONGO_URI)
        const { name, host } = db.connection
        console.log(`Conectada la DB con el host ${host} con el nombre ${name} ✅`)
        
    } catch (error) {
        console.log(`Error en la conexión con la DB ❌`, error)
    }
}

module.exports = connect