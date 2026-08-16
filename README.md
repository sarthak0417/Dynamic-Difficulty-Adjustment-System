# Dynamic Difficulty Tetris

A browser-based **Tetris game with Dynamic Difficulty Adjustment (DDA)** that monitors player performance in real time and automatically adapts the falling speed of the pieces.

The project was developed as an **internship project prototype** to demonstrate real-time adaptive game difficulty, player-performance monitoring, experiment logging, visualization, and CSV-based analysis.

---

## Project Overview

Traditional games commonly use fixed difficulty levels or require players to manually choose a difficulty before playing.

**Dynamic Difficulty Tetris** uses a different approach.

While the player is playing, the game continuously measures gameplay performance. A **Dynamic Difficulty Adjustment (DDA) engine** processes these measurements and automatically increases, decreases, or maintains the game's difficulty.

Difficulty is controlled by changing the **fall-speed multiplier** of the Tetris pieces.

The application also records DDA decisions and gameplay statistics so that the behaviour of the adaptive system can be visualized and analyzed after a session.

---

## Objectives

The main objectives of the project are:

* Build a functional browser-based Tetris game.
* Monitor player performance continuously during gameplay.
* Calculate a real-time performance score.
* Smooth performance measurements to reduce sudden fluctuations.
* Automatically adjust game difficulty using a DDA algorithm.
* Display the current difficulty and performance to the player.
* Record gameplay and DDA decisions as experiment data.
* Visualize gameplay metrics directly in the application.
* Export experiment data as CSV.
* Analyze how the adaptive system responds to changing player performance.

---

## Technologies Used

| Technology   | Purpose                                             |
| ------------ | --------------------------------------------------- |
| HTML5        | Application and interface structure                 |
| CSS3         | Styling and responsive layout                       |
| JavaScript   | Tetris logic, DDA, monitoring, logging and graphing |
| HTML5 Canvas | Tetris board and experiment graph rendering         |
| CSV          | Experiment data export                              |

The current prototype operates completely inside the browser.

**No server, backend, framework, or database is required.**

---

## Project Structure

```text
Dynamic-Difficulty-Tetris/
│
├── index.html
├── style.css
├── game.js
├── dda.js
├── logger.js
├── 1.png
├── README.md
├── experiment-data.csv
├── Project-Report.pdf
```

### `index.html`

Defines the main application interface:

* Game canvas
* Score
* Lines
* Level
* Current difficulty
* Fall speed
* DDA Monitor
* Performance progress bar
* Start, Pause and Restart controls
* Keyboard instructions
* Experiment Data section
* Graph metric selectors
* CSV export
* Graph download

### `style.css`

Controls the appearance of the application:

* Page background
* Game container
* Information panel
* Statistics
* DDA monitor
* Performance bar
* Buttons
* Experiment section
* Graph container
* Game-over interface
* Responsive mobile layout

### `game.js`

Implements the main Tetris game and connects it to the DDA system.

It handles:

* 10 × 20 Tetris board
* Tetromino generation
* Collision detection
* Movement
* Rotation
* Soft drop
* Hard drop
* Piece locking
* Line clearing
* Scoring
* Level progression
* Game loop
* Pause and resume
* Restart
* Game over
* DDA integration
* Experiment graph rendering
* Graph downloading
* CSV export integration

### `dda.js`

Implements:

* Player performance monitoring
* Performance calculation
* EWMA performance smoothing
* Difficulty thresholds
* Difficulty transitions
* Adaptive fall-speed calculation

### `logger.js`

Implements:

* Session creation
* Periodic gameplay observations
* Raw performance recording
* Smoothed performance recording
* Difficulty recording
* DDA decision recording
* Final game-over record
* CSV generation and download

---

# How to Run

1. Keep all HTML, CSS, JavaScript, and image files in the project directory.
2. Open `index.html` using a modern web browser.
3. Click **Start Game**.
4. Play Tetris using the keyboard controls.
5. Observe the DDA Monitor while playing.
6. Use the Experiment Data section to inspect recorded gameplay.
7. Export the session as CSV when required.

No installation or build process is necessary.

---

# Game Controls

| Key   | Action     |
| ----- | ---------- |
| ←     | Move left  |
| →     | Move right |
| ↑     | Rotate     |
| ↓     | Soft drop  |
| Space | Hard drop  |

The interface additionally provides:

* **Start Game / End Game**
* **Pause / Resume**
* **Restart**

---

# Tetris Scoring

Points are awarded according to the number of lines cleared simultaneously.

| Lines Cleared | Base Score |
| ------------: | ---------: |
|             1 |        100 |
|             2 |        300 |
|             3 |        500 |
|             4 |        800 |

