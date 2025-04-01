Feature: User Login

  Scenario: User with invalid credentials
    Given The user is on the login page
    When They submit the invalid credentials into the login form
    Then An error message should be displayed

  Scenario: User with valid credentials
    Given The user is on the login page
    When They submit the correct credentials into the login form
    Then They should be redirected to the dashboard
