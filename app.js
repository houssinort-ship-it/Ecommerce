const express=require('express');
const mongoose =require("mongoose")
const dotenv =require('dotenv')
const cors = require('cors')
const app = express();
app.use(express.json());
const categorieRouter =require("./routes/categorie.route")
app.use('/api/categories', categorieRouter);
//config dotenv
dotenv.config()
//Les cors
app.use(cors())
//BodyParser Middleware
// Connexion à la base données
mongoose.connect(process.env.DATABASE_CLOUD)
.then(() => {console.log("DataBase Successfully Connected");})
.catch(err => { console.log("Unable to connect to database", err);
process.exit(); });
// requête
app.get("/",(req,res)=>{
res.send("bonjour");
});
app.listen(process.env.PORT, () => {
console.log(`Server is listening on port ${process.env.PORT}`); });
module.exports = app;
