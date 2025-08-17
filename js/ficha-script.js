// Constantes e variáveis globais
const COIN_WEIGHT = 0.02; // Peso de cada moeda em kg (50 moedas = 1 kg)
let currentZoom = 1;
let currentRotation = 0;

// Objeto com os níveis de XP necessários para D&D 5E
const XP_LEVELS = {
    1: 0,
    2: 300,
    3: 900,
    4: 2700,
    5: 6500,
    6: 14000,
    7: 23000,
    8: 34000,
    9: 48000,
    10: 64000,
    11: 85000,
    12: 100000,
    13: 120000,
    14: 140000,
    15: 165000,
    16: 195000,
    17: 225000,
    18: 265000,
    19: 305000,
    20: 355000
};

// Funções de cálculo
function calculateModifier(attributeValue) {
    return Math.floor((attributeValue - 10) / 2);
}

function calculateCarryingCapacity(strength) {
    return strength * 7.5;
}

function calculateLevel(xp) {
    let level = 1;
    for (let i = 20; i >= 1; i--) {
        if (xp >= XP_LEVELS[i]) {
            level = i;
            break;
        }
    }
    return level;
}

function calculateProficiencyBonus(level) {
    return Math.floor((level - 1) / 4) + 2;
}

// Funções de atualização de UI
function updateCarryingCapacity() {
    const strength = parseInt(document.getElementById('strength').value) || 0;
    const capacity = calculateCarryingCapacity(strength);
    document.getElementById('carryingCapacity').textContent = capacity.toFixed(1);
    updateTotalWeight();
}

function updateModifiers() {
    const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    attributes.forEach(attr => {
        const value = document.getElementById(attr).value;
        const modifier = calculateModifier(parseInt(value) || 0);
        document.getElementById(`${attr}Mod`).textContent = modifier >= 0 ? `+${modifier}` : modifier;
    });
    updateSkillModifiers();
}

function updateSkillModifiers() {
    const skillModifiers = {
        'acrobatics': 'dexterity',
        'animalHandling': 'wisdom',
        'arcana': 'intelligence',
        // Adicione mais perícias conforme necessário
    };

    const profBonus = parseInt(document.getElementById('proficiencyBonus').value) || 2;

    for (const [skill, attribute] of Object.entries(skillModifiers)) {
        const attributeValue = parseInt(document.getElementById(attribute).value) || 0;
        const baseModifier = calculateModifier(attributeValue);
        const isProficient = document.getElementById(skill).checked;
        const proficiencyBonus = isProficient ? profBonus : 0;
        const totalModifier = baseModifier + proficiencyBonus;
        document.getElementById(`${skill}Mod`).textContent = totalModifier >= 0 ? `+${totalModifier}` : totalModifier;
    }
}

function updateXPProgress() {
    const currentXP = parseInt(document.getElementById('experiencePoints').value) || 0;
    const calculatedLevel = calculateLevel(currentXP);
    
    const levelInput = document.getElementById('characterLevel');
    const proficiencyInput = document.getElementById('proficiencyBonus');
    const oldLevel = parseInt(levelInput.value) || 1;
    
    if (oldLevel !== calculatedLevel) {
        levelInput.value = calculatedLevel;
        proficiencyInput.value = calculateProficiencyBonus(calculatedLevel);
        
        if (oldLevel > 0 && oldLevel < calculatedLevel) {
            alert(`Parabéns! Você alcançou o nível ${calculatedLevel}!`);
        }
    }

    const currentLevel = calculatedLevel;
    const nextLevel = Math.min(currentLevel + 1, 20);
    const prevLevelXP = XP_LEVELS[currentLevel];
    const nextLevelXP = XP_LEVELS[nextLevel];
    
    const xpForNextLevel = nextLevelXP - prevLevelXP;
    const currentLevelProgress = currentXP - prevLevelXP;
    const progressPercentage = (currentLevelProgress / xpForNextLevel) * 100;
    
    const progressBar = document.querySelector('.xp-progress-bar');
    if (progressBar) {
        progressBar.style.width = `${Math.min(100, Math.max(0, progressPercentage))}%`;
    }
    
    const xpNeeded = nextLevelXP - currentXP;
    const nextLevelSpan = document.querySelector('.xp-next-level span');
    if (nextLevelSpan) {
        if (currentLevel < 20) {
            nextLevelSpan.textContent = `${xpNeeded.toLocaleString()} XP para nível ${nextLevel}`;
        } else {
            nextLevelSpan.textContent = `Nível máximo atingido!`;
        }
    }

    updateModifiers();
}

