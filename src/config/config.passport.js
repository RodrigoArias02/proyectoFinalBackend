import passport from "passport";
import local from "passport-local";
import { crearHash, validPassword } from "../utils.js";
import github from "passport-github2";
import { UserSave } from "../DTO/usersDTO.js";
import { UserServices } from "../service/user.service.js";
import { configVar } from "./config.js";
import { CartServices } from "../service/cart.service.js";

export const initializarPassport = () => {
  passport.use(
    "registro",
    new local.Strategy(
      {
        passReqToCallback: true,
        usernameField: "email", // Aquí estás configurando que el campo de usuario es el correo electrónico
      },
      async (req, username, password, done) => {
        try {
          let usuario = req.body;

          console.log(usuario)
      
       
          let {first_name,last_name,age,password} = req.body;
          if (
            !first_name ||
            !last_name ||
            !age ||
            !username ||
            !password
          ) {
        
            return done(null, false);
          }

          let {playload,status, error}= await UserServices.getByEmail(username)
      
        console.log(status)
          if (status==200) {
            console.log(error)
            return done(null, false);
          }
          let obtenerCart=await CartServices.createCartService()
          usuario.cartId=obtenerCart.producto._id
          console.log(usuario)
          let usuarioMongo;

          try {
            let passwordHash = crearHash(password);

            usuario.password=passwordHash
            usuario=new UserSave(usuario)

            usuarioMongo= await UserServices.createUserService(usuario)
            
            return done(null, usuarioMongo);
          } catch (error) {
            return done(error);
          }
        } catch (error) {
          
          return done(error);
        }
      }
    )
  );
  passport.use(
    "login",
    new local.Strategy(
      {
        usernameField: "email",
      },
      async (username, password, done) => {
       

        try {
          if (!username || !password) {
           
            // return res.redirect('/login?error=Complete todos los datos')
            return done(null, false);
          }
          let {playload,status}= await UserServices.getByEmail(username)
          if (status!=200) {
          
            // return res.redirect(`/login?error=credenciales incorrectas`)
            return done(null, false);
          }
          if (!validPassword(playload, password)) {
           
            // return res.redirect(`/login?error=credenciales incorrectas`)
            return done(null, false);
          }

          delete playload.password;
          if(playload){
          return done(null, playload);

          }else{
           
            return done(null, false);
          }
          // previo a devolver un usuario con done, passport graba en la req, una propiedad
          // user, con los datos del usuario. Luego podré hacer req.user
        } catch (error) {
       
          done(error, null);
        }
      }
    )
  );
  passport.use(
    "github",
    new github.Strategy(
      {
        clientID: configVar.CLIENTIDGITHUB,
        clientSecret: configVar.CLIENTSECRETGITHUB,
        callbackURL: "http://localhost:3000/api/sessions/callbackGithub",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {

          let {playload,status}= await UserServices.getByEmail(profile._json.email)
  
          if (status!=200) {
        
            return done(null, false);
          }

          return done(null, playload);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  //configurar serializador y deserializador
  passport.serializeUser((usuario, done) => {

    if(usuario.email){
    return done(null, usuario.email); // Utiliza el correo electrónico como identificador único
    }
  });

  passport.deserializeUser(async (email, done) => {
    try {
      if(email){
      const {playload,status}= await UserServices.getByEmail(email)
      return done(null, playload);}
    } catch (error) {
      done(error);
    }
  });
};
