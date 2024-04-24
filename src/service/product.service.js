import { ManagerProductsMongoDB as DAO } from "../dao/classMongo/managerProductsMongo.js";
import mongoose from "mongoose";
class ProductService {
  constructor(dao) {
    this.dao = new dao();
  }
  async listProductsService(pagina) {
    return await this.dao.listProducts(pagina);
  }
  async listProductsAggregateService(category, page, direccion, owner) {
    return await this.dao.listProductsAggregate(
      category,
      page,
      direccion,
      owner
    );
  }
  async ingresarProductosService(product) {
    const existe = await this.dao.searchCodeProduct(product.code);

    if (existe != null) {
      return {
        status: 404,
        messageError: `Ya hay un producto registrado con ese codigo: ${product.code}`,
        error: "Ah ingresado un codigo ya registrado.",
      };
    }
    let nuevoProducto = await this.dao.ingresarProductos(product);

    if (!nuevoProducto) {
      return;
    }
    return {
      status: 201,
      message: "peticion realizada con exito",
      producto: nuevoProducto,
    };
  }

  async ProductoIdService(id) {
    const idValido = mongoose.Types.ObjectId.isValid(id);
    if (!idValido) {
      return {
        status: 400,
        error: "El id no cumple las caracteristicas de id tipo mongoDB",
      };
    }

    const productoEncontrado = await this.dao.ProductoId(id);

    if (!productoEncontrado) {
      return { status: 404, producto: null,error:`No se encontro el producto con el id ${id}` };
    }

    if (productoEncontrado.status == 500) {
      return { status: 500, error: "error interno en el servidor" };
    }

    return { status: 200, producto: productoEncontrado};
  }
  async actualizarProductoService(id, nuevasPropiedades) {
    const existe = await this.searchCodeProductService(nuevasPropiedades.code);
    if (existe) {
      if (existe._id.toString() !== id.toString()) {
        return {
          status: 409,
          error: "El códigooo " + existe.code + " ya está en uso",
        };
      }
    }

    const result = await this.dao.actualizarProducto(id, nuevasPropiedades);

    if (result.modifiedCount === 1) {
      return { status: 200, message: "Documento actualizado con éxito" };
    } else {
      return {
        status: 404,
        error: "No se encontró el documento o no hubo cambios",
      };
    }
  }
  async searchCodeProductService(code) {
    if (isNaN(code)) {
      return {
        status: 400,
        error: "El code no es numerico",
      };
    }
    return await this.dao.searchCodeProduct(code);
  }
  async deleteProductService(id) {
    const idValido = mongoose.Types.ObjectId.isValid(id);
    if (!idValido) {
      return {
        status: 400,
        error: "El id no cumple las caracteristicas de id tipo mongoDB",
      };
    }
    const result = await this.dao.deleteProduct(id);

    // Verificar si se eliminó correctamente
    if (result.deletedCount === 1) {
      return { status: 201, message: "Producto eliminado con éxito." };
    } else {
      return {
        status: 404,
        message: "No se encontró el producto con el ID proporcionado.",
      };
    }
  }
}

export const ProductServices = new ProductService(DAO);