The base score is multiplied by the current game level.

The game level increases after every **10 cleared lines**.

---

# Dynamic Difficulty Adjustment

The central feature of the project is its **Dynamic Difficulty Adjustment (DDA) engine**.

The player does not manually choose Easy, Normal, Hard, or Expert.

Instead, these are **internal adaptive states** controlled automatically by the DDA engine.

## Difficulty States

| Difficulty | Fall-Speed Multiplier |
| ---------- | --------------------: |
| Easy       |                 0.80× |
| Normal     |                 1.00× |
| Hard       |                 1.25× |
| Expert     |                 1.50× |

Every game begins at:

```text
Normal — 1.00×
```

The DDA can then move upward or downward through the available states according to measured player performance.

---

# Performance Monitoring

The performance monitor uses gameplay information including:

* Score
* Lines cleared
* Pieces placed
* Elapsed time
* Current stack height

The resulting performance score is constrained to:

```text
0–100%
```

Higher values represent stronger measured gameplay performance.

---

## Line Performance Component

The line component is calculated using:

```text
Line Score = min(100, Lines × 5)
```

Weight:

```text
35%
```

---

## Score-Rate Component

The player's scoring rate is calculated relative to elapsed gameplay time.

```text
Score Rate = Score / Elapsed Time

Score Component = min(100, Score Rate × 2)
```

Weight:

```text
25%
```

---

## Survival / Stack Component

The height of the current Tetris stack is used as a measure of board danger.

```text
Survival Component =
    max(0, 100 - Stack Height × 5)
```

Weight:

```text
40%
```

---

## Combined Raw Performance

The three components are combined as:

```text
Raw Performance =
    (Line Score × 0.35)
  + (Score Component × 0.25)
  + (Survival Component × 0.40)
```

The final value is restricted to the range:

```text
0–100
```

---

# Performance Smoothing

Gameplay performance can fluctuate quickly.

To prevent the DDA from reacting excessively to short-term changes, the project uses an **Exponentially Weighted Moving Average (EWMA)**.

The smoothing factor is:

```text
α = 0.20
```

Smoothed performance is calculated as:

```text
Smoothed Performance =
    α × Raw Performance
    + (1 - α) × Previous Smoothed Performance
```

The DDA uses this **smoothed performance** when deciding whether difficulty should change.

---

# DDA Decision Logic

The DDA evaluates the player approximately every:

```text
2000 ms
```

The implemented decision rules are:

| Smoothed Performance | DDA Decision        |
| -------------------- | ------------------- |
| ≥ 75%                | Increase Difficulty |
| 36%–74%              | Maintain Difficulty |
| ≤ 35%                | Decrease Difficulty |

Difficulty changes by one internal state at a time.

For example:

```text
Easy → Normal → Hard → Expert
```

or:

```text
Expert → Hard → Normal → Easy
```

The system cannot increase beyond Expert or decrease below Easy.

---

# Difficulty Cooldown

A cooldown prevents difficulty from changing too rapidly.

After a difficulty change, the system waits:

```text
4000 ms
```

before another difficulty transition is permitted.

This improves the stability of the adaptive behaviour.

---

# Adaptive Fall Speed

The base fall interval is:

```text
1000 ms
```

The current interval is calculated as:

```text
Fall Interval =
    Base Interval / Difficulty Multiplier
```

Therefore:

| Difficulty | Multiplier | Approx. Fall Interval |
| ---------- | ---------: | --------------------: |
| Easy       |      0.80× |               1250 ms |
| Normal     |      1.00× |               1000 ms |
| Hard       |      1.25× |                800 ms |
| Expert     |      1.50× |                667 ms |

Higher difficulty therefore causes pieces to fall more quickly.

---

# DDA Monitor

The application contains a real-time **DDA Monitor**.

During gameplay, it displays:

* Current performance percentage
* Performance progress bar
* Current difficulty
* Current fall-speed multiplier
* DDA status

This makes the behaviour of the adaptive system visible while the game is running.

---

# Experiment Data Logging

The game records observations throughout each gameplay session.

Every experiment record contains:

* Session ID
* Timestamp
* Time in seconds
* Score
* Lines cleared
* Pieces placed
* Raw performance
* Smoothed performance
* Difficulty
* Fall speed
* DDA decision

Possible recorded decisions include:

```text
Increase Difficulty
Decrease Difficulty
Maintain Difficulty
Game Over
```

A final record is added when the game ends.

---

# Experiment Data Visualization

The application contains a built-in graphing system for inspecting the recorded experiment data.

Four metrics can be visualized.

## Lines Over Time

Displays the cumulative number of cleared lines during the gameplay session.

