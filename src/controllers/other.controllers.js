import moment from "moment";
import { io } from "../app.js";
import { ChatServices } from "../service/chat.service.js";
function formatearHora(messages) {
  messages.map((message) => {
    message.formattedCreatedAt = moment(message.createdAt).format("HH:mm");
    return message;
  });
  return messages;
}

export class OthersControllers {
  static async renderChat(req, res) {
    try {
      const login = req.session.usuario;
      let validarAdmin
      if(login){
         validarAdmin=login.rol=="admin"?true:false
      }
      let messages = await ChatServices.loadChatService();

      // Formatear la hora de cada mensaje antes de pasarlos a la plantilla
      messages = formatearHora(messages);
      res.setHeader("Content-Type", "text/html");
      return res.status(200).render("chat", { messages,login,validarAdmin });
    } catch (error) {
      
      return res.status(500).send("Error interno del servidor");
    }
  }

  static async renderProfile(req, res) {
    res.setHeader("Content-Type", "text/html");
    const { error } = req.query;
    const login = req.session.usuario;
    let validarAdmin
    if(login){
       validarAdmin=login.rol=="admin"?true:false
    }
    return res.status(200).render("perfil", {login, error,validarAdmin });
  }

  static async postChatSendMessage(req, res) {
    res.setHeader("Content-Type", "application/json");

    const checkTypes = (value, type) => typeof value === type;
    let { user, message } = req.body;

    let OK = checkTypes(user, "string") && checkTypes(message, "string");

    if (OK) {
      const estado = await ChatServices.saveMessagesService(user, message);
      const time = moment().format("HH:mm"); // Mover la declaración de 'time' aquí


      if (estado.status === 201) {
        io.emit("nuevoMensaje", user, message, time);
        return res.status(201).json(estado);
      } else {
        req.logger.error(estado.error);
        return res.status(estado.status).json(estado);
      }
    } else {
      req.logger.warning("El valor de algunos de los campos no es admitido");
        return res.status(400).json({error: "El valor de algunos de los campos no es admitido" });
    }
  }




  static async renderEmail01(req, res, next) {
    try {
      let {message,error}=req.query

      return res.status(200).render("mail/recuperoEmail01",{message,error});
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Ha ocurrido un error en el servidor" });
    }
  }

  static async renderEmail02(req, res, next) {
    let {token,error}=req.query
    try {

      if(!token){
        return res.status(400).json({ error: "Token invalido" });
      }
      return res.status(200).render("mail/recoverEmail02",{token,error});
    } catch (error) {
      return res.status(500).json({ error: "Ha ocurrido un error en el servidor" });
    }
  }
}
