import express from "express";
import { UsersControllers } from "../controllers/users.controllers.js";
import { upload } from "../utils.js";
const router = express();

router.get("/" ,UsersControllers.getUsers);

router.put("/premium/:uid" ,UsersControllers.updateRol);

router.delete("/:email" ,UsersControllers.deleteUser);

router.delete("/" ,UsersControllers.deleteUsersInactivity);

// si se quiere guardar la imagen en profiles se cambia el nombre de products(el name de input file debe tener el mismo nombre que el single)
router.post("/:uid/documents",upload.single('products') ,UsersControllers.uploadDocuments);
export default router;
