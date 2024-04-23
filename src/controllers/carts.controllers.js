import mongoose from "mongoose";
import { ProductServices } from "../service/product.service.js";
import { CartServices } from "../service/cart.service.js";
import { CartAmount, CartSaveProduct, RenderCart } from "../DTO/cartsDTO.js";
import { TicketServices } from "../service/ticket.service.js";
import { submitEmail } from "../mails/mail.js";

export class CartsControllers {
  static async renderCart(req, res) {
    res.setHeader("Content-Type", "text/html");
    const productId = req.params.cid; // Obtén el id del producto de req.params
    const login = req.session.usuario;
    const { status, carrito } = await CartServices.searchCartIdService(
      productId
    );

    if (status != 200) {
      
      return { status, error: "algos salio mal" };
    }
    let objectAmount = new CartAmount(carrito);

    let render = new RenderCart(objectAmount, carrito);

    if (status == 200) {
      return res.status(200).render("cart", { render, login });
    } else if (status == 400) {
      return res.status(400).json({ error: "No se encontro el id" });
    } else {
      return res.status(500).json({ error: "Hubo un error" });
    }
  }

  static async loadCarts(req, res) {
    res.setHeader("Content-Type", "application/json");
    const carritos = await CartServices.listCartService();
    if (carritos.status) {
      return res.status(carritos.status).json(carritos);
    }
    return res.status(200).json({ carritos });
  }

  static async postCreateCart(req, res) {
    res.setHeader("Content-Type", "application/json");

    // const validacion = cartManager.CreateCart();
    const validacion = await CartServices.createCartService();
    if (validacion.status == 201) {
      return res.status(201).json("Carrito creado con exito");
    } else {
      return res.status(validacion.status).json(validacion.error);
    }
  }

  static async GetCartId(req, res) {
    const cartId = req.params.cid; // Obtén el id del producto de req.params
    res.setHeader("Content-Type", "application/json");

    const carrito = await CartServices.searchCartIdService(cartId);
    if (carrito.status == 200) {
      return res.status(200).json(carrito);
    } else {
      return res.status(carrito.status).json(carrito.error);
    }
  }

  static async postAddProductToCart(req, res) {
    res.setHeader("Content-Type", "application/json");
    const usuario = req.session.usuario;
    const productId = req.params.pid; // Obtén el id del producto de req.params
    const cartId = req.params.cid; // Obtén el id del producto de req.params
    const idValido = mongoose.Types.ObjectId.isValid(cartId);
    if (!req.isAuthenticated()) {
      return res.status(403).json({ error: "Inicie sesión" });
    }
    if (!idValido) {
      return res.status(400).json({
        error: "El id no cumple las caracteristicas de id tipo mongoDB",
      });
    }
    const validacion = await ProductServices.ProductoIdService(productId);
    if (validacion.status != 200) {
      return res.status(validacion.status).json(validacion.error);
    }
    if (validacion.producto.owner == usuario.email) {
      return res
        .status(400)
        .json({
          error:
            "No puedes añadir a tu carrito un producto que tu creaste...!!!",
        });
    }

    let formProduct = {
      idProducto: validacion.producto._id,
      quantity: 1,
    };

    const agregarProducto = await CartServices.addProductToCartService(
      cartId,
      formProduct
    );
    return res.status(200).json(agregarProducto);
  }

  static async putUpdateQuantity(req, res) {
    res.setHeader("Content-Type", "application/json");
    const productId = req.params.pid; // Obtén el id del producto de req.params
    const cartId = req.params.cid; // Obtén el id del producto de req.params
    const quantity = req.body;

    if (typeof quantity === "object" && quantity !== null) {
      const updateQuantity = await CartServices.updateQuantityService(
        cartId,
        productId,
        quantity
      );
      if (updateQuantity.status == 200) {
        return res
          .status(200)
          .json({ status: 200, message: "Cantidad actualizada con exito" });
      } else {
        return res.status(updateQuantity.status).json({
          status: updateQuantity.status,
          message: updateQuantity.error,
        });
      }
    } else {
      return res
        .status(200)
        .json({ status: 400, error: "La cantidad no es tipo Object" });
    }
  }

