import express from "express";
import { SessionControllers } from "../controllers/sessions.controllers.js";
import { ProductsControllers } from "../controllers/products.controllers.js";
import { CartsControllers } from "../controllers/carts.controllers.js";
import { OthersControllers } from "../controllers/other.controllers.js";
import { UsersControllers } from "../controllers/users.controllers.js";

const router = express();

const auth=(req,res,next)=>{
  if(!req.session.usuario){
   
    return res.redirect("/login?error=Su sesion expiro, ingrese nuevamente")
  }
  next()
}
const authAdmin=(req,res,next)=>{
  if(req.session.usuario.rol=="admin"){
    res.redirect("/perfil?error=Usted no tiene el rol indicado para ingresar a dicha seccion")
    return
  }
  next()
}
const authUser=(req,res,next)=>{
  if(req.session.usuario.rol=="usuario"){
    res.redirect("/perfil?error=Usted no tiene el rol indicado para ingresar a dicha seccion")
    return
  }
  next()
}
const authAdministrator=(req,res,next)=>{
  if(req.session.usuario.rol!="admin"){
    res.redirect("/perfil?error=Usted no tiene el rol indicado para ingresar a dicha seccion")
    return
  }
  next()
}
// Ruta principal
router.get("/", ProductsControllers.home);

router.get("/ingresarProductos",auth ,authUser, ProductsControllers.renderCreateProducts);

router.get("/productos", auth, authAdmin ,ProductsControllers.loadProducts);

router.get("/carts/:cid", CartsControllers.renderCart );

router.get("/chat",auth ,authAdmin ,OthersControllers.renderChat );

router.get("/admin",auth, authAdministrator, UsersControllers.adminUser);

router.get("/login", SessionControllers.renderLoginUser);

router.get("/registro", SessionControllers.renderRegisterUser);
 
router.get("/perfil", auth, OthersControllers.renderProfile)

router.get("/recupero01", OthersControllers.renderEmail01)

router.get("/recupero02", OthersControllers.renderEmail02)

router.get("/logger", OthersControllers.loggerTest)
export default router;
