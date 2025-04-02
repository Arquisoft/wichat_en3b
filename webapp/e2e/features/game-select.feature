Feature: Game Select

  Scenario: User logged in the application
    Given The user is on the dashboard
    When They Click on "Play a game now"
    Then They can choose the gamemode they want to play