const btnEliminarUsuario = document.getElementById("botonEliminar")
const btnActualizarRol = document.getElementById("actualizarRol")
const selectUsuario = document.getElementById('usuarioSelec');

let usuarios = document.getElementById('usuarios').value;
usuarios = JSON.parse(usuarios);

btnEliminarUsuario.addEventListener('click', async () => {
    const emailEliminar = document.getElementById("usuarioSelec").value
    if (emailEliminar) {
        const response = await fetch(`/api/users/${emailEliminar}`, {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Parsear la respuesta como JSON
        const data = await response.json();
   
        if (data.status == "201") {
            alert(data.message)
            window.location.reload(); // Recargar la página
        } else {
            alert(data.error)
        }
    } else {
        alert("Seleccione un email")
    }

})
btnActualizarRol.addEventListener('click', async () => {
    const emailActualizar = document.getElementById("usuarioSelec").value
    const usuarioEncontrado = usuarios.find(usuarios => usuarios.email === emailActualizar);
  
    const habilitacion = {
        identificacion: true, 
        comprobanteDeEstadoDeCuenta: true, 
        comprobanteDomicilio: true
    }
    if (emailActualizar) {
        const response = await fetch(`/api/users/premium/${usuarioEncontrado.id}`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(habilitacion),
        });


        const data = await response.json();
       
        if (data.status == "200") {
            alert(data.message)
            window.location.reload(); 
        } else {
            alert(data.error)
        }
    } else {
        alert("Seleccione un email")
    }

})



// Obtener referencias a los elementos del DOM

// Agregar un evento de cambio al select
selectUsuario.addEventListener('change', function () {
    // Obtener el rol del usuario seleccionado
    const usuarioSeleccionado = selectUsuario.value;
    if (usuarioSeleccionado) {
        const usuarioEncontrado = usuarios.find(usuarios => usuarios.email === usuarioSeleccionado);
        let rolUsuario = usuarioEncontrado.rol;
        rolUsuario = (rolUsuario === 'usuario') ? 'premium' : 'usuario';
        btnActualizarRol.innerText = `actualizar rol a ${rolUsuario}`
    } 

});

