Feature: Settings Navigation

    Scenario: User access to settings
        Given A user enters the application
        When They click the settings button
        Then The user is shown the settings page
    
    Scenario: User wants to change the language
        Given A user in the settings page
        When They change the language in the Language comboBox
        Then The language of the application is changed
    
    Scenario: The user wants to change the theme of the application
        Given A user in the settings page
        When They choose a theme in the theme selector
        Then The application's theme is changed

    Scenario: The user wants to change the AI model used
        Given A user in the settings page
        When They click on advanced settings
        Then They can change the AI Model used