// cypress/e2e/smoke.cy.ts
describe('Smoke Test', () => {
    it('should load the homepage', () => {
        cy.visit('/');
        cy.contains('FlashTrendy').should('be.visible');
    });
});
