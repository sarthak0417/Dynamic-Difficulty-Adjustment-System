// ============================================
// EXPERIMENT LOGGER
// ============================================

class ExperimentLogger {

    constructor() {

        // All records for the current game
        this.records = [];

        // Start time of current game
        this.startTime = null;

        // Game/session identifier
        this.sessionId = null;
    }


    // ============================================
    // START NEW SESSION
    // ============================================

    startSession() {

        this.records = [];

        this.startTime = Date.now();

        this.sessionId =
            new Date().toISOString();

    }


    // ============================================
    // RECORD GAME STATE
    // ============================================

    record(data) {

        if (!this.startTime) {
            return;
        }

        const elapsed =
            (Date.now() - this.startTime) / 1000;


        const record = {

            timestamp:
                new Date().toISOString(),

            timeSeconds:
                Number(elapsed.toFixed(2)),

            score:
                data.score || 0,

            lines:
                data.lines || 0,

            piecesPlaced:
                data.piecesPlaced || 0,

            rawPerformance:
                Number(
                    (data.rawPerformance || 0)
                    .toFixed(2)
                ),

            performance:
                Number(
                    (data.performance || 0)
                    .toFixed(2)
                ),

            difficulty:
                data.difficulty || "Unknown",

            speed:
                Number(
                    (data.speed || 0)
                    .toFixed(2)
                ),

            decision:
                data.decision || "Unknown"
        };


        this.records.push(record);
    }


    // ============================================
    // STOP SESSION
    // ============================================

    endSession() {

        if (!this.startTime) {
            return;
        }

        this.record({
            score: window.gameScore || 0,
            lines: window.gameLines || 0,
            piecesPlaced:
                window.gamePieces || 0,
            rawPerformance:
                window.ddaRawPerformance || 0,
            performance:
                window.ddaPerformance || 0,
            difficulty:
                window.ddaDifficulty || "Unknown",
            speed:
                window.ddaSpeed || 0,
            decision:
                "Game Over"
        });
    }


    // ============================================
    // EXPORT CSV
    // ============================================

    exportCSV() {

        if (this.records.length === 0) {

            alert(
                "No experiment data available."
            );

            return;
        }


        const headers = [

            "Session ID",
            "Timestamp",
            "Time (seconds)",
            "Score",
            "Lines",
            "Pieces Placed",
            "Raw Performance",
            "Smoothed Performance",
            "Difficulty",
            "Fall Speed",
            "DDA Decision"
        ];


        const rows =
            this.records.map(record => [

                this.sessionId,

                record.timestamp,

                record.timeSeconds,

                record.score,

                record.lines,

                record.piecesPlaced,

                record.rawPerformance,

                record.performance,

                record.difficulty,

                record.speed,

                record.decision
            ]);


        const csv = [

            headers,

            ...rows

        ]
        .map(row =>
            row.map(value =>
                `"${String(value).replaceAll('"', '""')}"`
            ).join(",")
        )
        .join("\n");


        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            `dda-experiment-${this.sessionId}.csv`;

        link.click();


        URL.revokeObjectURL(url);
    }


    // ============================================
    // GET NUMBER OF RECORDS
    // ============================================

    getRecordCount() {

        return this.records.length;
    }
}


// ============================================
// CREATE LOGGER
// ============================================

const experimentLogger =
    new ExperimentLogger();