  static async putUpdateProduct(req, res) {
    res.setHeader("Content-Type", "application/json");
    const cartId = req.params.cid;
    const newProduct = req.body;

    if (!("newIdProduct" in newProduct) || !("newQuantity" in newProduct)) {
      return res
        .status(400)
        .json({ error: "Los datos del nuevo producto son inválidos" });
    }

    let arrayProducts = new CartSaveProduct(newProduct);
    arrayProducts = [arrayProducts];

    const idValido = mongoose.Types.ObjectId.isValid(cartId);
    if (!idValido) {
      return res
        .status(400)
        .json({
          error: "El id no cumple las caracteristicas de id tipo mongoDB",
        });
    }
    const checkCart = await CartServices.searchCartIdService(cartId);
    if (checkCart.status != 200) {
      return res.status(checkCart.status).json({ checkCart });
    } else {
      if (Array.isArray(arrayProducts)) {
        const updateProducts = await CartServices.updateProductsService(
          cartId,
          arrayProducts
        );

        if (updateProducts.status == 200) {
          return res.status(200).json({ updateProducts });
        } else {
          return res.status(updateProducts.status).json(updateProducts);
        }
      } else {
        return res
          .status(400)
          .json({ status: 400, error: "La cantidad no es tipo Object" });
      }
    }
  }

  static async deleteTotalProducts(req, res) {
    res.setHeader("Content-Type", "application/json");
    const cartId = req.params.cid; // Obtén el id del producto de req.params

    const deletProducts = await CartServices.deleteTotalProductCartService(
      cartId
    );
    return res.status(deletProducts.status).json(deletProducts);
  }

  static async deleteOneProduct(req, res) {
    res.setHeader("Content-Type", "application/json");
    const cartId = req.params.cid; // Obtén el id del producto de req.params
    const productId = req.params.pid; // Obtén el id del producto de req.params
    let quantity = req.query.quantity;
    let deletProducts;
    let { carrito, status } = await CartServices.searchProductFromCartService(
      cartId,
      productId
    );
    if (status != 200) {
      return res
        .status(status)
        .json({ status, error: "Error al buscar el producto en el carrito" });
    }

    const cantidadGuardadBD = carrito.productos[0].quantity;
    if (quantity <= 0) {
      return res
        .status(400)
        .json({ error: "No se admite cantidades igual o menor 0" });
    }
    if (quantity > cantidadGuardadBD) {
      return res
        .status(400)
        .json({ error: "El valor enviado es mayor al guardado en BD" });
    }
    if (quantity <= 1) {
      deletProducts = await CartServices.deleteProductCartService(
        cartId,
        productId
      );
    } else {
      const nuevaQuantity = quantity - 1;
      quantity = {
        quantity: nuevaQuantity,
      };
      deletProducts = await CartServices.updateQuantityService(
        cartId,
        productId,
        quantity
      );
    }
    return res.status(deletProducts.status).json(deletProducts);
  }

  static async purchase(req, res) {
    res.setHeader("Content-Type", "application/json");
    const cartId = req.params.cid; // Obtén el id del producto de req.params
    const email = req.session.usuario.email;

    let { ticket, status, error } = await TicketServices.createTicketService(
      cartId
    );
    if (status != 200) {
      return res.status(status).json(error);
    } else {
      const productosHTML = ticket.detalleProducto.Datosproductos.map(
        (producto) => `
        <hr>
          <div class="producto">
              <p><strong>Título:</strong> ${producto.title}</p>
              <p><strong>Precio:</strong> ${producto.price}</p>
              <p><strong>Propietario:</strong> ${producto.owner}</p>
              <p><strong>Cantidad:</strong> ${producto.quantity}</p>
              <p><strong>Precio Total:</strong> ${producto.priceTotal}</p>
          </div>
     
      `
      ).join("");

      const ticketHTML = `
        <div class="ticket">
            <div class="ticket-header">
                <h1 style="text-align:center;">Ticket de Compra N° ${ticket.codeTicket}</h1>
            </div>
            <div class="ticket-body">
                <h2>Datos del comprador:</h2>
                <p>Nombre completo: ${ticket.nombre} ${ticket.apellido}</p>
                <p>Correo electrónico : ${ticket.email}</p>

                <p>Productos sin stock: ${ticket.idsProductosSinStock.join(
                  ", "
                )}</p>
            </div>
            <div class="ticket-productos" style="flex: 1;">
                <h2>Detalle de Productos:</h2>
                ${productosHTML}
            </div>
            <h2>Precio total: ${ticket.precioTotal}</h2>
        </div>
      `;
      let respuesta = await submitEmail(
        email,
        "Ticket de compra",
        ticketHTML
      );
      return res.status(200).json({ status: 200, ticket });
    }
  }
}
