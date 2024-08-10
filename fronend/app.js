document.getElementById('start-game').addEventListener('click', function() {
    const player1Name = document.getElementById('player1-name').value;
    const player1Email = document.getElementById('player1-email').value;
    const player2Name = document.getElementById('player2-name').value;
    const player2Email = document.getElementById('player2-email').value;

    // Register both players
    Promise.all([
        fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: player1Name, email: player1Email })
        }),
        fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: player2Name, email: player2Email })
        })
    ])
    .then(responses => Promise.all(responses.map(res => res.json())))
    .then(data => {
        const [player1, player2] = data;
        document.getElementById('user-form').style.display = 'none';
        document.getElementById('game').style.display = 'block';
        startGame(player1.id, player2.id, player1Name, player2Name);
    });
});

function startGame(player1Id, player2Id, player1Name, player2Name) {
    const board = document.getElementById('board');
    const status = document.getElementById('status');
    const newGameButton = document.getElementById('new-game');
    const player1Score = document.getElementById('player1-score');
    const player2Score = document.getElementById('player2-score');
    const player1Info = document.getElementById('player1-info');
    const player2Info = document.getElementById('player2-info');

    let gameState = Array(9).fill(null);
    let currentPlayer = player1Name; // Start with Player 1
    let playerSymbols = { [player1Name]: 'X', [player2Name]: 'O' };
    let scores = { [player1Name]: 0, [player2Name]: 0 };

    // Display which player has which symbol
    player1Info.textContent = `${player1Name}: ${playerSymbols[player1Name]}`;
    player2Info.textContent = `${player2Name}: ${playerSymbols[player2Name]}`;

    board.innerHTML = '';
    gameState.forEach((_, index) => {
        const cell = document.createElement('div');
        cell.addEventListener('click', () => makeMove(index));
        board.appendChild(cell);
    });

    function makeMove(index) {
        if (gameState[index] === null) {
            gameState[index] = playerSymbols[currentPlayer];
            board.children[index].textContent = playerSymbols[currentPlayer];
            if (checkWinner()) {
                status.textContent = `${currentPlayer} wins!`;
                scores[currentPlayer]++;
                updateScores();
                newGameButton.style.display = 'block';
                return;
            }
            if (!gameState.includes(null)) {
                status.textContent = 'Draw!';
                newGameButton.style.display = 'block';
                return;
            }
            currentPlayer = currentPlayer === player1Name ? player2Name : player1Name;
        }
    }

    function checkWinner() {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        return winningCombinations.some(combination => {
            return combination.every(index => gameState[index] === playerSymbols[currentPlayer]);
        });
    }

    function updateScores() {
        player1Score.textContent = `${player1Name}: ${scores[player1Name]} Wins`;
        player2Score.textContent = `${player2Name}: ${scores[player2Name]} Wins`;
    }

    newGameButton.addEventListener('click', () => {
        gameState = Array(9).fill(null);
        board.innerHTML = '';
        gameState.forEach((_, index) => {
            const cell = document.createElement('div');
            cell.addEventListener('click', () => makeMove(index));
            board.appendChild(cell);
        });
        status.textContent = '';
        newGameButton.style.display = 'none';
        currentPlayer = player1Name; 
    });
}