A rising graph indicates continued progress as additional lines are cleared.

## Performance Over Time

Displays the player's measured performance percentage throughout the session.

Unlike score and lines, performance can move both upward and downward because it responds to several gameplay factors.

This graph is particularly important for understanding why the DDA changes difficulty.

## Score Over Time

Displays cumulative game score against elapsed time.

Because score accumulates during gameplay, the graph generally increases throughout the session.

## Fall Speed Over Time

Displays the DDA-controlled fall-speed multiplier.

Changes in this graph directly represent difficulty transitions.

For example:

```text
0.80× → Easy
1.00× → Normal
1.25× → Hard
1.50× → Expert
```

The graph can therefore be used to visually verify when the DDA modified difficulty.

---

# Graph Download

The currently selected experiment graph can be downloaded using:

**Download Graph**

The graph is exported as a PNG image.

Available graph types are:

* Score
* Lines
* Performance
* Fall Speed

This allows experiment results to be included in reports, presentations, and further analysis.

---

# CSV Export

The complete experiment session can be exported using:

**Export CSV**

The generated CSV contains:

```text
Session ID
Timestamp
Time (seconds)
Score
Lines
Pieces Placed
Raw Performance
Smoothed Performance
Difficulty
Fall Speed
DDA Decision
```

The CSV can be opened using spreadsheet software or analyzed using tools such as Python or R.

---

# Final Demonstration Session

The latest supplied experiment represents a substantially longer gameplay session.

The CSV contains:

```text
486 logged observations
```

with a total duration of:

```text
973.47 seconds
≈ 16.22 minutes
```

## Final Session Results

| Metric                        |                     Result |
| ----------------------------- | -------------------------: |
| Logged observations           |                        486 |
| Duration                      |             973.47 seconds |
| Approximate duration          |              16.22 minutes |
| Final score                   |                     79,400 |
| Lines cleared                 |                        109 |
| Pieces placed recorded        |                         33 |
| Starting smoothed performance |                     40.00% |
| Minimum smoothed performance  |                     32.00% |
| Maximum smoothed performance  |                     91.77% |
| Final smoothed performance    |                     66.00% |
| Lowest difficulty             |                       Easy |
| Highest difficulty            |                     Expert |
| Difficulty states observed    | Easy, Normal, Hard, Expert |

---

# Observed DDA Behaviour

The final session demonstrates both **difficulty reduction and difficulty increase**.

The game initially started at:

```text
Normal — 1.00×
```

At approximately:

```text
6.00 seconds
```

smoothed performance reached:

```text
32.00%
```

Because this was below the DDA's 35% lower threshold, the system recorded:

```text
Decrease Difficulty
```

and changed:

```text
Normal → Easy
1.00× → 0.80×
```

The player later demonstrated substantially stronger measured performance.

At approximately:

```text
220.40 seconds
```

performance reached approximately:

```text
75.90%
```

and the DDA increased difficulty:

```text
Easy → Normal
0.80× → 1.00×
```

At approximately:

```text
224.40 seconds
```

performance remained high at approximately:

```text
77.26%
```

and difficulty increased again:

```text
Normal → Hard
1.00× → 1.25×
```

At approximately:

```text
228.42 seconds
```

performance was approximately:

```text
79.70%
```

and the system increased difficulty to its maximum state:

```text
Hard → Expert
1.25× → 1.50×
```

The session subsequently remained at **Expert** difficulty through the end of the recorded gameplay.

The final record was marked:

```text
Game Over
```

---

# Difficulty Transition Summary

The final demonstration therefore produced the following overall adaptive sequence:

```text
Normal
  ↓
Easy
  ↓
Normal
  ↓
Hard
  ↓
Expert
```

More precisely, the first transition was a difficulty reduction:

```text
Normal → Easy
```

followed later by progressive increases:

```text
Easy → Normal → Hard → Expert
```

This is important because the session demonstrates **both directions of adaptation**.

The system reduced difficulty when measured performance was low and increased difficulty when measured performance became high.

---

# Interpretation of the Performance Graph

The performance graph shows substantially different behaviour from cumulative score and line graphs.

Performance begins relatively low and initially drops enough to trigger the Easy state.

It then improves considerably during the session and eventually crosses the upper DDA threshold.

After reaching the higher-performance region, the system progressively increases difficulty until Expert is reached.

Performance continues to fluctuate afterward rather than increasing continuously.

This behaviour is expected because the performance metric considers multiple gameplay measurements rather than simply accumulating points.

The final smoothed performance was approximately:

```text
66.00%
```

which falls inside the DDA's maintain range.

