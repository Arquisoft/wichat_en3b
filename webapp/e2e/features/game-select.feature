Feature: Game Select

  Scenario: User logged in the application
    Given The user is on the dashboard
    When They Click on "Play a game now"
    Then They can choose the gametopic they want to play

  Scenario: User in the game topic selection window
    Given The user is on the game topic selection window and has chosen Custom
    When They search for specific topics
    Then They can choose that topic and go to the next screen

  Scenario: User in the game mode screen
    Given The user is the the game mode selection screen
    When They choose any game mode
    Then They are able to play a game of that gamemode