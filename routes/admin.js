//const router = require("./post")

const express = require("express")
const router = express.Router()
const modelCategoria = require('../models/categoria')
const modelConta = require('../models/conta')
const modelEntrada = require('../models/entrada')

/*
 * Rotas para Home
 */
    router.get('/home', (req, res) => {
        var valorConta = [], valorCateg = [], totValorCateg = 0
        modelEntrada.entrada.findAll({
            order: [['updatedAt', 'DESC']]
        }).then(function(entradas){
            var saldoCont = 0, totReceita = 0, totDespesa = 0, saldNegCart = 0, saldCart = 0, nome 
            entradas.forEach( 
                (entrada) => {
                    if(entrada.tipo === 0){
                        if(entrada.contaId == 6){
                            saldNegCart = saldNegCart + entrada.valor
                        }
                        totDespesa = totDespesa + entrada.valor
                    }else{
                        if(entrada.contaId === 6){
                            saldCart = saldCart + entrada.valor
                        }
                        totReceita = totReceita + entrada.valor
                    }
                    saldoCont = totReceita - totDespesa

                    modelCategoria.categoria.findAll({
                        order: [['updatedAt', 'DESC']]
                    }).then(function(categorias){
                        var repetiu = 0
                        categorias.forEach(
                            (categoria) =>{                               
                                if(entrada.categoriaId == categoria.id) {
                                    for(var i = 0; i < valorCateg.length; i++){
                                        if(valorCateg[i].nome == categoria.nome){
                                            valorCateg[i].valor = valorCateg[i].valor + entrada.valor
                                            repetiu = 1
                                        } 
                                    }
                                   if(!repetiu){
                                        totValorCateg = totValorCateg + entrada.valor
                                        nome = categoria.nome
                                        valorCateg.push({"tipo" : entrada.tipo, "nome" : nome, "valor" : totValorCateg})
                                        repetiu = 0
                                   } 
                                }
                            },  
                        )  
                        totValorCateg = 0, nome = ''   
                    })
                }
            );
             
            // Saldo por entradas
            modelConta.conta.findAll({
                order: [['updatedAt', 'DESC']]
            }).then(function(contas){
                var totValorContaPos = 0, totValorContaNeg = 0, totValorConta = 0
                contas.forEach(
                    (conta) => {
                        entradas.forEach(
                            (entrada) => {
                                if(conta.id == entrada.contaId){
                                    if(entrada.tipo){
                                        totValorContaPos = totValorContaPos + entrada.valor
                                    }else{
                                        totValorContaNeg = totValorContaNeg + entrada.valor
                                    }                              
                                }                          
                            }
                        )
                        totValorConta = totValorContaPos - totValorContaNeg
                        valorConta.push({"id" : conta.nome, "valor" : totValorConta});
                        totValorConta = 0, totValorContaPos = 0, totValorContaNeg = 0
                    }                    
                )
                saldCart = saldCart - saldNegCart
                res.render('home', {
                    entradas: entradas, saldoCont,
                    totDespesa, totReceita, valorConta,
                    contas: contas, saldCart, valorCateg
                })          
            })  
        })
    })

    router.get('/movimentacao', (req, res) => {
        res.send("Pagina cadastro de movimentação")
    })

    function listarEntradas(res) {
        modelEntrada.entrada.findAll({
            order: [['updatedAt', 'DESC']]
        }).then(function(entradas){
            res.render('entradas', 
                {entradas: entradas}
            )
        })    
    }

