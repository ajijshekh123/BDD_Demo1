@smoke @login
Feature: Customer login
  As a registered Demo Web Shop customer
  I want to log in to the website
  So that I can see my account as an authenticated user

  Background:
    Given I open the Demo Web Shop home page

  Scenario: Log in with valid account credentials
    When I log in using the configured account
    Then I should be on the home page as the logged-in user
