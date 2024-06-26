import carritoModelo from "../models/carts.model.js";

export class ManagerCartMongoDB {
  async listCart() {
    try {
      let carritos = await carritoModelo.find();
      return carritos;
    } catch (error) {
      return { status: 500, error: "Error al buscar carritos" };
    }
  }

  async createCart() {
    try {
      let nuevoCarrito = await carritoModelo.create({});
      return nuevoCarrito;
    } catch (error) {
      return { status: 500, error: "Error al añadir el producto a la BD" };
    }
  }

  async cartId(id) {
    try {
      const cartSearch = await carritoModelo
        .findOne({ _id: id })
        .populate("productos.idProducto");
      return cartSearch;
    } catch (error) {
      return { status: 500, error: "Algo salio mal en la busqueda" };
    }
  }
  async searchProductFromCart(idCart, idProducto) {
    try {
      let result = await carritoModelo.findOne(
        { _id: idCart, "productos.idProducto": idProducto }, // Consulta para encontrar el carrito y el producto específico
        { "productos.$": 1 } // Proyección para devolver solo el primer elemento coincidente del array 'productos'
      );

      return result;
    } catch (error) {
      return { status: 500, error: "Algo salio mal en la busqueda" };
    }
  }

  async addProductToCart(idCart, nuevasPropiedades) {
    try {
      let carrito = await carritoModelo
        .findOne({ _id: idCart })
        .populate("productos.idProducto");
      if (carrito == null) {
        return { status: 404, error: "no se encontro el carrito" };
      }
      let productosNuevos = carrito.productos;

      let result = await carritoModelo.findOne({
        _id: idCart,
        productos: { $elemMatch: { idProducto: nuevasPropiedades.idProducto } },
      });

      //si encuentra producto
      if (result) {
        const indice = result.productos.findIndex(
          (objeto) =>
            objeto.idProducto.toString() ===
            nuevasPropiedades.idProducto.toString()
        );

        // Si el id se repite, aumentar quantity
        if (indice !== -1) {
          result.productos[indice].quantity++;
        }

        productosNuevos = result.productos;
      } else {
        //Si el array productos tiene mas longitud a 0 le agregamos el nuevo producto, sino le redefinimos las nuevas
        if (carrito.productos.length > 0) {
          productosNuevos.push(nuevasPropiedades);
        } else {
          productosNuevos = nuevasPropiedades;
        }
      }

      result = await carritoModelo.updateOne(
        { _id: idCart },
        { productos: productosNuevos }
      );

      return result;
    } catch (error) {
      return {
        status: 500,
        error: `Error al actualizar el documento: ${error}`,
      };
    }
  }

  async updateQuantity(idCart, idProduct, quantity) {
    try {
      const quantityUpdateResult = await carritoModelo.updateOne(
        { _id: idCart, "productos.idProducto": idProduct },
        { $set: { "productos.$.quantity": quantity.quantity } }
      );
      return quantityUpdateResult;
    } catch (error) {
      return { status: 500, error: `Hubo un error: ${error}` };
    }
  }

  async updateProducts(cartId, arrayProducts) {
    try {
      const updateResult = await carritoModelo.updateOne(
        { _id: cartId },
        { $set: { productos: arrayProducts } }
      );
      return updateResult;
    } catch (error) {
      return { status: 500, error: `Hubo un error: ${error}` };
    }
  }

  async deleteProductCart(idCarrito, idProductoAEliminar) {
    try {
      // Actualizamos el carrito usando $pull
      const deleteResult = await carritoModelo.updateOne(
        { _id: idCarrito },
        { $pull: { productos: { idProducto: idProductoAEliminar } } }
      );
      return deleteResult;
    } catch (error) {
      return { status: 500, error: `Hubo un error: ${error}` };
    }
  }

  async deleteTotalProductCart(id) {
    try {
      const result = await carritoModelo.updateOne(
        { _id: id },
        { productos: [] }
      );
      return result;
    } catch (error) {
      return { status: 500, error: `Hubo un error: ${error}` };
    }
  }

  async deleteCart(id) {
    try {

      // Intentar eliminar el documento
      const result = await carritoModelo.deleteOne({ _id: id });
      return result
    } catch (error) {
      return error
    }
  }
}
