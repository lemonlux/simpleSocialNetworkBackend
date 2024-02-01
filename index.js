//!----- IMPORTACIONES

const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

//!------ CONEXION A LA DB

const connect = require("./src/utils/db");
connect();


//!------ CONEXION CON CLOUDINARY
const { configCloudinary } = require("./src/middleware/files.middleware");
configCloudinary();


//!------  VARIABLES CONSTANTES -- PORT

const PORT = process.env.PORT;

//!------ SERVIDOR WEB Y CORS

const app = express();
const cors = require("cors");
app.use(cors());

//!------- LIMITES JSON 

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: false }));


//!------- RUTAS

const ChatRoutes = require('./src/api/routes/Chat.routes');
app.use("/api/v1/chat/", ChatRoutes)

const CommentRoutes = require('./src/api/routes/Comment.routes');
app.use("/api/v1/comment/", CommentRoutes)

const PostRoutes = require('./src/api/routes/Post.routes');
app.use("/api/v1/post/", PostRoutes)

const UserRoutes = require('./src/api/routes/User.routes');
app.use("/api/v1/user/", UserRoutes)


//!------ ERRORES DE RUTA INCORRECTA Y CRASH DEL SERVIDOR

app.use("*", (req, res, next) => {
    const error = new Error("Route not found");
    error.status = 404;
    return next(error);
  });
  
  app.use((error, req, res) => {
    return res
      .status(error.status || 500)
      .json(error.message || "unexpected error");
  });
  

  //!------ ESCUCHAMOS EL PUERTO DEL SERVIDOR WEB

app.disable("x-powered-by");
app.listen(PORT, () =>
  console.log(`💻 Server listening on port 📍 http://localhost:${PORT}`)
);
