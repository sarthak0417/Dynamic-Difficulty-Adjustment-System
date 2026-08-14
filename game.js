
// ============================================
// DYNAMIC DIFFICULTY TETRIS
// ============================================


// ============================================
// CANVAS
// ============================================

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


// ============================================
// BOARD
// ============================================

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

let board =
    createBoard();


// ============================================
// GAME STATE
// ============================================

let score = 0;
let lines = 0;
let piecesPlaced = 0;
let level = 1;

let gameRunning = false;
let gameOver = false;
let gamePaused = false;

let dropCounter = 0;
let lastTime = 0;

let dropInterval = 1000;


// ============================================
// DDA
// ============================================

const dda =
    new DDAEngine();


// ============================================
// PLAYER
// ============================================

let player = {

    x: 0,
    y: 0,
    matrix: null

};


// ============================================
// TETROMINOES
// ============================================

const PIECES = {

    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],

    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],

    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],

    O: [
        [1, 1],
        [1, 1]
    ],

    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],

    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],

    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ]

};


// ============================================
// BOARD CREATION
// ============================================

function createBoard() {

    return Array.from(

        {
            length: ROWS
        },

        () =>
            Array(COLS).fill(0)

    );

}


// ============================================
// CREATE RANDOM PIECE
// ============================================

function createPiece() {

    const keys =
        Object.keys(PIECES);

    const randomKey =
        keys[
            Math.floor(
                Math.random() *
                keys.length
            )
        ];

    return PIECES[randomKey].map(
        row => [...row]
    );

}


// ============================================
// RESET PLAYER
// ============================================

function resetPlayer() {

    player.matrix =
        createPiece();

    player.y = 0;

    player.x =
        Math.floor(
            COLS / 2 -
            player.matrix[0].length / 2
        );


    if (
        collides(
            board,
            player
        )
    ) {

        endGame();

    }

}


// ============================================
// COLLISION
// ============================================

function collides(
    board,
    player
) {

    const matrix =
        player.matrix;


    for (
        let y = 0;
        y < matrix.length;
        y++
    ) {

        for (
            let x = 0;
            x < matrix[y].length;
            x++
        ) {

            if (
                matrix[y][x] !== 0
            ) {

                const boardX =
                    x + player.x;

                const boardY =
                    y + player.y;


                if (
                    boardX < 0 ||
                    boardX >= COLS
                ) {

                    return true;

                }


                if (
                    boardY >= ROWS
                ) {

                    return true;

                }


                if (
                    boardY >= 0 &&
                    board[boardY][boardX] !== 0
                ) {

                    return true;

                }

            }

        }

    }


    return false;

}


// ============================================
// MERGE
// ============================================

function merge(
    board,
    player
) {

    player.matrix.forEach(
        (row, y) => {

            row.forEach(
                (value, x) => {

                    if (
                        value !== 0
                    ) {

                        board[
                            y + player.y
                        ][
                            x + player.x
                        ] = value;

                    }

                }
            );

        }
    );

}


// ============================================
// ROTATION
// ============================================

function rotate(matrix) {

    return matrix[0].map(
        (_, index) =>
            matrix
                .map(
                    row =>
                        row[index]
                )
                .reverse()
    );

}


function playerRotate() {

    const oldMatrix =
        player.matrix;

    player.matrix =
        rotate(
            player.matrix
        );


    if (
        collides(
            board,
            player
        )
    ) {

        player.matrix =
            oldMatrix;

    }

}


// ============================================
// MOVEMENT
// ============================================

function playerMove(
    direction
) {

    player.x +=
        direction;


    if (
        collides(
            board,
            player
        )
    ) {

        player.x -=
            direction;

    }

}


// ============================================
// NORMAL DROP
// ============================================

function playerDrop() {

    player.y++;


    if (
        collides(
            board,
            player
        )
    ) {

        player.y--;

        lockPiece();

    }


    dropCounter = 0;

}


// ============================================
// LOCK PIECE
// ============================================

