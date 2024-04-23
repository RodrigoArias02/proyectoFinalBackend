import mongoose from "mongoose";
import { UserServices } from "../service/user.service.js";
import { submitEmail } from "../mails/mail.js";
import { ProductServices } from "../service/product.service.js";
import { ProductRead } from "../DTO/productsDTO.js";
import { validTypeData, validateProperties } from "../utils.js";
import { STATUS_CODES, ERRORES_INTERNOS } from "../utilsErrors/typesErrors.js";
import {errorArgumentos,errorId,errorPeticion,errorTipoValores,errrorPermisos,} from "../utilsErrors/errors.js";
import { CustomError } from "../utilsErrors/customErrors.js";
import { io } from "../app.js";
import { configVar } from "../config/config.js";
export class ProductsControllers {
  static async home(req, res, next) {
    res.setHeader("Content-Type", "text/html");
    let categoria;
    let productos;
    let direccion;
    let validarAdmin=false;
    let pagina;
    let login = req.session.usuario
  
    if(login){
       validarAdmin=login.rol=="admin"?true:false
    }
    

    if (req.query.category) {
      categoria = req.query.category;
    }
    if (req.query.pagina) {
      pagina = req.query.pagina;
    } else {
      pagina = 1;
    }
    if (req.query.direccion) {
      direccion = req.query.direccion;
    }

    try {
      productos = await ProductServices.listProductsAggregateService(
        categoria,
        pagina,
        direccion,
        null
      );

      if (productos.status != 200) {
        throw CustomError.createError(
          "Error al realizar la peticion",
          productos.messageError,
          STATUS_CODES.ERROR_PETICION,
          ERRORES_INTERNOS.OTROS,
          errorPeticion(productos)
        );
      }

      let {
        playload,
        totalPages,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage,
      } = productos;

      return res.status(200).render("home", {
        playload,
        hasNextPage,
        hasPrevPage,
        prevPage,
        nextPage,
        totalPages,
        categoria,
        direccion,
        pagina,
        login,
        validarAdmin,
      });
    } catch (error) {
      next(error);
    }
  }

