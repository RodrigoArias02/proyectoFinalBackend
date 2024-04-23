import { ManagerUsersMongoDB as DAO } from "../dao/classMongo/managerUsersMongo.js";
import { CartServices } from "./cart.service.js";
import mongoose from "mongoose";
class UserService {
  constructor(dao) {
    this.dao = new dao();
  }
  async createUserService(usuarios) {
    const respuesta = await this.dao.createUser(usuarios);
    if(respuesta.error){
      return {status:500, error:`Algo salio mal ${error}`}
    }
    return {status:200, payload:respuesta}
  }
  async getUsersService(){
    const respuesta = await this.dao.getUsers();

    if(!respuesta){
      return {status:404, error:"No se encontraron usuarios"}
    }

    return {status:200, playload:respuesta}
  }
  async getByEmail(email) {
  
    const {playload, error} = await this.dao.searchUserEmail(email);


    if(error){
      return {status:500, error:`Algo salio mal ${error}`}
    }
    if(playload==null){
      return {status:404, error:`No se enconetro el usuario`}
    }


    return {status:200, playload} 
  }
  async searchUserIdService(id) {
    const idValido = mongoose.Types.ObjectId.isValid(id);
    if (!idValido) {
      return { status: 400, error: "El id no cumple las caracteristicas de id tipo mongoDB" }
    }
    return await this.dao.searchUseriId(id);
  }
  async searchCartUsedService(cartId) {
    const idValido = mongoose.Types.ObjectId.isValid(cartId);
    if (!idValido) {
      return { status: 400, error: "El id no cumple las caracteristicas de id tipo mongoDB" }
    }
    return await this.dao.searchCartUsed(cartId);
  }

  async updateUserService(email, user) {
    
    return await this.dao.updateUser(email, user);
  }

  async uploadDocumentsUserService(idUser,document){
    const idValido = mongoose.Types.ObjectId.isValid(idUser);
    if (!idValido) {
      return { status: 400, error: "El id no cumple las caracteristicas de id tipo mongoDB" }
    }
    const user = await this.searchUserIdService(idUser)

    const documents=user.documents

    documents.push(document)

  
    const result = await this.dao.uploadDocumentsUser(idUser,documents)

    if (result.modifiedCount === 1) {
     
      return { status: 200, message: "Documento actualizado con éxito" };
    } else {
 
      return {
        status: 404,
        error: "No se encontró el documento o no hubo cambios",
      };
    }

  }

  async deleteUserService(email) {
    let usuario= await this.getByEmail(email)

    if(usuario.status!=200){
     
      return usuario
    }
    const idcart= usuario.playload.cartId
    const eliminarCarrito= await CartServices.deleteCartService(idcart)


    if(eliminarCarrito.status!=201){
      return eliminarCarrito
    }
    let result = await this.dao.deleteUser(email);
   
    if (result.deletedCount==1) {
      return { status: 201, message: "Usuario eliminado con éxito." };
    }
    if(result.deletedCount === 0){
      return { status: 404, error: "No se encontro el usuario" };
    }
    if(result.acknowledged==false){
      return {
        status: 500,
        error: "Error interno al intentar eliminar el usuario.",
      };
    }

    
    
  }
  async updateLastConnectionService(email) {
    let {modifiedCount,error} = await this.dao.updateLastConnection(email);
    // Verificar si se actualizó correctamente
  
    if(error){
      return{status:500, error:`algo salio mal ${error}`}
    }
    if (modifiedCount > 0) {
      return { success: true, message: "Última conexión actualizada exitosamente." };
  } else {
      return { success: false, message: "No se encontró ningún usuario con el correo electrónico proporcionado." };
  }
  }

  async deleteUserInactivityService() {
    try {
      const {emailsInactivity,result,status} = await this.dao.deleteUserInactivity();

      if(status!=200){
        return {status,error: "Error interno al intentar eliminar el usuario.",};
      }
      if(result.deletedCount==0){
        return {status:404, error:"No se encontraron usuarios inactivos"}
      }
      return {emailsInactivity,result}
    } catch (error) {
  
      return {
        status: 500,
        error: "Error interno al intentar eliminar el usuario.",
      };
    }
  }
}


export const UserServices = new UserService(DAO);