function lockPiece() {

    merge(
        board,
        player
    );


    piecesPlaced++;


    clearLines();


    resetPlayer();

}


// ============================================
// HARD DROP
// ============================================

function hardDrop() {

    while (
        !collides(
            board,
            player
        )
    ) {

        player.y++;

    }


    player.y--;


    merge(
        board,
        player
    );


    clearLines();


    resetPlayer();


    dropCounter = 0;


    updateUI();

}


// ============================================
// CLEAR LINES
// ============================================

function clearLines() {

    let cleared = 0;


    outer:

    for (
        let y = ROWS - 1;
        y >= 0;
        y--
    ) {

        for (
            let x = 0;
            x < COLS;
            x++
        ) {

            if (
                board[y][x] === 0
            ) {

                continue outer;

            }

        }


        board.splice(
            y,
            1
        );


        board.unshift(
            Array(COLS).fill(0)
        );


        cleared++;

        y++;

    }


    if (
        cleared > 0
    ) {

        lines +=
            cleared;


        score +=
            calculateScore(
                cleared
            );


        level =
            Math.floor(
                lines / 10
            ) + 1;


        updateUI();

    }

}


// ============================================
// SCORE
// ============================================

function calculateScore(
    cleared
) {

    const scores = {

        1: 100,
        2: 300,
        3: 500,
        4: 800

    };


    return (
        scores[cleared] || 0
    ) * level;

}


// ============================================
// DRAW BLOCK
// ============================================

function drawBlock(x, y) {

    // Fill the entire cell
    ctx.fillStyle = "#2563eb";

    ctx.fillRect(
        x * BLOCK_SIZE,
        y * BLOCK_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE
    );


    // Thin border between cells
    ctx.strokeStyle = "#0f172a";

    ctx.lineWidth = 1;

    ctx.strokeRect(
        x * BLOCK_SIZE + 0.5,
        y * BLOCK_SIZE + 0.5,
        BLOCK_SIZE - 1,
        BLOCK_SIZE - 1
    );

}




// ============================================
// DRAW MATRIX
// ============================================

function drawMatrix(
    matrix,
    offset
) {

    matrix.forEach(
        (row, y) => {

            row.forEach(
                (value, x) => {

                    if (
                        value !== 0
                    ) {

                        drawBlock(

                            x + offset.x,

                            y + offset.y

                        );

                    }

                }
            );

        }
    );

}


// ============================================
// DRAW
// ============================================

function draw() {

    // ----------------------------------------
    // OUTSIDE / EMPTY CANVAS AREA
    // ----------------------------------------

    ctx.fillStyle = "#374151";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ----------------------------------------
    // TETRIS PLAYING AREA
    // ----------------------------------------

    ctx.fillStyle = "#111827";

    ctx.fillRect(
        0,
        0,
        COLS * BLOCK_SIZE,
        ROWS * BLOCK_SIZE
    );



    // ----------------------------------------
    // DRAW EXISTING BLOCKS
    // ----------------------------------------

    drawMatrix(
        board,
        {
            x: 0,
            y: 0
        }
    );


    // ----------------------------------------
    // DRAW CURRENT PIECE
    // ----------------------------------------

    if (
        player.matrix
    ) {

        drawMatrix(

            player.matrix,

            {
                x: player.x,
                y: player.y
            }

        );

    }

}




// ============================================
// UPDATE DDA
// ============================================

