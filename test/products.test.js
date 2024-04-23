import mongoose from "mongoose";
import { expect } from "chai";
import supertest from "supertest";
import { describe, it } from "mocha";
import { configVar } from "../src/config/config.js";
import ProductoModelo from "../src/dao/models/product.modelo.js";

try {
  await mongoose.connect(configVar.MONGO_URL, { dbName: configVar.DBNAME });
  console.log("Conexión exitosa a la base de datos");
} catch (error) {
  console.error("Error al conectar a la base de datos:", error);
}

const requester = supertest("http://localhost:3000");

describe("Prueba proyecto ecommerce", async function () {
  this.timeout(10000);

  describe("Prueba modulo productos", async () => {
    it("La ruta api/products en su metodo GET deberia devolver un array con los productos", async () => {
      let { status, body, ok } = await requester.get("/api/products");

      expect(status).to.be.equal(200);
      expect(ok).to.be.true;
      expect(body.elements.docs).to.exist;
      expect(body.elements.docs).to.be.an("array");
    });

    it("La ruta api/products/:pid en su metodo GET deberia devolver un objeto con el producto Id", async () => {
      const pid="6627e381f0bc8486bc2bae3f"
      let { status, body, ok } = await requester.get(`/api/products/${pid}`);

      expect(status).to.be.equal(200);
      expect(ok).to.be.true;
      expect(body).to.exist;
      expect(body).to.be.an("object");
    });

    it("La ruta api/products en su metodo POST debería guardar un producto", async () => {
      const producto = {
        title: "Patineta",
        description: "Patineta gamer",
        code: 43445,
        price: 1000,
        owner: "ludmilavaleria2003@gmail.com",
        status: true,
        stock: 10,
        category: "electronica",
        thumbnail:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Flistado.mercadolibre.com.ar%2Fsmart-tv-samsung-43&psig=AOvVaw2fd69zh-YXQkEvVASUaFt3&ust=1710457623129000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCODWiqmt8oQDFQAAAAAdAAAAABAF",
      };

      const usuario = {
        email: "ludmilavaleria2003@gmail.com",
        password: "1234",
      };
      let { header, body, status, ok } = await requester
        .post(`/api/sessions/current`)
        .send(usuario);


      expect(status).to.be.equal(302);
      const headers = header;
      // Buscamos la cabecera 'set-cookie'
      const setCookieHeader = headers["set-cookie"];
      let cookie;
      if (setCookieHeader) {
        cookie = setCookieHeader[0];
      }

      const respuesta = await requester
        .post("/api/products")
        .send(producto)
        .set("Cookie", cookie);


    
      //status 302 ya que si todo sale bien la página es redirigida
      expect(respuesta.status).to.equal(302);


      const resultDelete = await ProductoModelo.deleteOne({
        code: producto.code,
      });
      expect(resultDelete.acknowledged).to.be.true;
    });

    after(async () => {
      try {
        await mongoose.connection.dropCollection("sessions");
        console.log("Todas las sesiones han sido eliminadas");
      } catch (error) {
        console.error("Error al eliminar las sesiones:", error);
      }
    });
  });
});
