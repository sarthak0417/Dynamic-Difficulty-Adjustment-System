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

let board = createBoard();


// ============================================
// GAME STATE
// ============================================

let score = 0;
let lines = 0;
let piecesPlaced = 0;
let level = 1;

let gameRunning = false;
let gameOver = false;

let dropCounter = 0;
let lastTime = 0;

let dropInterval = 1000;


// ============================================
// DDA
// ============================================

const dda = new DDAEngine();


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
        { length: ROWS },
        () => Array(COLS).fill(0)
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
                Math.random() * keys.length
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


    // Check whether new piece
    // can actually enter the board

    if (collides(board, player)) {

        endGame();
    }
}


// ============================================
// COLLISION
// ============================================

function collides(board, player) {

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


                // Left/right walls
                if (
                    boardX < 0 ||
                    boardX >= COLS
                ) {

                    return true;
                }


                // Bottom
                if (
                    boardY >= ROWS
                ) {

                    return true;
                }


                // Existing block
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

function merge(board, player) {

    player.matrix.forEach(
        (row, y) => {

            row.forEach(
                (value, x) => {

                    if (value !== 0) {

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
                .map(row => row[index])
                .reverse()
    );
}


function playerRotate() {

    const oldMatrix =
        player.matrix;

    player.matrix =
        rotate(player.matrix);

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

function playerMove(direction) {

    player.x += direction;

    if (
        collides(
            board,
            player
        )
    ) {

        player.x -= direction;
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

    // The falling piece has reached
    // its final position.
    merge(
        board,
        player
    );

    // Count this placement.
    piecesPlaced++;

    // Check whether the placement
    // completed any rows.
    clearLines();

    // Create the next piece.
    resetPlayer();
}


// ============================================
// HARD DROP
// ============================================

function hardDrop() {

    // Move the piece down until the next
    // position would cause a collision.
    while (!collides(board, player)) {
        player.y++;
    }

    // We moved one position too far,
    // so return to the last valid position.
    player.y--;

    // The piece is now at the bottom.
    // Lock it permanently into the board.
    merge(board, player);

    // Only completely filled rows will be
    // removed by this function.
    clearLines();

    // Create the next falling piece.
    resetPlayer();

    // Reset fall timer.
    dropCounter = 0;

    updateUI();
}


// ============================================
// CLEAR LINES
// ============================================

function clearLines() {

    let cleared = 0;

    outer:

    for (let y = ROWS - 1; y >= 0; y--) {

        // Check every cell in this row.
        for (let x = 0; x < COLS; x++) {

            // If even ONE cell is empty,
            // this row is NOT complete.
            if (board[y][x] === 0) {
                continue outer;
            }
        }

        // We only reach here when ALL 10 cells
        // contain blocks.

        board.splice(y, 1);

        // Add an empty row at the top.
        board.unshift(
            Array(COLS).fill(0)
        );

        cleared++;

        // Check this same position again because
        // another row may have fallen into it.
        y++;
    }

    if (cleared > 0) {

        lines += cleared;

        score += calculateScore(cleared);

        level =
            Math.floor(lines / 10) + 1;

        updateUI();
    }
}


// ============================================
// SCORE
// ============================================

function calculateScore(cleared) {

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

function drawBlock(
    x,
    y
) {

    ctx.fillStyle =
        "#2563eb";

    ctx.fillRect(
        x * BLOCK_SIZE,
        y * BLOCK_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE
    );

    ctx.strokeStyle =
        "#111827";

    ctx.strokeRect(
        x * BLOCK_SIZE,
        y * BLOCK_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE
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

    ctx.fillStyle =
        "#050505";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    drawMatrix(
        board,
        {
            x: 0,
            y: 0
        }
    );


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

function updateDDA(deltaTime) {

    if (!gameRunning) {
        return;
    }

    window.gameScore = score;
    window.gameLines = lines;
    window.gamePieces = piecesPlaced;

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


    // ----------------------------------------
    // Record experiment sample
    // ----------------------------------------

    experimentLogger.record({

        score: score,

        lines: lines,

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


    // Apply new fall speed
    dropInterval =
        settings.interval;


    // Update UI
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
}


// ============================================
// GAME LOOP
// ============================================

function update(time = 0) {

    const deltaTime =
        time - lastTime;

    lastTime = time;


    if (gameRunning) {

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


    draw();

    requestAnimationFrame(
        update
    );
}


// ============================================
// START
// ============================================

function startGame() {

    board =
        createBoard();

    score = 0;
    lines = 0;
    piecesPlaced = 0;
    level = 1;

    dropCounter = 0;

    dropInterval = 1000;

    gameOver = false;

    gameRunning = true;


    dda.reset();
    experimentLogger.startSession();


    hideGameOver();


    resetPlayer();

    updateUI();


    document
        .getElementById(
            "ddaStatus"
        )
        .textContent =
            "Monitoring";
}


// ============================================
// RESTART
// ============================================

function restartGame() {

    startGame();
}


// ============================================
// GAME OVER
// ============================================

function endGame() {

    gameRunning = false;

    gameOver = true;

    // Record final state
    experimentLogger.endSession();


    document
        .getElementById(
            "ddaStatus"
        )
        .textContent =
            "Game Over";


    showGameOver();
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

                <h2>GAME OVER</h2>

                <p>Your game has ended.</p>

                <div class="final-score">
                    Score: <strong>${score}</strong>
                </div>

                <div class="final-score">
                    Lines: <strong>${lines}</strong>
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
        `Score: <strong>${score}</strong>`;


    overlay.querySelectorAll(
        ".final-score"
    )[1].innerHTML =
        `Lines: <strong>${lines}</strong>`;
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

        if (!gameRunning) {
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
// BUTTONS
// ============================================

document
    .getElementById(
        "startButton"
    )
    .addEventListener(
        "click",
        startGame
    );


document
    .getElementById(
        "restartButton"
    )
    .addEventListener(
        "click",
        restartGame
    );
document
    .getElementById("exportButton")
    .addEventListener(
        "click",
        () => {

            experimentLogger.exportCSV();

        }
    );

// ============================================
// START RENDERING
// ============================================

update();