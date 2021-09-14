///<reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
  })

describe('checkContent',()=>{

    beforeEach(()=>{
        cy.visit('http://localhost:3000/')
    })

    

    it('has title',()=>{
        cy.contains('New Realeases')
    })

    it('directs to anime',()=>{
        cy.get('btn').click()
        cy.contains('Rating')
        cy.contains('Premiered')
        cy.contains('Look for songs')
    })

})