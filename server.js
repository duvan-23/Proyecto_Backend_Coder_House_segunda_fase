import express from 'express';
import  {Router}  from 'express';
// const {Router} = express;
import Contenedor from './ContenedorArchivo.js';
import ContenedorFirebase from './ContenedorFirebase.js';
const app = express()

const routerProductos= new Router();
const routercarrito= new Router();

const messages = [];
const productos = [];
const administrador =true;
app.use(express.json())
const palabras = ['Frase', 'inicial'];

let contenedorProductos = new Contenedor("productos.txt");
let contenedorProductosCarro = new Contenedor("carrito.txt");
let contenedorFire = new ContenedorFirebase("carrito");
app.use(express.static('./public'))
app.use(express.urlencoded({extended:true}))
app.set('views', './public')

app.set('view engine', 'pug')

//-------------productos-------------
await contenedorFire.conectar();
console.log("Conectado a firebase correctamente");
routerProductos.get('/:id?', async(req, res) => {
    const { id } = req.params
    let producto=[], productos1;
    
    if(id){
        productos1=await contenedorProductos.getById(parseInt(id));
        if(productos1!='Id especificado no existe en el archivo'){
            producto.push(productos1);
            producto[0].admin=administrador;
        }
        return res.render('./views/productos',{productos: producto});
    }
    productos1=await contenedorProductos.getAll();
    if(productos1!=""){
        productos1[0].admin=administrador;
    }
    return res.render( './views/productos', {productos:productos1});
})

routerProductos.post('/', async(req, res) => {
    if(administrador){
        await contenedorProductos.save(req.body);
        let productos1=await contenedorProductos.getAll();
        return res.render( './views/productos', {productos:productos1});
    }else{
        res.send({error:-1,descripcion: "ruta /api/productos/ metodo POST no autorizado"});
    }
})
routerProductos.delete('/:id',async(req, res) => {
    if(administrador){
        const {id} = req.params;
        await contenedorProductos.deleteById(Number(id))
        res.render( './views/productos', {productos:await contenedorProductos.getAll()});
    }else{
        res.send({error:-1,descripcion: "ruta /api/productos/:id metodo DELETE no autorizado"});
    }
})

routerProductos.put('/:id', async (req, res) => {
    if(administrador){
        const { id } = req.params
        let datos = req.body;
        datos.id=Number(id);
        res.send(await contenedorProductos.putId(id,datos));
    }else{
        res.send({error:-1,descripcion: "ruta /api/productos/:id metodo PUT no autorizado"});
    }
})

//-------------carrito-------------
routercarrito.get('/', async(req, res) => {//1
    // let carritos=await contenedorProductosCarro.getAll();
    let carritos=await contenedorFire.getAll();
    return res.render( './views/productos_carro', {carritos:carritos});
})

routercarrito.get('/:id/productos', async (req, res) => {//1
    const { id } = req.params;
    let productos;
    let datoCarrito = req.query.id_carro;
    // productos=await contenedorProductosCarro.getById(parseInt(id));
    // let carritos=await contenedorProductosCarro.getAll();
    productos=await contenedorFire.getById(parseInt(id));
    let carritos=await contenedorFire.getAll();
    return res.render( './views/productos_carro', {carritos:carritos,productos:productos.productos,idcarrito:datoCarrito});
})

routercarrito.post('/', async(req, res) => {//1
    let producto, productos1;
    // return res.render('./views/productos',{productos: producto});
    producto=[];

    let data ={
        timestamp: Date.now(),
        productos:producto
    }
    // await contenedorProductosCarro.save(data);
    // let carritos=await contenedorProductosCarro.getAll();
    await contenedorFire.save(data);
    let carritos=await contenedorFire.getAll();
    return res.render('./views/productos_carro',{carritos: carritos});
})
routercarrito.post('/:id/productos', async(req, res) => {
    let producto, productos1;
    const { id } = req.params;
    let datos = req.body;
    let datoCarrito = req.query.id_carro;
    // return res.render('./views/productos',{productos: producto});
    producto=await contenedorProductos.getById(parseInt(id));

    if(producto!='Id especificado no existe en el archivo'){
        producto.id_producto=producto.id;
        delete producto.id;
        await contenedorProductosCarro.saveCarrito(producto, datos.id);
        carritos=await contenedorProductosCarro.getAll();
        productos1=await contenedorProductosCarro.getById(parseInt(datos.id));
        return res.render('./views/productos_carro',{carritos: carritos,productos:productos1,idcarrito:datoCarrito});
    }
})

routercarrito.delete('/:id',async(req, res) => {//1

    const {id} = req.params;
    await contenedorFire.deleteById(Number(id));
    // await contenedorProductosCarro.deleteById(Number(id))
    res.render( './views/productos', {productos:await contenedorProductosCarro.getAll()});
})

routercarrito.delete('/:id/productos/:id_prod',async(req, res) => {

    const {id} = req.params;
    const {id_prod} = req.params;
    await contenedorProductosCarro.deleteByIdCarrito(Number(id), Number(id_prod))
    res.render( './views/productos', {productos:await contenedorProductosCarro.getAll()});
})


routercarrito.put('/:id/productos/:id_prod', async (req, res) => {
    let producto;
    const { id, id_prod } = req.params;
    let datos = req.body;
    producto=await contenedorProductos.getById(parseInt(datos.idProducto));
    if(producto!='Id especificado no existe en el archivo'){
        producto.id_producto=producto.id;
        delete producto.id;
        producto.id=Number(id);
        res.send(await contenedorProductosCarro.putIdCarrito(id,producto,id_prod));
    }
})

app.use('/api/productos',routerProductos)
app.use('/api/carrito',routercarrito)
app.use((req, res, next) => {
    
    res.status(404).send({error:-2,descripcion: "ruta "+req.url+ " metodo "+req.method+" no implementada"})
  })
const PORT = process.env.PORT || 8080

const server = app.listen(PORT, () => {
    console.log('Servidor HTTP escuchando en el puerto ' + PORT)
})
server.on('error', error => console.log(`Error en servidor ${error}`))