As a result, the system could remain at its existing difficulty rather than making another transition.

---

# Interpretation of the Fall-Speed Graph

The fall-speed graph provides a direct visualization of DDA behaviour.

It begins at:

```text
1.00×
```

and quickly drops to:

```text
0.80×
```

when the DDA detects low performance.

Later, as performance improves, the multiplier progresses through:

```text
0.80×
→ 1.00×
→ 1.25×
→ 1.50×
```

It then remains at:

```text
1.50×
```

for the remainder of the session.

This graph provides clear visual evidence that the DDA engine changed the game's fall speed in response to measured performance.

---

# Experimental Interpretation

The final demonstration session verifies several important behaviours of the prototype.

It demonstrates that:

1. Gameplay data can be collected continuously.
2. Score and line progression can be recorded over time.
3. Raw and smoothed performance can be calculated.
4. Performance can both increase and decrease during gameplay.
5. The DDA can detect low performance.
6. The DDA can decrease difficulty.
7. The DDA can detect high performance.
8. The DDA can progressively increase difficulty.
9. All four implemented difficulty states can be reached.
10. Difficulty changes are reflected in the fall-speed multiplier.
11. DDA decisions are recorded in the experiment CSV.
12. Experiment results can be visualized directly in the application.
13. Graphs can be downloaded for reporting and analysis.
14. Complete experiment data can be exported as CSV.

The session therefore provides a useful **functional validation of the DDA mechanism**.

It demonstrates that the implemented adaptive system responds in both directions according to its configured performance thresholds.

---

# Important Experimental Limitation

Although the final session demonstrates that the algorithm functions as designed, it should **not be interpreted as proof that DDA improves player performance or player experience**.

The experiment currently demonstrates:

```text
Player behaviour
        ↓
Performance measurement
        ↓
EWMA smoothing
        ↓
Threshold evaluation
        ↓
DDA decision
        ↓
Difficulty adjustment
        ↓
Fall-speed change
        ↓
Experiment logging
```

A larger controlled experiment would be required to determine whether adaptive difficulty produces better outcomes than fixed difficulty.

---

# Current Limitations

The current prototype has several limitations:

* The supplied demonstration data represents a single gameplay session.
* There is no independent fixed-difficulty control condition.
* The performance formula is heuristic rather than experimentally calibrated.
* DDA thresholds are manually selected.
* Only four difficulty states are implemented.
* Difficulty adaptation currently focuses on piece fall speed.
* Player experience and perceived difficulty are not directly measured.
* The project does not currently use persistent server-side storage.
* Additional participants and sessions would be required for statistical conclusions.

---

# Future Improvements

Potential improvements include:

* Test the game with multiple participants.
* Record multiple sessions for each player.
* Add a fixed-difficulty control version.
* Compare adaptive and non-adaptive gameplay.
* Tune DDA thresholds using larger datasets.
* Experiment with different EWMA smoothing factors.
* Add more sophisticated performance metrics.
* Measure misdrops.
* Measure placement efficiency.
* Measure reaction time.
* Analyze board holes and surface roughness.
* Add player questionnaires.
* Measure perceived difficulty.
* Measure engagement and enjoyment.
* Store experiment data persistently.
* Create automated experiment reports.
* Add statistical analysis tools.
* Compare multiple DDA algorithms.
* Investigate machine-learning-based difficulty adaptation.

---

# Project Deliverables

The project package includes:

* Complete HTML source
* Complete CSS source
* Tetris game logic
* Dynamic Difficulty Adjustment engine
* Performance monitoring system
* Experiment logger
* Real-time DDA Monitor
* Experiment visualization
* Score graph
* Lines graph
* Performance graph
* Fall-speed graph
* PNG graph download
* CSV experiment export
* Final experiment dataset
* Project documentation
* Project report
* Internship presentation

---

# Conclusion

**Dynamic Difficulty Tetris** demonstrates the implementation of a real-time adaptive difficulty system within a browser-based game.

The project combines a functional Tetris implementation with player-performance monitoring, EWMA smoothing, threshold-based difficulty decisions, adaptive fall-speed control, experiment logging, real-time visualization, graph downloading, and CSV export.

The latest demonstration session provides a particularly clear example of the adaptive behaviour.

The game initially reduced difficulty from **Normal to Easy** when measured performance became low. As performance subsequently improved, the DDA progressively increased difficulty through **Normal, Hard, and Expert**.

The recorded sequence:

```text
Normal → Easy → Normal → Hard → Expert
```

demonstrates that the DDA engine can respond to both declining and improving measured performance.

The project therefore provides a functional foundation for further experimentation with **Dynamic Difficulty Adjustment and adaptive game systems**.