function updateDDA(
    deltaTime
) {

    if (
        !gameRunning
    ) {

        return;

    }


    window.gameScore =
        score;

    window.gameLines =
        lines;

    window.gamePieces =
        piecesPlaced;


    window.ddaRawPerformance =
        dda.rawPerformance;

    window.ddaPerformance =
        dda.performance;


    const settings =
        dda.evaluate(

            board,

            deltaTime

        );


    if (!settings) {

        return;

    }


    // ----------------------------------------
    // Store current DDA state
    // ----------------------------------------

    window.ddaRawPerformance =
        dda.rawPerformance;


    window.ddaPerformance =
        dda.performance;


    window.ddaDifficulty =
        settings.name;


    window.ddaSpeed =
        settings.multiplier;


    window.ddaDecision =
        settings.decision;


    // ----------------------------------------
    // Record experiment sample
    // ----------------------------------------

    experimentLogger.record({

        score:
            score,

        lines:
            lines,

        piecesPlaced:
            piecesPlaced,

        rawPerformance:
            dda.rawPerformance,

        performance:
            dda.performance,

        difficulty:
            settings.name,

        speed:
            settings.multiplier,

        decision:
            settings.decision

    });


    // ----------------------------------------
    // Apply new fall speed
    // ----------------------------------------

    dropInterval =
        settings.interval;


    // ----------------------------------------
    // Update UI
    // ----------------------------------------

    document
        .getElementById(
            "performance"
        )
        .textContent =
            Math.round(
                settings.performance
            ) + "%";


    document
        .getElementById(
            "performanceBar"
        )
        .style.width =
            settings.performance + "%";


    document
        .getElementById(
            "difficulty"
        )
        .textContent =
            settings.name;


    document
        .getElementById(
            "ddaStatus"
        )
        .textContent =
            "Monitoring";


    updateUI();


    // ----------------------------------------
    // UPDATE EXPERIMENT GRAPH
    // ----------------------------------------

    drawExperimentGraph();

}

// ============================================
// GAME LOOP
// ============================================

function update(
    time = 0
) {

    const deltaTime =
        time - lastTime;


    lastTime =
        time;


    // ----------------------------------------
    // ONLY RUN GAME LOGIC WHEN NOT PAUSED
    // ----------------------------------------

    if (
        gameRunning &&
        !gamePaused
    ) {

        dropCounter +=
            deltaTime;


        // Normal falling

        if (
            dropCounter >
            dropInterval
        ) {

            playerDrop();

        }


        // DDA

        updateDDA(
            deltaTime
        );

    }


    // Always draw the game

    draw();


    requestAnimationFrame(
        update
    );

}


// ============================================
// START / END GAME
// ============================================

function startGame() {

    board = createBoard();

    score = 0;
    lines = 0;
    piecesPlaced = 0;
    level = 1;

    dropCounter = 0;
    dropInterval = 1000;

    gameOver = false;
    gamePaused = false;
    gameRunning = true;

    // Change Start button to End Game
    document
        .getElementById("startButton")
        .textContent = "End Game";

    // Reset Pause button
    document
        .getElementById("pauseButton")
        .textContent = "Pause";

    dda.reset();

    experimentLogger.startSession();

    hideGameOver();

    resetPlayer();

    updateUI();

    document
        .getElementById("ddaStatus")
        .textContent = "Monitoring";

    drawExperimentGraph();
}

// ============================================
// END CURRENT GAME
// ============================================

function endCurrentGame() {

    if (!gameRunning || gameOver) {
        return;
    }

    gameRunning = false;
    gamePaused = false;
    gameOver = true;

    // Save final experiment record
    experimentLogger.endSession();

    // Reset buttons
    document
        .getElementById("startButton")
        .textContent = "Start Game";

    document
        .getElementById("pauseButton")
        .textContent = "Pause";

    // Update status
    document
        .getElementById("ddaStatus")
        .textContent = "Game Ended";

    // Update graph
    drawExperimentGraph();

    // Show final score
    showGameOver();
}


// ============================================
// RESTART
// ============================================

function restartGame() {

    startGame();

}

// ============================================
// PAUSE / RESUME GAME
// ============================================

function togglePause() {

    if (!gameRunning || gameOver) {
        return;
    }

    gamePaused = !gamePaused;

    const pauseButton =
        document.getElementById("pauseButton");

    if (gamePaused) {

        pauseButton.textContent = "Resume";

        document.getElementById("ddaStatus")
            .textContent = "Paused";

    } else {

        pauseButton.textContent = "Pause";

        document.getElementById("ddaStatus")
            .textContent = "Monitoring";

        lastTime = performance.now();
    }
}


// ============================================
// GAME OVER
// ============================================

