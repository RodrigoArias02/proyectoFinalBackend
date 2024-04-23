import express from "express";
import mongoose from "mongoose";
import { engine } from "express-handlebars";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Server } from "socket.io";
import session from "express-session";
import MongoStore from "connect-mongo";
import { initializarPassport } from "./config/config.passport.js";
import passport from "passport";
import { configVar } from "./config/config.js";
import { middlog } from "./utilsErrors/loggers.js";
import swaggerJSDoc from "swagger-jsdoc";
import SwaggerUi from "swagger-ui-express";
// import ProductManager from './functions/functionProducts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// let ruta = join(__dirname, "archives", "products.json");
const app = express();
const PORT = configVar.PORT;
const options={
  definition:{
    openapi:"3.0.0",
    info:{
      title:"API Abm Usuarios",
      version:"1.0.0",
      description:"Documentacion API abm users"
    }
  },
  apis:["./docs/*yaml"]
}

const specs=swaggerJSDoc(options)
// Configuración del motor de vistas

app.engine(
  "handlebars",
  engine({
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodssByDefault: true,
    },
  })
);

app.use(
  session({
    secret: configVar.SECRETSESSION,
    resave:true,
    saveUninitialized:true,
    store: MongoStore.create({
      mongoUrl:configVar.MONGO_URL,
      mongoOptions:{dbName:configVar.DBNAME},
      ttl:3600
    })
  })
);

app.set("view engine", "handlebars");
app.set("views", join(__dirname, "views"));
// Middleware
app.use(middlog)
app.use("/api-docs", SwaggerUi.serve, SwaggerUi.setup(specs))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, "./public")));
initializarPassport()
app.use(passport.initialize())
app.use(passport.session())


// Rutas
import routerProducts from "./routes/productsRoutes.js";
import routerCart from "./routes/cartRoutes.js";
import routerViews from "./routes/viewsRoutes.js";
import routerChat from "./routes/chatRoutes.js";
import routerSessions from "./routes/sessionsRoutes.js";
import routerUsers from "./routes/usersRouter.js";
import { ErrorSearchRouter, errorHandler, errorLoggers } from "./middlewares/errorHandler.js";

app.use("/api/products", routerProducts);
app.use("/api/carts", routerCart);
app.use("/", routerViews);
app.use("/chat", routerChat);
app.use("/api/sessions", routerSessions);
app.use("/api/users", routerUsers);
// Define una ruta que renderizará tu archivo main.handlebars

app.use(errorHandler);
app.use(errorLoggers)
app.use(ErrorSearchRouter)



// Iniciar servidor
let serverHttp = app.listen(PORT, () => {
  console.log("Servidor iniciado en el puerto:", PORT);
});

export const io = new Server(serverHttp);

io.on("connection", (socket) => {
  console.log(`Se conecto el cliente ${socket.id}`);
});
try {
  await mongoose.connect(
    configVar.MONGO_URL,
    { dbName: configVar.DBNAME }
  );
} catch (error) {
  console.log(error); req.logger.http("HTTP message");
}
