// __tests__/cart.test.ts
import { useCartStore } from '@/store/cart-store';

// Mock global fetch
global.fetch = jest.fn() as jest.Mock;

describe('Cart Store', () => {
    beforeEach(() => {
        // Reset Zustand store state before each test
        useCartStore.setState({ items: [], isLoading: false });
        jest.clearAllMocks();
    });

    it('should add an item to the cart', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ id: 'real-id-123' }),
        });

        const item = {
            productId: 'prod-1',
            name: 'Test Product',
            price: 100,
            image: 'test.jpg',
            quantity: 1,
            stock: 10,
        };

        await useCartStore.getState().addItem(item);

        const state = useCartStore.getState();
        expect(state.items).toHaveLength(1);
        expect(state.items[0].productId).toBe('prod-1');
        expect(state.items[0].name).toBe('Test Product');
        expect(state.getTotalItems()).toBe(1);
        expect(state.getTotalPrice()).toBe(100);
    });

    it('should update quantity if item already exists', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true }),
        });

        const item = {
            productId: 'prod-1',
            name: 'Test Product',
            price: 100,
            image: 'test.jpg',
            quantity: 1,
            stock: 10,
        };

        // Add initial item
        useCartStore.setState({
            items: [{ ...item, id: 'some-id' }]
        });

        await useCartStore.getState().addItem(item);

        const state = useCartStore.getState();
        expect(state.items).toHaveLength(1);
        expect(state.items[0].quantity).toBe(2);
        expect(state.getTotalPrice()).toBe(200);
    });

    it('should remove an item from the cart', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
        });

        useCartStore.setState({
            items: [{
                id: 'id-1',
                productId: 'prod-1',
                name: 'Test Product',
                price: 100,
                image: 'test.jpg',
                quantity: 1,
                stock: 10,
            }]
        });

        await useCartStore.getState().removeItem('prod-1');

        const state = useCartStore.getState();
        expect(state.items).toHaveLength(0);
    });
});
