// ============================================
// PLAYER PERFORMANCE MONITOR
// ============================================

class PerformanceMonitor {

    constructor() {

        this.score = 0;
        this.lines = 0;
        this.piecesPlaced = 0;

        this.startTime = 0;

        this.performance = 50;
    }


    start() {

        this.score = 0;
        this.lines = 0;
        this.piecesPlaced = 0;

        this.startTime = Date.now();

        this.performance = 50;
    }


    update(score, lines, piecesPlaced, board) {

        this.score = score;
        this.lines = lines;
        this.piecesPlaced = piecesPlaced;


        // ----------------------------------------
        // GAME DURATION
        // ----------------------------------------

        const elapsed =
            (Date.now() - this.startTime) / 1000;


        // ----------------------------------------
        // STACK HEIGHT
        // ----------------------------------------

        const stackHeight =
            this.calculateStackHeight(board);


        // ----------------------------------------
        // COMPONENT SCORES
        // ----------------------------------------

        const lineScore =
            Math.min(
                100,
                this.lines * 5
            );


        const scoreRate =
            elapsed > 0
                ? this.score / elapsed
                : 0;


        const scoreComponent =
            Math.min(
                100,
                scoreRate * 2
            );


        const survivalComponent =
            Math.max(
                0,
                100 - stackHeight * 5
            );


        // ----------------------------------------
        // COMBINE PERFORMANCE
        // ----------------------------------------

        this.performance =
            (
                lineScore * 0.35 +
                scoreComponent * 0.25 +
                survivalComponent * 0.40
            );


        this.performance =
            Math.max(
                0,
                Math.min(
                    100,
                    this.performance
                )
            );


        return this.performance;
    }


    calculateStackHeight(board) {

        for (
            let y = 0;
            y < board.length;
            y++
        ) {

            for (
                let x = 0;
                x < board[y].length;
                x++
            ) {

                if (
                    board[y][x] !== 0
                ) {

                    return board.length - y;
                }
            }
        }


        return 0;
    }


    getPerformance() {

        return this.performance;
    }
}
// ============================================
// DYNAMIC DIFFICULTY ADJUSTMENT ENGINE
// ============================================

class DDAEngine {

    constructor() {

        this.monitor = new PerformanceMonitor();

        // Difficulty levels
        this.levels = [
            {
                name: "Easy",
                multiplier: 0.80
            },
            {
                name: "Normal",
                multiplier: 1.00
            },
            {
                name: "Hard",
                multiplier: 1.25
            },
            {
                name: "Expert",
                multiplier: 1.50
            }
        ];

        this.currentLevel = 1;

        // Base fall interval
        this.baseInterval = 1000;

        // How often DDA evaluates the player
        this.evaluationInterval = 2000;

        this.timeSinceEvaluation = 0;

        // Prevents difficulty from changing too rapidly
        this.cooldown = 0;

        // Last decision
        this.lastDecision = "Waiting";

        // --------------------------------------------
        // PERFORMANCE SMOOTHING
        // --------------------------------------------

        // Raw performance from the monitor
        this.rawPerformance = 50;

        // Smoothed performance used by the DDA
        this.performance = 50;

        // EWMA smoothing factor
        // Lower = smoother
        // Higher = more reactive
        this.alpha = 0.20;
    }


    // --------------------------------------------
    // Calculate player danger
    // --------------------------------------------

    calculateDanger(board) {

        let highestOccupiedRow = -1;

        for (let y = 0; y < board.length; y++) {

            for (let x = 0; x < board[y].length; x++) {

                if (board[y][x] !== 0) {

                    highestOccupiedRow = y;

                    break;
                }
            }

            if (highestOccupiedRow !== -1) {
                break;
            }
        }

        // Empty board
        if (highestOccupiedRow === -1) {
            return 0;
        }

        // Convert board position into danger percentage.
        const occupiedHeight =
            board.length - highestOccupiedRow;

        const danger =
            (occupiedHeight / board.length) * 100;

        return Math.min(100, danger);
    }


    // --------------------------------------------
    // Convert danger into performance
    // --------------------------------------------

    calculatePerformance(board) {

        const danger = this.calculateDanger(board);

        // High danger = low performance
        const performance = 100 - danger;

        return Math.max(
            0,
            Math.min(100, performance)
        );
    }


    // --------------------------------------------
    // Evaluate player and change difficulty
    // --------------------------------------------

    evaluate(board, deltaTime) {

    this.timeSinceEvaluation += deltaTime;


    if (this.cooldown > 0) {
        this.cooldown -= deltaTime;
    }


    // ----------------------------------------
    // Update performance monitor
    // ----------------------------------------

    // Get raw performance
    this.rawPerformance =
        this.monitor.update(
            window.gameScore || 0,
            window.gameLines || 0,
            window.gamePieces || 0,
            board
        );


// --------------------------------------------
// EWMA SMOOTHING
// --------------------------------------------

this.performance =
    this.alpha * this.rawPerformance +
    (1 - this.alpha) * this.performance;


    // ----------------------------------------
    // Don't change difficulty every frame
    // ----------------------------------------

    if (
        this.timeSinceEvaluation <
        this.evaluationInterval
    ) {

        return;
    }


    this.timeSinceEvaluation = 0;


    // ----------------------------------------
    // Difficulty decision
    // ----------------------------------------

    if (
        this.performance >= 75 &&
        this.currentLevel <
        this.levels.length - 1 &&
        this.cooldown <= 0
    ) {

        this.currentLevel++;

        this.lastDecision =
            "Increase Difficulty";

        this.cooldown = 4000;
    }


    else if (
        this.performance <= 35 &&
        this.currentLevel > 0 &&
        this.cooldown <= 0
    ) {

        this.currentLevel--;

        this.lastDecision =
            "Decrease Difficulty";

        this.cooldown = 4000;
    }


    else {

        this.lastDecision =
            "Maintain Difficulty";
    }


    return this.getCurrentSettings();
}


    // --------------------------------------------
    // Current difficulty
    // --------------------------------------------

    getCurrentSettings() {

        const level =
            this.levels[this.currentLevel];

        const interval =
            this.baseInterval /
            level.multiplier;

        return {

            name: level.name,

            multiplier: level.multiplier,

            interval: interval,

            // Smoothed performance used by DDA
            performance: this.performance,

            // Raw performance for analysis
            rawPerformance: this.rawPerformance,

            decision: this.lastDecision
        };
    }


    // --------------------------------------------
    // Reset
    // --------------------------------------------

    reset() {

        this.currentLevel = 1;

        this.timeSinceEvaluation = 0;

        this.cooldown = 0;

        this.lastDecision = "Waiting";

        this.rawPerformance = 50;

        this.performance = 50;

        this.monitor.start();
    }
}