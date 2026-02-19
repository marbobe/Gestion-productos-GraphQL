/**
 * @file product.service.test.js
 * @description Suite de pruebas unitarias para ProductService.
 * Utiliza Mocha como test runner, Chai para aserciones y Sinon para mocking.
 * Aisla completamente la base de datos mockeando los métodos de Mongoose.
 */

const { expect } = require('chai');
const sinon = require('sinon');
const { GraphQLError } = require('graphql');

const ProductService = require('../../src/services/product.service');
const Product = require('../../src/models/Product');

describe('ProductService', () => {

    //variables para guardar los mocks
    let saveStub;
    let findStub;

    afterEach(() => {
        sinon.restore();
    });


    // ====================================================
    // GET ALL PRODUCTS (Lectura con Paginación)
    // ====================================================
    describe('getAllProducts', () => {

        it('Debe devolver productos paginados y ordenados', async () => {
            // 1. Mock de la cadena de Mongoose
            // Necesitamos un objeto que tenga .sort, .limit, .skip y que devuelva "this" 
            // para poder seguir encadenando, hasta que al final devuelva los datos.

            const mockProducts = [{ name: 'P1' }, { name: 'P2' }];

            // Creamos un objeto "Query Falso"
            const mockQuery = {
                sort: sinon.stub().returnsThis(),  // Devuelve el mismo objeto (encadenable)
                limit: sinon.stub().returnsThis(), // Devuelve el mismo objeto
                skip: sinon.stub().resolves(mockProducts) // El último devuelve la promesa con datos
            };

            // Cuando llamen a Product.find, devolvemos nuestro Query Falso
            sinon.stub(Product, 'find').returns(mockQuery);

            // 2. Ejecución
            const args = { limit: 10, offset: 5, sortBy: 'price_asc' };
            const result = await ProductService.getAllProducts(args);

            // 3. Verificación
            expect(result).to.deep.equal(mockProducts);

            // Verificamos que se llamó a todo correctamente
            expect(Product.find.calledOnce).to.be.true;
            expect(mockQuery.sort.calledWith({ price: 1 })).to.be.true; // Verificamos orden
            expect(mockQuery.limit.calledWith(10)).to.be.true;          // Verificamos limit
            expect(mockQuery.skip.calledWith(5)).to.be.true;            // Verificamos offset
        });

        it('Debe usar valores por defecto si no se envía paginación', async () => {
            const mockQuery = {
                sort: sinon.stub().returnsThis(),
                limit: sinon.stub().returnsThis(),
                skip: sinon.stub().resolves([])
            };
            sinon.stub(Product, 'find').returns(mockQuery);

            // Llamamos sin argumentos
            await ProductService.getAllProducts({});

            // Verificamos los defaults (50 y 0)
            expect(mockQuery.limit.calledWith(50)).to.be.true;
            expect(mockQuery.skip.calledWith(0)).to.be.true;
        });
    });

    // ====================================================
    // GET PRODUCT BY ID (Lectura individual)
    // ====================================================
    describe('getProductById', () => {

        it('Debe devolver el producto si existe', async () => {
            const mockProduct = { name: 'Existe', price: 10 };

            //se mockea Product.findById
            sinon.stub(Product, 'findById').resolves(mockProduct);

            const result = await ProductService.getProductById('123');

            expect(result.name).to.equal('Existe');
        });

        it('Debe lanzar NOT_FOUND si el producto no existe (null)', async () => {
            //simulamos respuesta null de mongoose
            sinon.stub(Product, 'findById').resolves(null);

            try {
                await ProductService.getProductById('123');
                expect.fail('Debería haber lanzado NOT_FOUND');
            } catch (error) {
                expect(error.extensions.code).to.equal('NOT_FOUND');
            }
        });
    });

    // ====================================================
    // SEARCH BY NAME (Búsqueda difusa)
    // ====================================================
    describe('searchByName', () => {

        it('Debe buscar usando Regex si se envía un nombre', async () => {
            const mockResult = [{ name: 'Teclado' }];
            sinon.stub(Product, 'find').resolves(mockResult);

            const result = await ProductService.searchByName('Teclado');

            expect(result).to.deep.equal(mockResult);

            // Verificamos que construyó la query con regex
            expect(Product.find.calledOnce).to.be.true;
            const args = Product.find.firstCall.args[0];
            expect(args.name.$regex).to.equal('Teclado');
        });

        it('Debe devolver todos los productos si no se envía nombre', async () => {
            sinon.stub(Product, 'find').resolves([]);

            await ProductService.searchByName(null);

            expect(Product.find.calledWith({})).to.be.true;
        });
    });

    // ====================================================
    // CREATE PRODUCT (Escritura)
    // ====================================================
    describe('createProduct', () => {

        it('Debe guardar un producto si los datos son válidos', async () => {
            //1. PREPARACIÓN (arrange)
            const inputData = { name: 'Test', price: 100, stock: 10 };
            //simulamos comprtamiento de mongoose
            const mockResult = { ...inputData, _id: 'mockId123' };
            //se intercepta el prototipo
            saveStub = sinon.stub(Product.prototype, 'save').resolves(mockResult);

            //2. EJECUCION (act)
            const result = await ProductService.createProduct(inputData);

            //3. VERIFICACIÓN (Assert)
            expect(saveStub.calledOnce).to.be.true;
            expect(result._id).to.equal('mockId123');
            expect(result.name).to.equal('Test');
        });

        it('Debe lanzar error BAD_USER_INPUT si el precio es negativo', async () => {
            const inputData = { name: 'Test', price: -50, stock: 10 };

            try {
                await ProductService.createProduct(inputData);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceof(GraphQLError);
                expect(error.extensions.code).to.equal('BAD_USER_INPUT');
                expect(error.message).to.include('precio');
            }
        });

        it('Debe lanzar ALREADY_EXISTS si hay un duplicado en BD', async () => {
            const inputData = { name: 'Duplicado', price: 100, stock: 10 };

            // Creamos un error falso igual al de Mongo
            const mongoError = new Error('Duplicate key');
            mongoError.code = 11000;

            // Al guardar causa error
            sinon.stub(Product.prototype, 'save').rejects(mongoError);

            try {
                await ProductService.createProduct(inputData);
                expect.fail('Debería haber lanzado error de duplicado');
            } catch (error) {
                expect(error).to.be.instanceOf(GraphQLError);
                expect(error.extensions.code).to.equal('ALREADY_EXISTS');
            }
        });


    });

    // ====================================================
    // UPDATE PRODUCT (Modificación)
    // ====================================================
    describe('updateProduct', () => {

        it('Debe actualizar un producto si existe y los datos son válidos', async () => {
            const updateData = { price: 200 };
            const mockUpdatedProduct = { _id: '123', name: 'Test', price: 200 };

            // Mockeamos findByIdAndUpdate
            // Mongoose devuelve el objeto nuevo porque usamos { new: true } en el servicio
            sinon.stub(Product, 'findByIdAndUpdate').resolves(mockUpdatedProduct);

            const result = await ProductService.updateProduct('123', updateData);

            expect(result.price).to.equal(200);
            expect(Product.findByIdAndUpdate.calledWith('123', updateData, { new: true })).to.be.true;
        });

        it('Debe lanzar NOT_FOUND si el producto a actualizar no existe', async () => {
            const updateData = { price: 200 };

            sinon.stub(Product, 'findByIdAndUpdate').resolves(null);

            try {
                await ProductService.updateProduct('123', updateData);
                expect.fail('Debería haber lanzado NOT_FOUND');
            } catch (error) {
                expect(error.extensions.code).to.equal('NOT_FOUND');
            }
        });

        it('Debe lanzar BAD_USER_INPUT si intentamos actualizar con precio negativo', async () => {
            const updateData = { price: -50 }; // Dato inválido

            // No hace falta mockear Mongoose aquí, porque el validador salta ANTES de llamar a la BD
            // Pero por seguridad, podemos espiar que NO se llame a la BD
            const spy = sinon.spy(Product, 'findByIdAndUpdate');

            try {
                await ProductService.updateProduct('123', updateData);
                expect.fail('Debería haber lanzado error de validación');
            } catch (error) {
                expect(error.extensions.code).to.equal('BAD_USER_INPUT');
                expect(spy.called).to.be.false; // Aseguramos que nunca tocó la base de datos
            }
        });
    });

    // ====================================================
    // DELETE PRODUCT (Eliminación)
    // ====================================================
    describe('deleteProduct', () => {

        it('Debe devolver producto eliminado si existe', async () => {
            const mockProduct = { name: 'Existe', price: 10 };

            sinon.stub(Product, 'findByIdAndDelete').resolves(mockProduct);

            const result = await ProductService.deleteProduct('123');

            expect(result.name).to.equal('Existe');
        });

        it('Debe lanzar NOT_FOUND si el producto no existe (null)', async () => {

            sinon.stub(Product, 'findByIdAndDelete').resolves(null);

            try {
                await ProductService.deleteProduct('123');
                expect.fail('Debería haber lanzado NOT_FOUND');
            } catch (error) {
                expect(error.extensions.code).to.equal('NOT_FOUND');
            }
        });
    })

});