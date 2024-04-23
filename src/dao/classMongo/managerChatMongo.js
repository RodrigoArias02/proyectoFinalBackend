import chatModelo from "../models/chat.modelo.js";
export class ManagerChatMongoDB {
    async loadChat() {
        try {
            let data= await chatModelo.find();
            return data
        } catch (error) {

            return null
        }
    }

    async saveMessages(user,message){
        try {
            let newMessage = chatModelo.create({user,message})
            
            return { status: 201, message:"peticion realizada con exito", message:newMessage};
            
        } catch (error) {
 
            return { status: 400, error: "Error al añadir el producto a la BD" };
        } 
    }
    

}





