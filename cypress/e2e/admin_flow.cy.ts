// cypress/e2e/admin_flow.cy.ts
describe('Admin Flow', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        // We should mock the login or navigate to login page
    });

    it('should allow an admin to login and view analytics', () => {
        // 1. Visit Login Page
        cy.visit('/login');

        // 2. Perform Login (Assuming admin credentials)
        // In a real test, we might use environment variables
        cy.get('input[name="email"]').type('admin@example.com');
        cy.get('input[name="password"]').type('adminpassword');
        cy.get('button[type="submit"]').click();

        // 3. Verify Admin Dashboard
        cy.url().should('include', '/admin');
        cy.contains('Dashboard').should('be.visible');

        // 4. Navigate to Analytics
        cy.get('nav').contains('Analytics').click();
        cy.url().should('include', '/admin/analytics');
        cy.contains('Sales Performance').should('be.visible');

        // 5. Navigate to Product Management
        cy.get('nav').contains('Products').click();
        cy.url().should('include', '/admin/products');
        cy.contains('Add Product').should('be.visible');
    });
});
