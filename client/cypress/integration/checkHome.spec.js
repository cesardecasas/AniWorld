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

    

    it('check content',()=>{
        cy.contains('Top upcoming')
        cy.contains('Jujutsu')
        cy.contains('-')
        cy.contains('News')
    })

    it('navigate',()=>{
        cy.get('input[type=search]').type('fate')
        cy.get('button[type=submit]').click()

        cy.contains('Rates')
        cy.contains('Fate/Zero')
        cy.get('.card').children()
            .should('contain', 'Fate/Zero')
            .contains('Details').click()

  
    })

    it('click card',()=>{
        cy.get('.animeCard').children()
            .should('contain', 'Jujutsu')
            .contains('Jujutsu').click()

        cy.contains('Jujutsu')
        cy.contains('Synopsis')
        cy.get('#search').click()

        cy.get('.alert')
    })

})