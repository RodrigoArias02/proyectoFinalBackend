import express from "express";
import passport from "passport";
import { SessionControllers } from "../controllers/sessions.controllers.js";
const router = express();

router.get('/errorLogin', SessionControllers.errorLogin)
router.get("/errorRegistro", SessionControllers.errorRegister)
router.get('/errorGithub', SessionControllers.errorGithub);
//Luego cambiar current por login ↓↓↓

router.post("/current", passport.authenticate('login', {failureRedirect:'/api/sessions/errorLogin'}), SessionControllers.authenticateUser);

router.get('/callbackGithub', passport.authenticate('github',{failureRedirect:"/api/sessions/errorGithub"}), SessionControllers.authenticateUserGithub);

router.post("/registro", passport.authenticate('registro', {failureRedirect:'/api/sessions/errorRegistro'}), SessionControllers.authenticateRegisterUser);

router.get('/github', passport.authenticate('github',{}), (req,res)=>{})

router.get("/logout", SessionControllers.logout);

router.post("/recupero01", SessionControllers.recoverEmail)

router.get("/recupero02", SessionControllers.recoverEmail02)

router.post("/recupero03", SessionControllers.recoverEmail03)


export default router;
