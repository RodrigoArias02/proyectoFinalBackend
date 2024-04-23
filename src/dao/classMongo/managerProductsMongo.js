import { validateProperties } from "../../utils.js";
import ProductoModelo from "../models/product.modelo.js";

export class ManagerProductsMongoDB {
  async listProducts(pagina) {
    try {
      let prodPaginate = await ProductoModelo.paginate(
        {},
        { lean: true, limit: 3, page: pagina }
      );
      return { status: 200, elements: prodPaginate };
    } catch (error) {
      const errores = {
        status: 500,
        messageError: "Error al listar productos:",
        error: error,
      };
      return errores;
    }
  }

  async listProductsAggregate(category, page, direccion, owner) {
    let PAGE_SIZE = 3;
    let aggregatePipeline = [];
    page = parseInt(page);

    try {
      // Agregar etapa de filtración por categoría solo si se proporciona una categoría
      if (category) {
        aggregatePipeline.push({
          $match: { category: { $in: [category] } },
        });
      } else if (owner) {
        aggregatePipeline.push({
          $match: { owner: { $in: [owner] } },
        });
      } else {
        // Agregar una etapa de coincidencia que seleccionará todos los documentos si no hay categoría
        aggregatePipeline.push({
          $match: {},
        });
      }

      // Agregar etapa de ordenación por precio (ascendente o descendente)
      if (direccion) {
        aggregatePipeline.push({
          $sort: { price: direccion === "asc" ? 1 : -1 },
        });
      }
      aggregatePipeline.push(
        {
          $skip: (page - 1) * PAGE_SIZE,
        },
        {
          $limit: PAGE_SIZE,
        }
      );

      // Consulta para obtener productos
      let prodCat = await ProductoModelo.aggregate(aggregatePipeline);

      // Consulta para obtener el total de productos
      const totalProducts = await (category
        ? ProductoModelo.countDocuments({ category: { $in: [category] } })
        : ProductoModelo.countDocuments());

      // Calcular información de paginación
      const totalPages = Math.ceil(totalProducts / PAGE_SIZE);
      const hasPrevPage = page > 1;
      const hasNextPage = page < totalPages;
      const prevPage = hasPrevPage ? page - 1 : null;
      const nextPage = hasNextPage ? page + 1 : null;

      const propiedades = {
        status: 200,
        playload: prodCat,
        totalPages,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage,
      };

      return propiedades;
    } catch (error) {
      const propiedades = {
        status: 500,
        messageError: "Error al intentar listar los productos",
        error: error,
      };
      return propiedades;
    }
  }

  async ingresarProductos(product) {
    try {
      let nuevoProducto = ProductoModelo.create(product);
      return nuevoProducto;
    } catch (error) {
      return {
        status: 400,
        messageError: "Error al añadir el producto a la BD",
        error: error,
      };
    }
  }
  async ProductoId(id) {
    try {
      const productoEncontrado = await ProductoModelo.findOne({
        _id: id,
      }).lean();

      return productoEncontrado;
    } catch (error) {
      return error;
    }
  }

  async actualizarProducto(id, nuevasPropiedades) {
    try {
      const result = await ProductoModelo.updateOne(
        { _id: id },
        { $set: nuevasPropiedades }
      );
      return result;
    } catch (error) {
      return {
        status: 500,
        error: `Error al actualizar el documento: ${error}`,
      };
    }
  }

  async deleteProduct(id) {
    try {
      const result = await ProductoModelo.deleteOne({ _id: id });
      return result;
    } catch (error) {
      return {
        status: 500,
        message: "Error interno al intentar eliminar el producto.",
      };
    }
  }

  async searchCodeProduct(code) {
    const existe = await ProductoModelo.findOne({ code }).lean();
    return existe;
  }
}
