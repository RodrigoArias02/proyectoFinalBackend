import { ManagerUsersMongoDB as DAO } from "../dao/classMongo/managerUsersMongo.js";

class UserService {
  constructor(dao) {
    this.dao = new dao();
  }
  async createUserService(usuarios) {
    return await this.dao.createUser(usuarios);
  }
  async getUsersService(){
    const respuesta = await this.dao.getUsers();

    if(!respuesta){
      return {status:404, error:"No se encontraron usuarios"}
    }

    return {status:200, playload:respuesta}
  }
  async getByEmail(email) {
    const {status, playload,error} = await this.dao.searchUserEmail(email);

    if(status!=200){
      return {status, error:`algo salio mal: ${error}`}
    }
    if(!playload){
      return {status:404, error:"No se encontro el usuario"}
    }

    return {status, playload} 
  }
  async searchUserIdService(id) {
    return await this.dao.searchUseriId(id);
  }
  async searchCartUsedService(cartId) {
    return await this.dao.searchCartUsed(cartId);
  }

  async updateUserService(email, user) {
    return await this.dao.updateUser(email, user);
  }

  async uploadDocumentsUserService(idUser,document){

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
    let result = await this.dao.deleteUser(email);
    if (result.status) {
    
      return {
        status: 500,
        error: "Error interno al intentar eliminar el usuario.",
      };
    }
    
    if(result.deletedCount === 0){
      return { status: 404, error: "No se encontro el usuario" };
    }
    // Verificar si se eliminó correctamente
    if (result.deletedCount === 1) {
      return { status: 201, message: "Usuario eliminado con éxito." };
    } else {
      return {
        status: 404,
        error: "No se encontró el usuario con el ID proporcionado.",
      };
    }
  }
  async updateLastConnectionService(email) {
    let result = await this.dao.updateLastConnection(email);
    // Verificar si se actualizó correctamente
    
    if (result.modifiedCount > 0) {
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
      console.error("Error al eliminar los usuario:", error);
      return {
        status: 500,
        error: "Error interno al intentar eliminar el usuario.",
      };
    }
  }
}


export const UserServices = new UserService(DAO);