/*
 * Rotas para Categorias
 */
    function listarCategorias(res) {
        modelCategoria.categoria.findAll({
            order: [['updatedAt', 'DESC']]
        }).then(function(categorias){
            res.render('admin/categorias', 
                {categorias: categorias}
            )
        })    
    }    
    //lista
    router.get('/categorias/add', (req, res) => {
        res.render("admin/addCategorias")
    })
    //abre formulario
    router.get('/categorias', (req, res) => {
        listarCategorias(res)
        //res.render("admin/categorias")
    })
    //adiciona categoria
    router.post('/categorias/nova', (req, res) => {
        if(req == 'ok'){
            listarCategorias("deu certo")
        }else{
            const {body} = req
            modelCategoria.addCategoria(body, function(erro){
                if (erro) { 
                    return res.send('Houve um erro: ' + erro)
                } 
                res.render("admin/addCategorias", {alert: true})
            }) 
        }
             
    })
    //deleta categoria
    router.get('/deletarCategoria/:id', function(req, res) {
        modelCategoria.categoria.destroy({
            where: {
                id: req.params.id
            }
        }).then(function(){
            listarCategorias(res)
        }).catch(function(error) {
            res.send('Esta Postagem não existe')
        })   
    })

/*
 * Rotas para Contas
 */
    function listarContas(res) {
        modelConta.conta.findAll({
            order: [['updatedAt', 'DESC']]
        }).then(function(contas){
            res.render("admin/contas", {contas: contas})            
        })    
    }
    //lista
    router.get('/conta/add', (req, res) => {
        res.render("admin/addContas")
    })
    router.get('/contas', (req, res) => {
        listarContas(res)
    })
    //adiciona conta
    router.post('/conta/nova', (req, res) => {
        if(req == 'ok'){
            listarCategorias("deu certo")
        }else{
            const {body} = req
            modelConta.addConta(body, function(erro){
                if (erro) { 
                    return res.send('Houve um erro: ' + erro)
                } 
                res.render("admin/addContas", {alert: true})
            }) 
        }
             
    })
    //deleta conta
    router.get('/deletarConta/:id', function(req, res) {
        modelConta.conta.destroy({
            where: {
                id: req.params.id
            }
        }).then(function(){
            listarContas(res)
        }).catch(function(error) {
            res.send('Esta Conta não existe')
        })   
    })

/*
 * Rotas para Entradas
 */
function listarEntradas(res) {
    modelEntrada.entrada.findAll({
        order: [['updatedAt', 'DESC']]
    }).then(function(entradas){
        res.render("admin/entradas", {entradas: entradas})            
    })    
}
//lista
router.get('/entrada/:rOUd', (req, res) => {
    if(req.params.rOUd == 'add-receita'){
        modelConta.conta.findAll({
            order: [['updatedAt', 'DESC']]
        }).then(function(contas, rOUd){
            modelCategoria.categoria.findAll({
                order: [['updatedAt', 'DESC']]
            }).then(function(categorias){
                res.render('admin/addEntradas', 
                    {contas: contas, categorias: categorias, rOUd:1}
                )                
            }) 
        })  
    }else{
        modelConta.conta.findAll({
            order: [['updatedAt', 'DESC']]
        }).then(function(contas, rOUd){
            modelCategoria.categoria.findAll({
                order: [['updatedAt', 'DESC']]
            }).then(function(categorias){
                res.render('admin/addEntradas', 
                    {contas: contas, categorias: categorias, nRouD:1 }
                )                
            })   
        })  
        //res.render("admin/addEntradas")
    }
})
router.get('/entradas', (req, res) => {
    listarEntradas(res)
})
//adiciona entrada
router.post('/entrada/nova', (req, res) => {
    if(req == 'ok'){
        listarEntradas("deu certo")
    }else{
        const {body} = req
        modelEntrada.addEntrada(body, function(erro){
            if (erro) { 
                return res.send('Houve um erro: ' + erro)
            } 
            res.render("admin/addEntradas", {alert: true})
        }) 
    }
         
})
//deleta entrada
router.get('/deletarEntrada/:id', function(req, res) {
    modelEntrada.entrada.destroy({
        where: {
            id: req.params.id
        }
    }).then(function(){
        listarEntradas(res)
    }).catch(function(error) {
        res.send('Esta Entrada não existe')
    })   
})

module.exports = router