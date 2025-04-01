Feature: Registering a new user

Scenario: The user is not registered in the site
  Given An unregistered user
  When I fill the data in the form and press submit
  Then A confirmation message should be shown in the screen


# Uncomment this when the backend is ready to handle the case of registering
# twice with the same user 

# Scenario: The user is already registered in the site
  # Given A registered user
  # When I fill the data in the form and press submit
  # Then An error message should be shown in the screen

