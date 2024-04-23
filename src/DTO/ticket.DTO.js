import { generateUniqueCode } from "../utils.js";
export class TicketSave {
  constructor(carrito, email) {
    this.code = generateUniqueCode();
    this.amount = this.calculateTotal(carrito.productos);
    this.purchaser = email;
  }

  calculateTotal(productos) {
    let precioTotal = 0;
    productos.forEach((element) => {
      // Verificar si idProducto es nulo
      if (element.idProducto && typeof element.idProducto === "object") {
        let total = element.quantity * element.idProducto.price;
        precioTotal += total;
      }
    });
    return precioTotal;
  }
}
export class ReadTicket {
  constructor(user, carrito, productosSinStock, codeTicket, productos) {
    this.codeTicket = codeTicket;
    this.email = user.email;
    this.nombre = user.first_name;
    this.apellido = user.last_name;
    this.idCarrito = user.cartId;
    this.precioTotal = carrito.totalPrecios;
    this.idsProductosSinStock = productosSinStock.map(
      (item) => item.idProducto
    );
    this.detalleProducto = productos;
  }
}

export class readSellersAndProducts {
  constructor(productos) {
    this.Datosproductos = productos.map((producto) => ({
      title: producto.idProducto.title,
      price: producto.idProducto.price,
      owner: producto.idProducto.owner,
      quantity: producto.quantity,
      priceTotal: producto.idProducto.price * producto.quantity,
    }));
  }
}
