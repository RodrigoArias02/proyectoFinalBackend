import UserModelo from "../models/user.model.js";
import moment from "moment";
export class ManagerUsersMongoDB {
  async createUser(usuarios) {
    try {
      let usuario = await UserModelo.create(usuarios);
      return usuario;
    } catch (error) {
      return error;
    }
  }
  async getUsers(){
    try {
        const existe = await UserModelo.find().lean();
        return existe
    } catch (error) {
        return error
    }
  }
  async searchUserEmail(email){
    try {
        const existe = await UserModelo.findOne({ email }).lean();

        return {playload:existe}
    } catch (error) {
        return error
    }
  }

  async searchUseriId(id){

    try {
        const existe = await UserModelo.findOne({ _id:id }).lean();
        return existe
    } catch (error) {
        return error
    }
  }

  async searchCartUsed(idCart){
    try {
     
      const existe = await UserModelo.findOne({ cartId:idCart }).lean();
  
      return existe
  } catch (error) {
      return error
  }
  }

  async updateUser(email,user){
    try {
      let result = await UserModelo.updateOne(
        { email },
        {  $set:user }
      );

      // Verificar si se actualizó correctamente
      if (result.modifiedCount === 1) {
      
        return { status: 200, message: "Documento actualizado con éxito" };
      } else {
    
        return {
          status: 404,
          error: "No se encontró el documento o no hubo cambios",
        };
      }
    } catch (error) {

      return null;
    }
  }
  async updateLastConnection(email){
    try {
        let result = await UserModelo.updateOne(
          { email },
          { $set: { last_connection: new Date() } }
      );
        return result
    } catch (error) {
  
      return error;
    }
  }
  async uploadDocumentsUser(idUser,documents){
    try {
      let result = await UserModelo.updateOne(
        { _id:idUser },
        { $set: { documents: documents } }
    );
      return result
  } catch (error) {

    return null;
  }
  }
  async deleteUser(email) {
    try {
      const result = await UserModelo.deleteOne({email});
      return result
    } catch (error) {

      return {
        status: 500,
        message: "Error interno al intentar eliminar el usuario.",
      };
    }
  }
  async deleteUserInactivity() {
    try {
      const twoDaysAgo = moment().subtract(2, 'days').toDate();

      const emailsInactivity= await UserModelo.find({ last_connection: { $lt: twoDaysAgo } },{ email: 1, _id: 0 })
      
      const result = await UserModelo.deleteMany({ last_connection: { $lt: twoDaysAgo } });

      return {emailsInactivity,result, status:200 }
    } catch (error) {
     
      return {
        status: 500,
        message: "Error interno al intentar eliminar el usuario.",
      };
    }
  }
}
