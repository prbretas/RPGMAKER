// Configuração dos dados
let selectedDice = 0;
const MAX_HISTORY = 50; // Máximo de itens no histórico

function selectDice(sides) {
    selectedDice = sides;
    document.getElementById('result').textContent = `Dado selecionado: d${sides}`;
}

function addToHistory(diceType, rolls, results, total) {
    const historyContainer = document.getElementById('history-container');
    const timestamp = new Date().toLocaleTimeString();
    
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <span>[${timestamp}]</span>
        <div>🎲 d${diceType} (${rolls}x): ${results.join(', ')}</div>
        ${rolls > 1 ? `<div>Total: ${total}</div>` : ''}
    `;

    historyContainer.insertBefore(historyItem, historyContainer.firstChild);

    while (historyContainer.children.length > MAX_HISTORY) {
        historyContainer.removeChild(historyContainer.lastChild);
    }
}

function rollDice() {
    if (selectedDice === 0) {
        document.getElementById('result').textContent = 'Por favor, selecione um dado primeiro.';
        return;
    }

    const numRolls = parseInt(document.getElementById('rolls').value);
    if (isNaN(numRolls) || numRolls < 1) {
        document.getElementById('result').textContent = 'Digite um número válido de rolagens.';
        return;
    }

    let results = [];
    let total = 0;

    for (let i = 0; i < numRolls; i++) {
        const result = Math.floor(Math.random() * selectedDice) + 1;
        results.push(result);
        total += result;
    }

    document.getElementById('result').innerHTML =
        `<p>Resultados do d${selectedDice} (${numRolls}x): ${results.join(', ')}</p>` +
        (numRolls > 1 ? `<p>Soma total: ${total}</p>` : '');

    addToHistory(selectedDice, numRolls, results, total);
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Aqui você pode adicionar qualquer inicialização necessária para a página de dados
});