// Funções de equipamento
function addEquipmentRow() {
    const tbody = document.getElementById('equipmentTableBody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" class="item-name" placeholder="Nome do item"></td>
        <td><input type="number" class="item-quantity" value="1" min="1" onchange="updateRowWeight(this)"></td>
        <td><input type="number" class="item-weight" value="0" min="0" step="0.1" onchange="updateRowWeight(this)"></td>
        <td class="item-total-weight">0</td>
        <td class="item-actions">
            <button type="button" class="delete-item" onclick="deleteEquipmentRow(this)">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    tbody.appendChild(row);
}

function deleteEquipmentRow(button) {
    const row = button.closest('tr');
    row.remove();
    updateTotalWeight();
}

function updateRowWeight(input) {
    const row = input.closest('tr');
    const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
    const unitWeight = parseFloat(row.querySelector('.item-weight').value) || 0;
    const totalWeight = quantity * unitWeight;
    row.querySelector('.item-total-weight').textContent = totalWeight.toFixed(2);
    updateTotalWeight();
}

function updateTotalWeight() {
    let totalWeight = 0;

    document.querySelectorAll('.item-total-weight').forEach(cell => {
        totalWeight += parseFloat(cell.textContent) || 0;
    });

    totalWeight += calculateCoinWeight();

    document.getElementById('currentWeight').textContent = totalWeight.toFixed(2);

    const capacity = parseFloat(document.getElementById('carryingCapacity').textContent);
    const weightDisplay = document.getElementById('currentWeight');
    
    if (totalWeight > capacity) {
        weightDisplay.style.color = 'red';
        weightDisplay.title = 'Peso excede a capacidade de carga!';
    } else {
        weightDisplay.style.color = '';
        weightDisplay.title = '';
    }
}

function calculateCoinWeight() {
    const copper = parseInt(document.getElementById('copper').value) || 0;
    const silver = parseInt(document.getElementById('silver').value) || 0;
    const gold = parseInt(document.getElementById('gold').value) || 0;
    const platinum = parseInt(document.getElementById('platinum').value) || 0;

    const totalCoins = copper + silver + gold + platinum;
    return totalCoins * COIN_WEIGHT;
}

function updateCoinWeight() {
    const weight = calculateCoinWeight();
    document.getElementById('coinWeight').textContent = weight.toFixed(2);
    updateTotalWeight();
}

// Funções de manipulação de imagem
function showDefaultImage() {
    const characterImage = document.getElementById('characterImage');
    if (!characterImage) return;

    const defaultSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#f0f0f0"/>
        <circle cx="100" cy="80" r="40" fill="#d0d0d0"/>
        <circle cx="100" cy="200" r="80" fill="#d0d0d0"/>
        <text x="100" y="110" text-anchor="middle" fill="#808080" font-family="Arial" font-size="16">
            Clique para adicionar imagem
        </text>
    </svg>`;
    
    characterImage.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(defaultSvg);
    currentZoom = 1;
    currentRotation = 0;
    updateImageTransform(false);
}

function loadCharacterImage(force = false) {
    const characterImage = document.getElementById('characterImage');
    if (!characterImage) return;

    const savedImage = localStorage.getItem('characterImage');
    const savedTransform = localStorage.getItem('imageTransform');

    if (savedImage && force) {
        characterImage.src = savedImage;
        
        if (savedTransform) {
            const transform = JSON.parse(savedTransform);
            currentZoom = transform.zoom || 1;
            currentRotation = transform.rotation || 0;
            updateImageTransform(false);
        }
    } else {
        showDefaultImage();
    }

    characterImage.onerror = function() {
        console.error('Erro ao carregar a imagem');
        showDefaultImage();
    };

    characterImage.onload = function() {
        if (!this.src.includes('Clique para adicionar imagem')) {
            updateImageTransform(false);
        }
    };
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
        alert('Por favor, selecione uma imagem válida (JPEG, PNG, GIF, WEBP ou SVG)');
        return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('A imagem é muito grande. Por favor, selecione uma imagem menor que 5MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const image = document.getElementById('characterImage');
        
        const oldZoom = currentZoom;
        const oldRotation = currentRotation;
        
        image.src = e.target.result;
        
        currentZoom = oldZoom;
        currentRotation = oldRotation;
        
        image.onload = function() {
            updateImageTransform();
        };
        
        localStorage.setItem('characterImage', e.target.result);
    };
    reader.onerror = function() {
        alert('Erro ao ler o arquivo. Por favor, tente novamente.');
    };
    reader.readAsDataURL(file);
}

function updateImageTransform(saveState = true) {
    const image = document.getElementById('characterImage');
    if (image) {
        image.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
        
        if (saveState) {
            const transformState = {
                zoom: currentZoom,
                rotation: currentRotation
            };
            localStorage.setItem('imageTransform', JSON.stringify(transformState));
        }
    }
}

function zoomIn() {
    if (currentZoom < 2) {
        currentZoom = Math.min(2, currentZoom + 0.1);
        currentZoom = Math.round(currentZoom * 10) / 10;
        updateImageTransform();
    }
}

function zoomOut() {
    if (currentZoom > 0.5) {
        currentZoom = Math.max(0.5, currentZoom - 0.1);
        currentZoom = Math.round(currentZoom * 10) / 10;
        updateImageTransform();
    }
}

function resetImage() {
    currentZoom = 1;
    currentRotation = 0;
    updateImageTransform();
}

// Funções de gerenciamento de dados do personagem
function saveCharacter() {
    const form = document.getElementById('characterForm');
    const formData = new FormData(form);
    const characterData = {};

    formData.forEach((value, key) => {
        characterData[key] = value;
    });

    const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    characterData.modifiers = {};
    attributes.forEach(attr => {
        characterData.modifiers[attr] = document.getElementById(`${attr}Mod`).textContent;
    });

    localStorage.setItem('characterData', JSON.stringify(characterData));
    alert('Personagem salvo com sucesso!');
}

function loadCharacter() {
    const savedData = localStorage.getItem('characterData');
    if (!savedData) {
        alert('Nenhum personagem salvo encontrado!');
        return;
    }

    const characterData = JSON.parse(savedData);
    const form = document.getElementById('characterForm');

    Object.keys(characterData).forEach(key => {
        if (key !== 'modifiers' && key !== 'characterImage' && key !== 'imageTransform') {
            const element = form.elements[key];
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = characterData[key];
                } else {
                    element.value = characterData[key];
                }
            }
        }
    });

    loadCharacterImage(true);
    updateModifiers();
    alert('Personagem carregado com sucesso!');
}

function exportToJson() {
    const form = document.getElementById('characterForm');
    const formData = new FormData(form);
    const characterData = {};

    formData.forEach((value, key) => {
        characterData[key] = value;
    });

    const savedImage = localStorage.getItem('characterImage');
    if (savedImage) {
        characterData.characterImage = savedImage;
    }

    const savedTransform = localStorage.getItem('imageTransform');
    if (savedTransform) {
        characterData.imageTransform = JSON.parse(savedTransform);
    }

    const dataStr = JSON.stringify(characterData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileName = `${characterData.characterName || 'personagem'}_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
}

function importFromJson() {
    const fileInput = document.getElementById('jsonFileInput');
    fileInput.click();

    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const characterData = JSON.parse(e.target.result);
                const form = document.getElementById('characterForm');

                Object.keys(characterData).forEach(key => {
                    if (key !== 'characterImage' && key !== 'imageTransform') {
                        const element = form.elements[key];
                        if (element) {
                            if (element.type === 'checkbox') {
                                element.checked = characterData[key];
                            } else {
                                element.value = characterData[key];
                            }
                        }
                    }
                });

                if (characterData.characterImage) {
                    localStorage.setItem('characterImage', characterData.characterImage);
                }

                if (characterData.imageTransform) {
                    localStorage.setItem('imageTransform', JSON.stringify(characterData.imageTransform));
                }

                loadCharacterImage(true);
                updateModifiers();
                alert('Personagem importado com sucesso!');
            } catch (error) {
                console.error('Erro ao importar personagem:', error);
                alert('Erro ao importar o arquivo. Verifique se é um arquivo JSON válido.');
            }
        };
        reader.readAsText(file);
    };
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    attributes.forEach(attr => {
        const input = document.getElementById(attr);
        if (input) {
            input.addEventListener('change', updateModifiers);
            input.addEventListener('input', updateModifiers);
        }
    });

    const skills = document.querySelectorAll('.skill-item input[type="checkbox"]');
    skills.forEach(skill => {
        skill.addEventListener('change', updateSkillModifiers);
    });

    const xpInput = document.getElementById('experiencePoints');
    if (xpInput) {
        xpInput.addEventListener('change', updateXPProgress);
        xpInput.addEventListener('input', updateXPProgress);
    }

    addEquipmentRow();
    updateXPProgress();
    showDefaultImage();
});
