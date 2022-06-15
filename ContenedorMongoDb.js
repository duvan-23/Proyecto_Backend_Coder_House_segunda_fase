import mongoose from "mongoose";
import * as models from "./models/productos.js";

class ContenedorMongoDb{
    constructor(nombre){
        this.nombre = nombre;
    }

    async conectar(){
        const URL = "mongodb+srv://duvan:123@cluster0.sdggjza.mongodb.net/ecommerce?retryWrites=true&w=majority";
        let conexion = await mongoose.connect(URL);

        return console.log("Conexión a MongoDB correcta");
    }

    async getById(id){
        let nombre =this.nombre;
        return await leerId(id, nombre);
    }

    async getAll(){
        let nombre =this.nombre;
        return await leerAll(nombre);
    }

    async save(data){
        let nombre =this.nombre;
        return await leerTodo(nombre,data);
    }

    async deleteById(id){
        let nombre =this.nombre;
        return await eliminarId(id,nombre);
    }

    async putId(id,datos){
        let nombre =this.nombre;
        return await actualizar(id,nombre,datos);
    }
}

async function actualizar(id,nombre,datos){
    let resultado2,r3;
    try{
        const contenido =await models.productos.updateOne({id:id},{$set: datos});
        resultado2 =contenido;
    }
    catch(err){
        resultado2= err;
    }
    return console.log(resultado2);
}

async function eliminarId(id,nombre){
    let resultado,r2;
    try{
        const contenido =await models.productos.deleteMany({id: id});
        resultado =contenido;
    }
    catch(err){
        resultado= err;
    }
    return console.log(resultado);
}

async function leerTodo(ruta,data){
    let resultado,r2;
    try{
        const contenido =await models.productos.find({});
        resultado =contenido;
        r2=resultado;
        resultado=resultado[resultado.length-1].id+1;
    }
    catch(err){
        r2= [];
        resultado= 1;
    }
    return guardar([resultado,r2],data,ruta);
}

async function guardar(resultados,data,ruta){
    let id;
    let datos =data;
    datos.id= resultados[0];
    resultados[1].push(datos);
    try{
        // await fs.promises.writeFile(ruta, JSON.stringify(resultados[1],null, 2))
        await models.productos.create([datos]);
    }
    catch(err){
        console.log(err);
    }
    return ""+resultados[0];
}  


async function leerAll(nombre){
    let resultado,r2;
    try{
        
        const contenido =await models.productos.find({});
        // const contenido =await fs.promises.readFile(nombre, 'utf8');
        resultado =contenido;
    }
    catch(err){
        resultado= err;
    }
    return resultado;
    // return console.log(resultado);
}

async function leerId(id,nombre){
    let resultado,r2;
    try{
        const contenido =await models.productos.find({id: id}, {_id: 0, __v: 0});
        // const contenido =await fs.promises.readFile(ruta, 'utf8');
        resultado =contenido;
        if(resultado.length==0){
            resultado="Id especificado no existe en el archivo"
        }
    }
    catch(err){
        resultado= err;
    }
    return resultado;
}

export default ContenedorMongoDb;