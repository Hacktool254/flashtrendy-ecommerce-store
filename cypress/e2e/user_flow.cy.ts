// cypress/e2e/user_flow.cy.ts
describe('Main User Flow', () => {
    beforeEach(() => {
        // We might want to clear cookies or local storage here
        cy.clearLocalStorage();
    });

    it('should allow a user to browse and add a product to cart', () => {
        // 1. Visit Homepage
        cy.visit('/');
        cy.contains('FlashTrendy').should('be.visible');

        // 2. Navigate to Products
        // Assuming there's a link to products or a "Shop Now" button
        cy.get('nav, header').contains('Products', { matchCase: false }).click({ force: true });
        cy.url().should('include', '/products');

        // 3. View Product Details
        // Click on the first product card
        cy.get('[data-testid="product-card"]').first().click();
        cy.url().should('include', '/products/');

        // 4. Add to Cart
        cy.get('button').contains('Add to Cart', { matchCase: false }).click();

        // Check for success notification (assuming toast)
        cy.contains(/added to cart/i).should('be.visible');

        // 5. Navigate to Cart
        cy.get('header').find('a[href="/cart"]').click();
        cy.url().should('include', '/cart');

        // 6. Verify item in cart
        cy.get('[data-testid="cart-item"]').should('have.length', 1);
    });
});
