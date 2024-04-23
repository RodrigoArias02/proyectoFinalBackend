import { CartAmount, StockAndQuantity } from "../DTO/cartsDTO.js";
import {
  ReadTicket,
  TicketSave,
  readSellersAndProducts,
} from "../DTO/ticket.DTO.js";
import { ManagerTicketMongoDB as DAO } from "../dao/classMongo/managerTicketMongo.js";
import { CartServices } from "./cart.service.js";
import { ProductServices } from "./product.service.js";
import { UserServices } from "./user.service.js";
import mongoose from "mongoose";
class TicketService {
  constructor(dao) {
    this.dao = new dao();
  }
  async createTicketService(carritoId) {
    let sellersAndProducts;
    let TicketCreate;
    let newcarrito;
    let generateTicket;
    const idValido = mongoose.Types.ObjectId.isValid(carritoId);
    if (!idValido) {
      return {
        status: 400,
        error: "El id no cumple las caracteristicas de id tipo mongoDB",
      };
    }
    const { status, productosSinStock, nuevasQuantity } = await this.checkStock(
      carritoId
    );

    if (status != 200) {
      return { status, error: "Carrito no encontrado" };
    }
    let check = productosSinStock;

    const { carrito } =
      check.length > 0
        ? await this.guardarProductosNoComprados(carritoId, check)
        : await CartServices.searchCartIdService(carritoId);

    let user = await UserServices.searchCartUsedService(carritoId);
    if (!user) {
      return {
        status: 500,
        error: "Ningun usuario tiene asignado ese carrito",
      };
    }

    for (const element of nuevasQuantity) {
      const stockAndCode = {
        stock: element.stock,
        code: element.code,
      };
      let { status, error } = await ProductServices.actualizarProductoService(
        element._id,
        stockAndCode
      );
      if (status != 200) {
        return { status, error };
      }
    }
    try {
      sellersAndProducts = new readSellersAndProducts(carrito.productos);
      TicketCreate = new TicketSave(carrito, user.email);
      newcarrito = new CartAmount(carrito);
      generateTicket = new ReadTicket(
        user,
        newcarrito,
        productosSinStock,
        TicketCreate.code,
        sellersAndProducts
      );
    } catch (error) {
      return {
        status: 400,
        error: "Error DTO, algo salio mal intentelo mas tarde",
      };
    }

    let respuesta = await CartServices.deleteTotalProductCartService(carritoId);
    if (respuesta.status != 200) {
      return { status: 400, error: "Error al intentar eliminar el carrito" };
    }

    if (productosSinStock.length > 0) {
      for (const IdProducto of productosSinStock) {
        let { status, error } = await CartServices.addProductToCartService(
          carritoId,
          IdProducto
        );
        if (status != 200) {
          return { status, error };
        }
      }
    }
    if (nuevasQuantity.length == 0) {
      return {
        status: 404,
        error:
          "Hubo un error, el producto no tiene el stock suficiente para comprar",
      };
    } else {
      const nuevoTicket = await this.dao.create(TicketCreate);
      if (!nuevoTicket) {
        return {
          status: 500,
          error: "No se pudo crear el ticket correctamente",
        };
      }
    }

    return { status: 200, ticket: generateTicket };
  }

  async checkStock(carritoId) {
    let cart = await CartServices.searchCartIdService(carritoId);

    if (cart.status != 200) {
      return cart;
    }

    let { valores } = new StockAndQuantity(cart);

    const productosSinStock = [];

    let nuevasQuantity = [];
    valores.some((item) => {
      if (item.stock < item.cantidad) {
        productosSinStock.push({
          idProducto: item._id,
          quantity: item.cantidad,
          code: item.code,
        });
      } else {
        nuevasQuantity.push({
          _id: item._id,
          stock: item.stock - item.cantidad,
          code: item.code,
        });
      }
    });

    return { status: 200, productosSinStock, nuevasQuantity };
  }

  async guardarProductosNoComprados(idCart, productosSinStock) {
    for (const IdProducto of productosSinStock) {
      let cart = await CartServices.deleteProductCartService(
        idCart,
        IdProducto.idProducto
      );
      if (cart.status != 200) {
        return { status: cart.status, error: cart.error };
      }
    }

    return await CartServices.searchCartIdService(idCart);
  }
}

export const TicketServices = new TicketService(DAO);