function endGame() {

    gameRunning = false;

    gameOver = true;


    experimentLogger.endSession();


    document
        .getElementById(
            "ddaStatus"
        )
        .textContent =
            "Game Over";


    showGameOver();


    drawExperimentGraph();

}


// ============================================
// UI UPDATE
// ============================================

function updateUI() {

    document
        .getElementById(
            "score"
        )
        .textContent =
            score;


    document
        .getElementById(
            "lines"
        )
        .textContent =
            lines;


    document
        .getElementById(
            "level"
        )
        .textContent =
            level;


    const settings =
        dda.getCurrentSettings();


    document
        .getElementById(
            "difficulty"
        )
        .textContent =
            settings.name;


    document
        .getElementById(
            "speed"
        )
        .textContent =
            settings.multiplier
                .toFixed(2)
            + "x";

}


// ============================================
// GAME OVER OVERLAY
// ============================================

function showGameOver() {

    let overlay =
        document.getElementById(
            "gameOverOverlay"
        );


    if (!overlay) {

        overlay =
            document.createElement(
                "div"
            );


        overlay.id =
            "gameOverOverlay";


        overlay.innerHTML = `

            <div class="game-over-box">

                <h2>
                    GAME OVER
                </h2>

                <p>
                    Your game has ended.
                </p>

                <div class="final-score">
                    Score:
                    <strong>
                        ${score}
                    </strong>
                </div>

                <div class="final-score">
                    Lines:
                    <strong>
                        ${lines}
                    </strong>
                </div>

                <button id="overlayRestart">
                    Play Again
                </button>

            </div>

        `;


        document
            .querySelector(
                ".game-container"
            )
            .appendChild(
                overlay
            );


        document
            .getElementById(
                "overlayRestart"
            )
            .addEventListener(
                "click",
                restartGame
            );

    }


    overlay.style.display =
        "flex";


    overlay.querySelector(
        ".final-score"
    ).innerHTML =
        `Score:
        <strong>
            ${score}
        </strong>`;


    overlay
        .querySelectorAll(
            ".final-score"
        )[1]
        .innerHTML =
        `Lines:
        <strong>
            ${lines}
        </strong>`;

}


function hideGameOver() {

    const overlay =
        document.getElementById(
            "gameOverOverlay"
        );


    if (overlay) {

        overlay.style.display =
            "none";

    }

}


// ============================================
// KEYBOARD
// ============================================

document.addEventListener(
    "keydown",
    event => {

        if (
            !gameRunning ||
            gamePaused
        ) {

            return;

        }


        if (
            event.key ===
            "ArrowLeft"
        ) {

            event.preventDefault();

            playerMove(-1);

        }


        else if (
            event.key ===
            "ArrowRight"
        ) {

            event.preventDefault();

            playerMove(1);

        }


        else if (
            event.key ===
            "ArrowDown"
        ) {

            event.preventDefault();

            playerDrop();

        }


        else if (
            event.key ===
            "ArrowUp"
        ) {

            event.preventDefault();

            playerRotate();

        }


        else if (
            event.code ===
            "Space"
        ) {

            event.preventDefault();

            hardDrop();

        }

    }
);


// ============================================
// GRAPH SETTINGS
// ============================================

let selectedGraphMetric =
    "score";


const graphMetrics = {

    score: {

        label:
            "Score",

        color:
            "#3b82f6",

        getValue:
            record =>
                record.score,

        format:
            value =>
                Math.round(value)

    },


    lines: {

        label:
            "Lines",

        color:
            "#22c55e",

        getValue:
            record =>
                record.lines,

        format:
            value =>
                Math.round(value)

    },


    performance: {

        label:
            "Performance",

        color:
            "#f59e0b",

        getValue:
            record =>
                record.performance,

        format:
            value =>
                Math.round(value)
                + "%"

    },


    speed: {

        label:
            "Fall Speed",

        color:
            "#a855f7",

        getValue:
            record =>
                record.speed,

        format:
            value =>
                Number(value)
                    .toFixed(2)
                + "x"

    }

};


