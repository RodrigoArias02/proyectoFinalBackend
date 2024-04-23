import { ManagerCartMongoDB as DAO } from "../dao/classMongo/managerCartsMongo.js";
import mongoose from "mongoose";
class CartService {
  constructor(dao) {
    this.dao = new dao();
  }
  async listCartService() {
    const cart = await this.dao.listCart();
    if (cart == null) {
      return { status: 404, error: "No se encontraron carritos" };
    } else {
      return cart;
    }
  }
  async createCartService() {
    const nuevoCarrito = await this.dao.createCart();
    if (nuevoCarrito == null) {
      return { status: 400, error: "hubo un error al crear el carrito" };
    }
    return {
      status: 201,
      message: "peticion realizada con exito",
      producto: nuevoCarrito,
    };
  }
  async searchCartIdService(cartId) {
    const idValido = mongoose.Types.ObjectId.isValid(cartId);
    if (!idValido) {
      return {
        status: 400,
        error: "El id no cumple las caracteristicas de id tipo mongoDB",
      };
    }
    const cartSearch = await this.dao.cartId(cartId);
    if (!cartSearch) {
      return { status: 404, error: "Carrito no encontrado" };
    }

    return { status: 200, carrito: cartSearch };
  }
  async searchProductFromCartService(idCart, idProducto) {
    const idValido = mongoose.Types.ObjectId.isValid(idCart, idProducto);
    if (!idValido) {
      return {
        status: 400,
        error: "El id no cumple las caracteristicas de id tipo mongoDB",
      };
    }
    const cartSearch = await this.dao.searchProductFromCart(idCart, idProducto);
    if (!cartSearch) {
      return { status: 404, error: "Carrito no encontrado" };
    }

    return { status: 200, carrito: cartSearch };
  }
  async addProductToCartService(idCart, nuevasPropiedades) {
    const propiedadesPermitidas = ["idProducto", "quantity", "code"];
    let propiedadesQueLlegan = Object.keys(nuevasPropiedades);
    let valido = propiedadesQueLlegan.every((propiedad) =>
      propiedadesPermitidas.includes(propiedad)
    );
    if (!valido) {
      return { status: 400, error: "Propiedad Invalida" };
    }

    const result = await this.dao.addProductToCart(idCart, nuevasPropiedades);
    //por si entro al catch
    if (result.status) {
      return result;
    }
    //   Verificar si se actualizó correctamente
    if (result.modifiedCount === 1) {
      return { status: 200, message: "Documento actualizado con éxito" };
    } else {
      return {
        status: 404,
        error: "No se encontró el documento o no hubo cambios",
      };
    }
  }
  async updateQuantityService(idCart, idProduct, quantity) {
    const quantityUpdateResult = await this.dao.updateQuantity(
      idCart,
      idProduct,
      quantity
    );
    if (quantityUpdateResult.status) {
      return quantityUpdateResult;
    }
    if (quantityUpdateResult.modifiedCount === 1) {
      return { status: 200, message: "Cantidad actualizada con éxito" };
    } else {
      return {
        status: 404,
        error: "No se encontró el documento o no hubo cambios",
      };
    }
  }
  async updateProductsService(cartId, arrayProducts) {
    const idValido = mongoose.Types.ObjectId.isValid(cartId);
    if (!idValido) {
      return {
        status: 400,
        error: "El id no cumple las caracteristicas de id tipo mongoDB",
      };
    }
    const updateResult = await this.dao.updateProducts(cartId, arrayProducts);
    if (updateResult.modifiedCount === 1) {
      return { status: 200, message: "Productos actualizada con éxito" };
    } else {
      return {
        status: 404,
        error: "No se encontró el documento o no hubo cambios",
      };
    }
  }
  async deleteProductCartService(idCarrito, idProductoAEliminar) {
    const idValido = mongoose.Types.ObjectId.isValid(
      idCarrito,
      idProductoAEliminar
    );
    if (!idValido) {
      return {
        status: 400,
        error: "El id no cumple las caracteristicas de id tipo mongoDB",
      };
    }
    const deleteResult = await this.dao.deleteProductCart(
      idCarrito,
      idProductoAEliminar
    );
    if (deleteResult.modifiedCount === 1) {
      return { status: 200, message: "Producto eliminado con exito" };
    } else {
      return {
        status: 404,
        error: "No se encontró el documento o no hubo cambios",
      };
    }
  }
  async deleteTotalProductCartService(id) {
    const idValido = mongoose.Types.ObjectId.isValid(id);
    if (!idValido) {
      return {
        status: 400,
        error: "El id no cumple las caracteristicas de id tipo mongoDB",
      };
    }
    const result = await this.dao.deleteTotalProductCart(id);

    //   Verificar si se actualizó correctamente
    if (result.modifiedCount === 1) {
      return {
        status: 200,
        message: "Se eliminaron los productos del carrito",
      };
    } else {
      return {
        status: 404,
        error: "No se encontró el documento o no hubo cambios",
      };
    }
  }
  async deleteCartService(id) {
    const idValido = mongoose.Types.ObjectId.isValid(id);
    if (!idValido) {
      return {
        status: 400,
        error: "El id no cumple las caracteristicas de id tipo mongoDB",
      };
    }
    const borrarCarrito = await this.dao.deleteCart(id);

    if(borrarCarrito.error){
      return {
        status: 500,
        message: "Error interno en el servidor",
      };
    }
    // Verificar si se eliminó correctamente
    if (borrarCarrito.deletedCount == 1) {
      return { status: 201, message: "Producto eliminado con éxito." };
    } else {
      return {
        status: 404,
        message: "No se encontró el producto con el ID proporcionado.",
      };
    }
  }
}

export const CartServices = new CartService(DAO);
