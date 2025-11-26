
const { expect } = require('chai');
const sinon = require('sinon');
const Product = require('../../models/Product');
const schema = require('../../schema/schema');

const mutationFields = schema._mutationType.getFields();
const addProductResolver = mutationFields.addProduct.resolve;

const mockSavedProduct = {
    id: 'a1b2c3d4e5f6g7h8i9j0',
    name: 'Teclado Mock',
    price: 50.00,
    stock: 10,
    createdAt: new Date()
};



describe('Mutaciones de Productos', () => {

    let saveStub;


    afterEach(() => {

        if (saveStub && saveStub.restore) {
            saveStub.restore();
        }
    });


    it('Debe crear un producto y devolver el objeto guardado', async () => {
        saveStub = sinon.stub(Product.prototype, 'save').resolves(mockSavedProduct);

        const args = {
            name: 'Teclado Mock',
            description: 'Para pruebas',
            price: 50.00,
            stock: 10
        };

        const result = await addProductResolver(null, args);


        // Verificamos que el método .save() simulado haya sido llamado UNA VEZ
        expect(saveStub.calledOnce).to.be.true;

        // Verificamos que el resultado devuelto sea el objeto que simulamos
        expect(result.name).to.equal(args.name);
        expect(result.id).to.equal(mockSavedProduct.id);
    });

    it('Debe fallar si la base de datos lanza un error (ej. duplicado)', async () => {
        const mockError = new Error('E1100 Duplicate key error');
        saveStub = sinon.stub(Product.prototype, 'save').rejects(mockError);

        const args = {
            name: 'Producto Duplicado', description: 'Causa Error', price: 10.00, stock: 1
        };

        try {
            await addProductResolver(null, args);
            expect.fail('El resolver debería lanzar un error por producto duplicado')
        } catch (error) {
            // Verificación del error
            expect(error.message).to.include('E1100');
            expect(saveStub.calledOnce).to.be.true;
        }
    })

});