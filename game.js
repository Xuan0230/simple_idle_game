// ==================== 遊戲數據 ====================
let gold = 0;  // 金幣數量
let goldPerClick = 1;  // 每次點擊增加的金幣
let goldPerSecond = 0;  // 每秒自動增加的金幣

// 升級項目數據
const upgrades = {
    autoUpgrade: {
        cost: 50,       // 自動增長升級的初始成本
        increment: 1,   // 每次升級增加的自動增長速度
        owned: 0        // 已購買的自動增長升級數量
    }
};

// ==================== DOM 元素獲取 ====================
const goldDisplay = document.getElementById('gold');  // 顯示金幣的元素
const clickButton = document.getElementById('click-button');  // 點擊按鈕
const autoUpgradeButton = document.getElementById('auto-upgrade');  // 自動增長按鈕

// ==================== 遊戲功能 ====================
// 更新金幣顯示
let lastGoldAmount = 0; // 記錄上次的金幣數量

// 更新金幣顯示，並進行數字逐漸增長動畫
function updateGoldDisplay() {
    if(lastGoldAmount > gold)
        lastGoldAmount = gold;

    const incrementSpeed = 50; // 每次更新的間隔時間 (毫秒)
    const incrementStep = Math.ceil((gold - lastGoldAmount) / 20); // 每次增加多少

    const interval = setInterval(() => {
        // 檢查是否需要增加金幣
        if (lastGoldAmount < gold) {
            lastGoldAmount += incrementStep; // 每次遞增一個步長
            if (lastGoldAmount > gold) {
                lastGoldAmount = gold; // 防止超過金幣的實際值
            }
            goldDisplay.textContent = `金幣: ${lastGoldAmount}`; // 更新顯示的金幣
        } else {
            clearInterval(interval); // 如果達到金幣數量，停止動畫
        }
    }, incrementSpeed);
}

// 點擊按鈕事件：包括連擊獎勵機制
let lastClickTime = 0;
let comboMultiplier = 1;

// clickButton.addEventListener('click', () => {
//     const currentTime = Date.now();
    
//     // 如果兩次點擊間隔小於 500 毫秒，則啟動連擊
//     if (currentTime - lastClickTime < 500) {
//         comboMultiplier++;
//     } else {
//         comboMultiplier = 1; // 超過時間間隔，重置連擊
//     }

//     lastClickTime = currentTime;
    
//     // 根據連擊數量計算金幣
//     gold += goldPerClick * comboMultiplier;
//     updateGoldDisplay();
// });
// 點擊按鈕時觸發金幣動畫
clickButton.addEventListener('click', (event) => {
    const buttonRect = clickButton.getBoundingClientRect(); // 取得按鈕的位置信息
    const startX = buttonRect.left + buttonRect.width / 2; // 金幣從按鈕中央開始
    const startY = buttonRect.top + buttonRect.height / 2;

    // 呼叫金幣動畫
    createCoinAnimation(startX, startY);
    
    // 同時增加金幣數量
    const currentTime = Date.now();
    if (currentTime - lastClickTime < 500) {
        comboMultiplier++;
    } else {
        comboMultiplier = 1;
    }

    lastClickTime = currentTime;
    gold += goldPerClick * comboMultiplier;
    updateGoldDisplay();
});

// 購買自動增長升級
autoUpgradeButton.addEventListener('click', () => {
    if (gold >= upgrades.autoUpgrade.cost) {
        gold -= upgrades.autoUpgrade.cost;
        upgrades.autoUpgrade.owned += 1;
        goldPerSecond += upgrades.autoUpgrade.increment;
        updateGoldDisplay();
        
        // 提升升級成本，簡單增加 50% 作為新成本
        upgrades.autoUpgrade.cost = Math.floor(upgrades.autoUpgrade.cost * 1.5);
        autoUpgradeButton.textContent = `購買自動增長 (成本: ${upgrades.autoUpgrade.cost} 金幣)`;
    } else {
        showPopupMessage('金幣不足！');
    }
});

// 自動增長功能，每秒增加金幣
function autoIncrement() {
    gold += goldPerSecond;
    updateGoldDisplay();
}

// ==================== 獎勵機制 ====================
// 時間獎勵：每 10 分鐘給予獎勵
let totalPlayTime = 0;
const timeBonusInterval = 600; // 每 600 秒 (10 分鐘)

function checkTimeBonus() {
    totalPlayTime++;
    
    if (totalPlayTime % timeBonusInterval === 0) {
        gold += 100; // 給予 100 金幣獎勵
        showPopupMessage('恭喜！你已經玩了 10 分鐘，獲得 100 金幣獎勵！');
        updateGoldDisplay();
    }
}

// 隨機事件：每 60 秒檢查一次是否觸發幸運事件
function randomEvent() {
    const chance = Math.random();
    
    if (chance < 0.05) { // 5% 機率
        gold += 500; // 給予 500 金幣獎勵
        showPopupMessage('幸運事件觸發！你獲得了 500 金幣獎勵！');
        updateGoldDisplay();
    }
}

// ======================= 遊戲動畫 ======================
// 創建金幣動畫
function createCoinAnimation(startX, startY) {
    const coin = document.createElement('div');
    coin.classList.add('coin');
    
    // 設定金幣的初始位置
    coin.style.left = `${startX}px`;
    coin.style.top = `${startY}px`;

    // 將金幣添加到 coin-container
    document.getElementById('coin-container').appendChild(coin);

    // 在動畫結束後移除金幣
    setTimeout(() => {
        coin.remove();
    }, 1000); // 1秒後移除金幣
}


function showPopupMessage(message, duration = 3000) {
    const popup = document.getElementById('popup-message');
    const popupText = document.getElementById('popup-text');

    // 設置訊息內容
    popupText.textContent = message;

    // 顯示彈出訊息
    popup.classList.add('show');
    popup.classList.remove('hidden');

    // 在指定的時間後自動隱藏訊息
    setTimeout(() => {
        popup.classList.remove('show');
        popup.classList.add('hidden');
    }, duration);
}



// ==================== 數據保存與加載 ====================
// 保存遊戲數據至 localStorage
function saveGame() {
    const gameData = {
        gold,
        goldPerClick,
        goldPerSecond,
        upgrades
    };
    localStorage.setItem('idleGameData', JSON.stringify(gameData));
}

// 加載遊戲數據
function loadGame() {
    const savedData = localStorage.getItem('idleGameData');
    if (savedData) {
        const gameData = JSON.parse(savedData);
        gold = gameData.gold;
        goldPerClick = gameData.goldPerClick;
        goldPerSecond = gameData.goldPerSecond;
        Object.keys(upgrades).forEach(key => {
            if (gameData.upgrades[key]) {
                upgrades[key].owned = gameData.upgrades[key].owned;
                upgrades[key].cost = gameData.upgrades[key].cost;
            }
        });
    }
}

// ==================== 定時器與事件綁定 ====================
// 每秒執行自動增長
setInterval(autoIncrement, 1000);

// 每秒增加遊戲時間，檢查時間獎勵
setInterval(checkTimeBonus, 1000);

// 每 60 秒檢查一次隨機事件
setInterval(randomEvent, 60000);

// 每 5 秒自動保存遊戲
setInterval(saveGame, 5000);

// 頁面載入時加載遊戲數據
window.onload = () => {
    loadGame();
    updateGoldDisplay();
    // 更新升級按鈕顯示
    autoUpgradeButton.textContent = `購買自動增長 (成本: ${upgrades.autoUpgrade.cost} 金幣)`;
};
