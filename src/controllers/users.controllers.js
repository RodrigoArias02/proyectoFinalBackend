import { UserServices } from "../service/user.service.js";
import { UserDocument } from "../DTO/usersDTO.js";
import { submitEmail } from "../mails/mail.js";

export class UsersControllers {
  static async adminUser(req, res) {
    res.setHeader("Content-Type", "text/html");
    const email = req.session.usuario.email
    let users = await UserServices.getUsersService()
    users = users.playload
    users = users.filter(user => user.email !== email);
    users = users.map(user => {
      return {
        id:user._id,
        email: user.email,
        rol: user.rol
      };
    });


    const usersCadena=JSON.stringify(users);
    res.status(200).render("adminUsers", { users, usersCadena });
  }
  static async uploadDocuments(req, res, next) {
    res.setHeader("Content-Type", "application/json");
    let idUser = req.params.uid
    const reference = req.file.filename
    const name = req.body.name
    const document = new UserDocument(reference, name);

    let resp = await UserServices.uploadDocumentsUserService(idUser, document)

    return res.status(200).json({})
  }

  static async updateRol(req, res) {
    try {
      res.setHeader("Content-Type", "application/json");
      const uid = req.params.uid;
      const { identificacion, comprobanteDeEstadoDeCuenta, comprobanteDomicilio } = req.body
      let rol;

      let usuario = await UserServices.searchUserIdService(uid);

      if (usuario.rol == "usuario") {
        if (!identificacion || !comprobanteDomicilio || !comprobanteDeEstadoDeCuenta) {
          // Si alguno de los valores es false, retornar un valor indicando que la validación ha fallado
          return res.status(400).json({ error: "Uno o más documentos requeridos están faltantes o no son válidos." });
        }
        rol = "premium";
      } else if (usuario.rol == "premium") {
        rol = "usuario";
      } else {
        return res
          .status(404)
          .json({ error: "el rol de este usuario no se puede cambiar." });
      }
      let usuarioModificado = {
        ...usuario,
        rol,
      };
      let respuesta = await UserServices.updateUserService(
        usuario.email,
        usuarioModificado
      );
      return res.status(201).json(respuesta );
    } catch (error) { }
  }

  static async getUsers(req, res) {
    res.setHeader("Content-Type", "application/json");

    const respuesta = await UserServices.getUsersService()

    const users = respuesta.playload.map(user => ({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      rol: user.rol
    }));

   
    return res.status(respuesta.status).json({ users })
  }

  static async deleteUser(req, res) {
    res.setHeader("Content-Type", "application/json");
    let email = req.params.email

    const usuarioEliminado = await UserServices.deleteUserService(email)


    return res.status(usuarioEliminado.status).json(usuarioEliminado)
  }

  static async deleteUsersInactivity(req, res) {
    res.setHeader("Content-Type", "application/json");
    const { emailsInactivity, result } = await UserServices.deleteUserInactivityService()

    if (result.deletedCount > 0) {
      for (const user of emailsInactivity) {
        let mensaje = `Su usuario con email ${user.email} fue eliminado por inactividad`;
        let respuesta = await submitEmail(user.email, "Usuario Ecommerce eliminado", mensaje);

      }
    }
    return res.status(200).json({ emailsInactivity })
  }

}
