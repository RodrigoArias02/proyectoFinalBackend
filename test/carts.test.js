import { expect } from "chai";
import supertest from "supertest";
import { it, describe } from "mocha";
import { configVar } from "../src/config/config.js";
import mongoose from "mongoose";
// import { CartAmount } from "../DTO/cartsDTO.js";
try {
  await mongoose.connect(configVar.MONGO_URL, { dbName: configVar.DBNAME });

} catch (error) {
  console.error("Error al conectar a la base de datos:", error);
}

const requester = supertest("http://localhost:3000");

describe("Probando insertar carrito", async function () {
  this.timeout(10000);

  it("La ruta api/carts en su metodo POST debería enviar un producto en el carrito", async () => {
    const usuario = {
      email: "rodrigoPremium@gmail.com",
      password: "1234",
    };
    let respuesta = await requester.post(`/api/sessions/current`).send(usuario);
 

    const headers = respuesta.header;
    // Buscamos la cabecera 'set-cookie'
    const setCookieHeader = headers["set-cookie"];
    let cookie;
    if (setCookieHeader) {
      cookie = setCookieHeader[0];
    }

    const cartId = "6627afb68a4b99e9f606f750";
    const productId = "6627e381f0bc8486bc2bae3f";

    // Realiza la solicitud POST y envía la sesión en la cabecera de la solicitud
    let resp = await requester
      .post(`/api/carts/${cartId}/product/${productId}`)
      .set("Cookie", cookie); //le mandamos la cookie connect.sid de la session El servidor utiliza el valor de connect.sid para recuperar la información de sesión asociada con ese usuario, como los datos de autenticación
    expect(resp.ok).to.be.true;
    expect(resp.body).to.be.an("object");
    expect(resp.status).to.be.equal(200);
  });
  // Eliminar todas las sesiones después de que se hayan ejecutado todos los tests
  after(async () => {
    try {
      await mongoose.connection.dropCollection("sessions");
      console.log("Todas las sesiones han sido eliminadas");
    } catch (error) {
      console.error("Error al eliminar las sesiones:", error);
    }
  });
});