// ============================================
// GRAPH CANVAS
// ============================================

const experimentChart =
    document.getElementById(
        "experimentChart"
    );


const chartCtx =
    experimentChart
        ? experimentChart.getContext("2d")
        : null;


// ============================================
// DRAW EXPERIMENT GRAPH
// ============================================

function drawExperimentGraph() {

    if (
        !experimentChart ||
        !chartCtx
    ) {

        return;

    }


    const container =
        experimentChart.parentElement;


    const width =
        Math.max(
            container.clientWidth - 30,
            200
        );


    const height =
        Math.max(
            container.clientHeight - 45,
            150
        );


    const dpr =
        window.devicePixelRatio || 1;


    experimentChart.width =
        width * dpr;


    experimentChart.height =
        height * dpr;


    experimentChart.style.width =
        width + "px";


    experimentChart.style.height =
        height + "px";


    chartCtx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    chartCtx.clearRect(
        0,
        0,
        width,
        height
    );


    const records =
        experimentLogger.records || [];


    const metric =
        graphMetrics[
            selectedGraphMetric
        ];


    updateGraphTitle(
        records.length
    );


    if (
        records.length === 0
    ) {

        chartCtx.fillStyle =
            "#9ca3af";


        chartCtx.font =
            "14px Arial";


        chartCtx.textAlign =
            "center";


        chartCtx.fillText(

            "Start a game to collect experiment data",

            width / 2,

            height / 2

        );


        return;

    }


    const values =
        records.map(
            record => {

                const value =
                    metric.getValue(
                        record
                    );

                return Number(value) || 0;

            }
        );


    let minValue =
        Math.min(
            ...values
        );


    let maxValue =
        Math.max(
            ...values
        );


    if (
        minValue === maxValue
    ) {

        minValue -= 1;

        maxValue += 1;

    }


    const range =
        maxValue - minValue;


    const left =
        55;

    const right =
        20;

    const top =
        20;

    const bottom =
        35;


    const graphWidth =
        width -
        left -
        right;


    const graphHeight =
        height -
        top -
        bottom;


    // ----------------------------------------
    // GRID
    // ----------------------------------------

    chartCtx.strokeStyle =
        "#374151";


    chartCtx.lineWidth =
        1;


    const gridLines =
        5;


    for (
        let i = 0;
        i <= gridLines;
        i++
    ) {

        const y =
            top +
            graphHeight -
            (
                i /
                gridLines
            ) *
            graphHeight;


        chartCtx.beginPath();

        chartCtx.moveTo(
            left,
            y
        );

        chartCtx.lineTo(
            width - right,
            y
        );

        chartCtx.stroke();


        const value =
            minValue +
            (
                i /
                gridLines
            ) *
            range;


        chartCtx.fillStyle =
            "#9ca3af";


        chartCtx.font =
            "11px Arial";


        chartCtx.textAlign =
            "right";


        chartCtx.fillText(

            metric.format(
                value
            ),

            left - 8,

            y + 4

        );

    }


    // ----------------------------------------
    // X AXIS LABELS
    // ----------------------------------------

    chartCtx.fillStyle =
        "#9ca3af";


    chartCtx.font =
        "11px Arial";


    chartCtx.textAlign =
        "center";


    const labelCount =
        Math.min(
            5,
            records.length
        );


    for (
        let i = 0;
        i < labelCount;
        i++
    ) {

        const index =
            Math.floor(

                (
                    i /
                    Math.max(
                        labelCount - 1,
                        1
                    )
                ) *

                (
                    records.length - 1
                )

            );


        const x =
            left +

            (
                index /
                Math.max(
                    records.length - 1,
                    1
                )
            ) *

            graphWidth;


        chartCtx.fillText(

            records[index]
                .timeSeconds + "s",

            x,

            height - 10

        );

    }


    // ----------------------------------------
    // GRAPH LINE
    // ----------------------------------------

    chartCtx.strokeStyle =
        metric.color;


    chartCtx.lineWidth =
        3;


    chartCtx.lineJoin =
        "round";


    chartCtx.lineCap =
        "round";


    chartCtx.beginPath();


    values.forEach(
        (
            value,
            index
        ) => {

            const x =
                left +

                (
                    index /
                    Math.max(
                        values.length - 1,
                        1
                    )
                ) *

                graphWidth;


            const y =
                top +

                graphHeight -

                (
                    (
                        value -
                        minValue
                    ) /
                    range
                ) *

                graphHeight;


            if (
                index === 0
            ) {

                chartCtx.moveTo(
                    x,
                    y
                );

            }

            else {

                chartCtx.lineTo(
                    x,
                    y
                );

            }

        }
    );


    chartCtx.stroke();


    // ----------------------------------------
    // DATA POINTS
    // ----------------------------------------

    chartCtx.fillStyle =
        metric.color;


    values.forEach(
        (
            value,
            index
        ) => {

            const x =
                left +

                (
                    index /
                    Math.max(
                        values.length - 1,
                        1
                    )
                ) *

                graphWidth;


            const y =
                top +

                graphHeight -

                (
                    (
                        value -
                        minValue
                    ) /
                    range
                ) *

                graphHeight;


            chartCtx.beginPath();


            chartCtx.arc(

                x,
                y,
                4,
                0,
                Math.PI * 2

            );


            chartCtx.fill();

        }
    );

}


