const socket=io( )
let div = document.getElementById("productContainer")

let btnEnviarId = document.getElementById("enviarId")

let btnEnviarProductos= document.getElementById("enviarProductos")

const buttons = document.querySelectorAll(".btnUpdate");

function renderProducts(datos){
  let html = '';

  // Usando Array.map para transformar el array en el formato deseado
  datos.forEach(product => {
    html += `
      <div>
      <p><b>id:</b>${product._id}</p>
      <br />
      <b>Titulo: </b><input type="text" name="title" value="${product.title}" />
      <br />
      <b>Precio: </b><input type="number" name="price" value="${product.price}" />
      <br />
      <b>Code</b><input type="number" name="code" value="${product.code}" />
      <br />
      <b>Descripcion: </b><textarea name="description">${product.descrption}</textarea>
      <br />
      <b>Stock: </b><input type="number" name="stock" value="${product.stock}" />
      <br />
      <b>Categoria: </b>
      <input type="text" name="category" value="${product.category}" />
      <br />
      <b>email: </b><input type="email" name="owner" value="${product.owner}" />
      <br />
      <b>Imagen:</b>
      <input type="text" name="thumbnail" value="${product.thumbnail}" />

      <button data-id="${product._id}" class="btnUpdate">Actualizar producto</button>
    </div>
    <hr />
    `;
  });

  div.innerHTML=html
 
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("miFormulario");

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Evitar que el formulario se envíe por defecto

    // Obtener los valores de los campos del formulario
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const code = document.getElementById("code").value;
    const price = document.getElementById("price").value;
    const owner = document.getElementById("owner").value;
    const status = document.getElementById("status").value;
    const stock = document.getElementById("stock").value;
    const category = document.getElementById("category").value;
    const thumbnail = document.getElementById("thumbnail").value;
    if (
      title.trim() === "" ||
      description.trim() === "" ||
      code.trim() === "" ||
      price.trim() === "" ||
      owner.trim() === "" ||
      status.trim() === "" ||
      stock.trim() === "" ||
      category.trim() === ""
    ) {
      alert("Por favor complete todos los campos");
      // Detener el envío del formulario
      return false;
    }
    const product = {
      title,
      description,
      code,
      price,
      owner,
      status,
      stock,
      category,
      thumbnail,
    };

    try {
      const response = await fetch(`/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });
      const {error} = await response.json();


      if (response.status === 201) {
        alert("Guardado con éxito");
        window.location.reload();
      } else {
        if(error){
          alert(error)
        }else{
          alert("Error al guardar. Por favor, inténtelo de nuevo.");
        }
       
      }
    } catch (error) {
     
      alert("Error al guardar. Por favor, inténtelo de nuevo más tarde.");
    }
  });
});


btnEnviarId.addEventListener('click', async ()=>{
  const id = document.getElementsByName('id')[0].value;
  if (id.trim() === ""){
    alert("Por favor complete todos los campos");
    // Detener el envío del formulario
    return false;
    }
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
      
        },
        
      });
  
    
      const data = await response.json();

   
      if (response.status === 201) {
        alert("eliminado con exito")
        window.location.reload();     
      }else{
        alert(data.error)
      }
    } catch (error) {
      alert("error, intente mas tarde")
    
      
    }
})

buttons.forEach((button) => {
  button.addEventListener("click", async () => {
    // Obtiene el ID del producto del atributo data-id del botón clickeado
    const productId = button.getAttribute("data-id");

    // Encuentra el elemento padre del botón
    const productContainer = button.closest("div");

    // Encuentra los inputs dentro del elemento padre
    const title = productContainer.querySelector('input[name="title"]').value;
    const price = productContainer.querySelector('input[name="price"]').value;
    const code = productContainer.querySelector('input[name="code"]').value;
    const description = productContainer.querySelector(
      'textarea[name="description"]'
    ).value;
    const stock = productContainer.querySelector('input[name="stock"]').value;
    const category = productContainer.querySelector(
      'input[name="category"]'
    ).value;
    const owner = productContainer.querySelector('input[name="owner"]').value;
    const thumbnail = productContainer.querySelector(
      'input[name="thumbnail"]'
    ).value;

    const product = {
      title,
      price,
      description,
      stock,
      code,
      category,
      owner,
      thumbnail,
    };
    try {
      // Enviar datos al servidor y esperar la respuesta
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });
      // Parsear la respuesta como JSON
      const {estado} = await response.json();
      if (estado.status == "200") {
        alert(estado.message);
      } else {
        alert(estado.error);
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    }
  });
});


//el cliente escuchara y renderizara cada vez que llegue un nuevo array
socket.on("productos", async datos=>{
    renderProducts(datos)
   
})
