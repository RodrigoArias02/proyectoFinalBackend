let cartId = document.getElementById("cartId").textContent;
const buttons = document.querySelectorAll(".EliminarUno, .eliminarTodo");
const botonVaciarCarrito = document.getElementById("btnVaciarCarrito");
const botonComprarCarrito = document.getElementById("comprarCarrito");
buttons.forEach((button) => {
  button.addEventListener("click", async () => {
    let productId = button.getAttribute("data-id");
    let quantity = button.getAttribute("data-otro-id");
    let productIdTodo = button.getAttribute("data-id-todo");
    quantity = productIdTodo ? 1 : quantity;

    productId = productIdTodo ? productIdTodo : productId;

    try {
      // Enviar datos al servidor y esperar la respuesta
      const response = await fetch(
        `/api/carts/${cartId}/product/${productId}?quantity=${quantity}`,
        {
          method: "delete",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.status == "200") {
        alert(data.message);
        window.location.reload(); // Recargar la página
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    }
  });
});
botonVaciarCarrito.addEventListener("click", async () => {
  try {
    // Enviar datos al servidor y esperar la respuesta
    const response = await fetch(
      `/api/carts/${cartId}`,
      {
        method: "delete",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (data.status == "200") {
      alert(data.message);
      window.location.reload(); // Recargar la página
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error("Error al enviar el formulario:", error);
  }
});
botonComprarCarrito.addEventListener("click", async () => {
  try {
    // Enviar datos al servidor y esperar la respuesta
    const response = await fetch(
      `/api/carts/${cartId}/purchase`,
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();


    if (data.status == "200") {
      alert("compra exitosa")
      window.location.reload(); // Recargar la página
    } else {
      alert(`Algo salio mal: ${data.error}, status: ${data.status}`);
    }
  } catch (error) {
    console.error("Error al enviar el formulario:", error);
  }
});
