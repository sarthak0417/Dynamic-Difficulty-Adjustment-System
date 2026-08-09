# Dynamic Difficulty Tetris

## Overview

Dynamic Difficulty Tetris is a browser-based Tetris project that uses a
**Dynamic Difficulty Adjustment (DDA)** engine to adapt the game's fall
speed according to measured player performance.

The project was developed as an internship project prototype with an
emphasis on real-time adaptation, performance monitoring, experiment
logging, and CSV-based analysis.

## Objectives

-   Build a functional Tetris game in the browser.
-   Monitor player performance during gameplay.
-   Use a DDA engine to adjust difficulty automatically.
-   Record gameplay and DDA decisions as experiment data.
-   Export the recorded data to CSV.
-   Analyze the behavior of the adaptive system.

## Technology

-   HTML --- interface structure
-   CSS --- interface styling and responsive layout
-   JavaScript --- Tetris game, performance monitoring, DDA, and logging
-   HTML5 Canvas --- game rendering
-   CSV --- experiment data export

No server or database is required for the current prototype.

## Project Structure

``` text
Dynamic-Difficulty-Tetris/
├── index.html
├── style.css
├── game.js
├── dda.js
├── logger.js
├── README.md
├── experiment-data.csv
├── Project-Report.pdf
└── IBM-Internship-Presentation.pptx
```

## How to Run

1.  Keep the HTML, CSS, and JavaScript files in the same directory.
2.  Open `index.html` in a modern web browser.
3.  Press **Start Game**.
4.  Use the controls below.

## Controls

  Key     Action
  ------- ------------
  ← / →   Move piece
  ↑       Rotate
  ↓       Soft drop
  Space   Hard drop

## DDA Concept

The game continuously monitors gameplay and calculates a performance
value on a 0--100 scale.

The implemented difficulty levels are internal DDA states:

-   Easy --- 0.80× fall-speed multiplier
-   Normal --- 1.00×
-   Hard --- 1.25×
-   Expert --- 1.50×

These are **not separate player-selectable modes**. The DDA changes them
automatically while the player is playing.

The implementation evaluates performance periodically and uses
thresholds to decide whether to increase, decrease, or maintain
difficulty.

## Performance Monitoring

The performance monitor uses gameplay information including:

-   score
-   lines cleared
-   pieces placed
-   elapsed time
-   board stack height

The resulting performance score is constrained to 0--100%.

## Data Logging

The logger records periodic observations containing:

-   Session ID
-   Timestamp
-   Time in seconds
-   Score
-   Lines
-   Pieces placed
-   Raw performance
-   Smoothed performance
-   Difficulty
-   Fall speed
-   DDA decision

The **Export Data** control exports the recorded session as CSV.

## Final Test Session

The supplied final CSV contains **one gameplay session** with **156
logged observations**.

Key final-session results:

  Metric                                      Result
  ---------------------------- ---------------------
  Duration                       311.52 s (5.19 min)
  Final score                                   4200
  Lines cleared                                   23
  Pieces placed                                   25
  Starting performance                        40.00%
  Minimum performance                         18.80%
  Maximum performance                         54.37%
  Final performance                           45.74%
  Difficulty states observed            Easy, Normal

In this final session, the DDA changed from **Normal to Easy at about
14.01 seconds** after performance fell to 32%. It then remained at Easy
for the remainder of the session. The final record was marked **Game
Over**.

The final CSV therefore demonstrates that the DDA responded to declining
performance by reducing difficulty. It does **not**, by itself,
establish that DDA improves player outcomes; that would require a larger
controlled study or comparison.

## Experimental Interpretation

The final session is best treated as a **demonstration/validation
session**, not as a statistically conclusive experiment. It shows that:

1.  gameplay data was captured successfully;
2.  performance changed during play;
3.  the DDA detected low performance;
4.  the DDA reduced difficulty;
5.  the decision and resulting difficulty were recorded in the CSV.

## Limitations

-   The final supplied dataset contains one session.
-   There is no independent baseline/control condition in the supplied
    final CSV.
-   The project measures game performance proxies rather than subjective
    player experience.
-   The current performance model is heuristic and can be improved with
    additional testing.
-   A larger study would be needed to make statistical claims about
    effectiveness.

## Future Improvements

-   Test multiple players and multiple sessions.
-   Add a controlled baseline condition without adaptive changes.
-   Tune performance thresholds using collected data.
-   Add richer gameplay metrics such as misdrops, reaction time, and
    placement efficiency.
-   Add automated statistical analysis and experiment dashboards.
-   Study player engagement and perceived difficulty in addition to game
    metrics.

## Deliverables

The accompanying project package includes the source code, final
experiment CSV, project report, and internship presentation.
