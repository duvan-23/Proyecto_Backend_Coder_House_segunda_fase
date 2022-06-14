import admin from 'firebase-admin';
import fs from 'fs';


class ContenedorFirebase{
    constructor(nombre){
        this.nombre = nombre;
    }
    async conectar(){
        let serviceAccount = JSON.parse(fs.readFileSync('./db/ecommerce-cdb38-firebase-adminsdk-81ffw-8ae1c98706.json'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        
        return  console.log("Conectado a firebase correctamente");
    }
    async save(data){
        let nombre =this.nombre;
        return await leerTodo(data,nombre);     
    }

    async deleteById(id){
        let nombre =this.nombre;
        return await eliminarId(id,nombre);
    }

    async getAll(){
        let nombre =this.nombre;
        return await leerAll(nombre);
    }

    async getById(id){
        let nombre =this.nombre;
        return await leerId(id, nombre);
    }
    
}

async function leerId(id,nombre){
    let resultado=[],r2;
    try{
        const db = admin.firestore();
        const query = db.collection(nombre);
        const contenido =await query.where("id", "==",id).get();
        contenido.forEach(doc =>
            resultado.push(doc.data())
        );
        
        if(resultado.length>0){
            resultado[0]="Id especificado no existe en el archivo"
        }
    }
    catch(err){
        resultado= err;
    }
    return resultado[0];
}


async function leerAll(nombre){
    let resultado=[],r2;
    try{
        const db = admin.firestore();
        const query = db.collection(nombre);
        const contenido =await query.orderBy("id", "asc").get();
        // const contenido =await fs.promises.readFile(ruta, 'utf8');
        contenido.forEach(doc =>
            resultado.push(doc.data())
        );
        
    }
    catch(err){
        resultado= err;
    }
    return resultado;
}

async function eliminarId(id,nombre){
    let resultado=[],r2,item,doc_elim;
    try{
        const db = admin.firestore();
        const query = db.collection(nombre);
        const contenido =await query.where("id", "==",id).get();
        item=contenido;
        contenido.forEach(doc =>
            resultado.push(doc.id)
        );
         item = await query.doc(resultado[0]).delete();
        // doc_elim.forEach(doc =>
        //     r2.push(doc.data())
        // );
    }
    catch(err){
        resultado= err;
        r2="";
    }
    return console.log(item);
    // return console.log(await doc_elim);
}

async function leerTodo(data,nombre){
    let resultado= [],r2;
    try{
        const db = admin.firestore();
        const query = db.collection(nombre);
        const contenido =await query.orderBy("id", "desc").limit(1).get();
        
        contenido.forEach(doc =>
            resultado.push(doc.data())
        );
        r2=resultado;
        resultado=resultado[resultado.length-1].id+1;
    }
    catch(err){
        r2= [];
        resultado= 1;
    }
    return guardar([resultado,r2],data,nombre);
    
}

async function guardar(resultados,data,nombre){
    let id;
    let datos =data;
    datos.id= resultados[0];
    try{
        const db = admin.firestore();
        const query = db.collection(nombre);
        await query.add(datos);
    }
    catch(err){
        console.log(err);
    }
    return console.log(resultados[0]);
}  

export default ContenedorFirebase;