// ============================================
// UPDATE GRAPH TITLE
// ============================================

function updateGraphTitle(
    count
) {

    const title =
        document.getElementById(
            "graphTitle"
        );


    const recordCount =
        document.getElementById(
            "recordCount"
        );


    if (title) {

        title.textContent =
            graphMetrics[
                selectedGraphMetric
            ].label +
            " over Time";

    }


    if (recordCount) {

        recordCount.textContent =
            "Data Points: " +
            count;

    }

}


// ============================================
// GRAPH TYPE BUTTONS
// ============================================

document
    .querySelectorAll(
        ".graph-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    selectedGraphMetric =
                        button.dataset.metric;


                    document
                        .querySelectorAll(
                            ".graph-button"
                        )
                        .forEach(
                            otherButton => {

                                otherButton
                                    .classList
                                    .remove(
                                        "active"
                                    );

                            }
                        );


                    button
                        .classList
                        .add(
                            "active"
                        );


                    drawExperimentGraph();

                }
            );

        }
    );


// ============================================
// DOWNLOAD GRAPH
// ============================================

document
    .getElementById(
        "downloadGraphButton"
    )
    .addEventListener(
        "click",
        () => {

            if (
                !experimentLogger.records ||
                experimentLogger.records.length === 0
            ) {

                alert(
                    "No graph data available. Start a game first."
                );

                return;

            }


            drawExperimentGraph();


            const image =
                experimentChart.toDataURL(
                    "image/png"
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                image;


            link.download =
                "dda-experiment-graph-" +
                selectedGraphMetric +
                ".png";


            document.body.appendChild(
                link
            );


            link.click();


            document.body.removeChild(
                link
            );

        }
    );


// ============================================
// EXPORT CSV
// ============================================

document
    .getElementById(
        "exportButton"
    )
    .addEventListener(
        "click",
        () => {

            experimentLogger.exportCSV();

        }
    );


// ============================================
// RESIZE GRAPH
// ============================================

window.addEventListener(
    "resize",
    () => {

        drawExperimentGraph();

    }
);


// ============================================
// INITIAL GRAPH
// ============================================

drawExperimentGraph();


// ============================================
// START RENDERING
// ============================================

update();

// ============================================
// START / RESTART BUTTONS
// ============================================

document
    .getElementById("startButton")
    .addEventListener("click", () => {

        if (!gameRunning) {

            startGame();

        } else {

            endCurrentGame();

        }

    });


document
    .getElementById("restartButton")
    .addEventListener("click", () => {

        restartGame();

    });

// ============================================
// PAUSE BUTTON
// ============================================

document
.getElementById("pauseButton")
.addEventListener(
    "click",
    () => {

        togglePause();

    }
);