  static async renderCreateProducts(req, res, next) {
    res.setHeader("Content-Type", "text/html");
    let login = req.session.usuario
    let email = req.session.usuario.email;
    let validarAdmin
    if(login){
       validarAdmin=login.rol=="admin"?true:false
    }

    let pagina=1
    if (req.query.pagina) {
      pagina = req.query.pagina;
    }
    let {error}=req.query
    
    try {

      let {
        status,
        playload,
        totalPages,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage,
      } = await ProductServices.listProductsAggregateService(null,pagina,null,email);
      io.emit("productos", playload);
  
      if (status != 200) {
        throw CustomError.createError(
          "Error al realizar la peticion",
          productos.messageError,
          STATUS_CODES.ERROR_PETICION,
          ERRORES_INTERNOS.OTROS,
          errorPeticion(productos)
        );
      }
    

      return res
        .status(200)
        .render("realTimesProducts", {
          productos: playload,
          login,
          email,
          error,
          hasNextPage,
          hasPrevPage,
          prevPage,
          nextPage,
          totalPages,
          validarAdmin
        });
    } catch (error) {
      next(error);
    }
  }
  //cargar productos
  static async loadProducts(req, res, next) {
    res.setHeader("Content-Type", "text/html");
    let pagina = 1;
    const login = req.session.usuario 
    let validarAdmin
    if(login){
       validarAdmin=login.rol=="admin"?true:false
    }
    const esUsuario = login.rol === "usuario" ? true : false;
    
    if (req.query.pagina) {
      pagina = req.query.pagina;
    }

    let productos;
    try {
      productos = await ProductServices.listProductsService(pagina);

      if (productos.status != 200) {
        throw CustomError.createError(
          "Error al realizar la peticion",
          productos.messageError,
          STATUS_CODES.ERROR_PETICION,
          ERRORES_INTERNOS.OTROS,
          errorPeticion(productos)
        );
      }


      let { totalPages, hasPrevPage, hasNextPage, prevPage, nextPage } =
        productos.elements;
        return res.status(200).render("productos", {
        productos: productos.elements.docs,
        hasNextPage,
        hasPrevPage,
        prevPage,
        nextPage,
        totalPages,
        esUsuario,
        login,
        validarAdmin
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProducts(req, res, next) {
    res.setHeader("Content-Type", "application/json");
    try {
      let resultado = await ProductServices.listProductsService();

      if (resultado.status != 200) {
        throw CustomError.createError(
          "Error al realizar la peticion",
          resultado.messageError,
          STATUS_CODES.ERROR_PETICION,
          ERRORES_INTERNOS.OTROS,
          errorPeticion(resultado)
        );
      }
      // Verificar si resultado.docs es un array antes de usar slice
      if (Array.isArray(resultado.elements.docs) && req.query.limit) {
        resultado.elements.docs = resultado.elements.docs.slice(
          0,
          req.query.limit
        );
      }

      // Envía la respuesta como JSON
      return res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
    next();
  }

  static async getProductId(req, res, next) {
    const productId = req.params.pid; // Obtén el id del producto de req.params
    res.setHeader("Content-Type", "application/json");
    try {
      const idValido = mongoose.Types.ObjectId.isValid(productId);
      if (!idValido) {
        throw CustomError.createError(
          "Error en el id",
          "El id no cumple las caracteristicas de id tipo mongoDB",
          STATUS_CODES.ERROR_ARGUMENTOS, 
          ERRORES_INTERNOS.ARGUMENTOS,
          errorId(idValido, productId)
        );
      }

      const { status, producto } = await ProductServices.ProductoIdService(
        productId
      );
      if (status == "200") {
        return res.status(200).json({ producto });
      } else {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
    } catch (error) {
      next(error);
    }
  }

  static async postCreateProduct(req, res, next) {
    try {
      res.setHeader("Content-Type", "application/json");
      let usuario=req.session.usuario
      let product=req.body
    
    
      if (!req.isAuthenticated()) {
    
        throw CustomError.createError(
          "Usuario no encontrado",
          "No se ha iniciado sesión. Debes iniciar sesión para realizar esta acción.",
          STATUS_CODES.ERROR_AUTORIZACION,
          ERRORES_INTERNOS.ERROR_AUTORIZACION,
          errrorPermisos(usuario)
      );
    }

      const valido = validateProperties(product);

      if (!valido) {
 
        throw CustomError.createError(
          "Error en propiedades",
          "Propiedades inválidas",
          STATUS_CODES.ERROR_ARGUMENTOS, 
          ERRORES_INTERNOS.ARGUMENTOS,
          errorArgumentos(valido, req.body)
        );
      }
      product = new ProductRead(product);
      
      const OK = validTypeData(product);

      if (OK != null) {

        throw CustomError.createError(
          "Error en tipo de datos",
          "El tipo de datos de algunos de los campos no es admitido",
          STATUS_CODES.ERROR_DATOS_ENVIADOS,
          ERRORES_INTERNOS.ARGUMENTOS,
          errorTipoValores(OK)
        );
      }

      if(usuario.rol !== "premium" && usuario.rol !== "admin"){
      
        throw CustomError.createError(
            "Permisos insuficientes",
            "No tienes permisos suficientes para subir un producto.",
            STATUS_CODES.ERROR_AUTORIZACION,
            ERRORES_INTERNOS.ERROR_AUTORIZACION,
            errrorPermisos(usuario.rol)
        );
    }
      const estado = await ProductServices.ingresarProductosService(product);

      if (estado.status != 201) {
       
        throw CustomError.createError(
          "Error al realizar la peticion",
          estado.messageError,
          STATUS_CODES.ERROR_PETICION,
          ERRORES_INTERNOS.OTROS,
          errorPeticion(estado)
        );
      }

    
      return res.redirect(`${configVar.URL}/ingresarProductos`); 
    } catch (error) {
   
      next(error);
    }
    next();
  }

  static async putUpdateProduct(req, res, next) {
    res.setHeader("Content-Type", "application/json");
    let { pid } = req.params;
    let product=req.body
    
    try {
      const idValido = mongoose.Types.ObjectId.isValid(pid);
      if (!idValido) {
        throw CustomError.createError(
          "Error en el id",
          "El id no cumple las caracteristicas de id tipo mongoDB",
          STATUS_CODES.ERROR_PETICION,
          ERRORES_INTERNOS.OTROS,
          errorId(idValido, pid)
        );
      }
      const valido = validateProperties(product);
      if (!valido) {
        throw CustomError.createError(
          "Error en propiedades",
          "Propiedades inválidas",
          STATUS_CODES.ERROR_ARGUMENTOS, 
          ERRORES_INTERNOS.ARGUMENTOS,
          errorArgumentos(valido, req.body)
        );
      }
      product= new ProductRead(product)

      const estado = await ProductServices.actualizarProductoService(
        pid,
        product
      );
    
      if (estado.status==200) {
        return res.status(200).json({ estado });
      } else {
        return res.status(400).json({ estado });
      }
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
     
      res.setHeader("Content-Type", "application/json");
      const usuario = req.session.usuario;
      let { pid } = req.params;
      let pagina=1
     
      const idValido = mongoose.Types.ObjectId.isValid(pid);
      if (!idValido) {
        throw CustomError.createError(
          "Error en el id",
          "El id no cumple las caracteristicas de id tipo mongoDB",
          STATUS_CODES.ERROR_PETICION,
          ERRORES_INTERNOS.OTROS,
          errorId(idValido, pid)
        );
      }

      const { producto } = await ProductServices.ProductoIdService(pid);
      if (usuario.rol=="usuario") {
        return res.status(403).json({status:403,error:"permisos insuficientes", ruta:configVar.URL} );   
      }
        if (usuario.rol=="premium" && producto.owner != usuario.email) {
          return res.status(403).json({status:403,error:"permisos insuficientes", ruta:configVar.URL} );   
        }
  
      const usuarioDelProducto=producto.owner
      const {status,playload,error}= await UserServices.getByEmail(usuarioDelProducto)

      if(status!==200){
        return res.status(status).json(status,error);
      }
    
      if (!playload) {
        return res.status(500).json({ error });
      }
      if(status==200){
        if(playload.rol=="premium"){
          const msg=`Se ah dado de baja el producto <b>${producto.title}</b>, con el siguiente id: ${producto._id}`
          const estadoEnviarEmail= await submitEmail(usuarioDelProducto, "Se elimino un producto", msg)
      
        }
     
        const resultado = await ProductServices.deleteProductService(pid);
        
        if(resultado.status!=201){
          return res.status(resultado.status).json(resultado);
        }
        const productos = await ProductServices.listProductsAggregateService(null,pagina,null,usuario.email);
  
        if(productos.status!=200){
          return res.status(productos.status,).json(productos);
        }
  
        io.emit("eliminado", productos.playload);
        return res.status(resultado.status).json(resultado);
      }
     
    } catch (error) {
      next(error);
    }
  }
}



