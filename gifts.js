const bondLevels = {
            1: 0, 2: 15, 3: 45, 4: 75, 5: 110, 6: 145, 7: 180, 8: 220, 9: 260, 10: 300,
            11: 360, 12: 450, 13: 555, 14: 675, 15: 815, 16: 975, 17: 1155, 18: 1360, 19: 1590, 20: 1845,
            21: 2130, 22: 2445, 23: 2790, 24: 3165, 25: 3575, 26: 4020, 27: 4500, 28: 5020, 29: 5580, 30: 6180,
            31: 6825, 32: 7515, 33: 8250, 34: 9030, 35: 9860, 36: 10740, 37: 11670, 38: 12655, 39: 13695, 40: 14790,
            41: 15945, 42: 17160, 43: 18435, 44: 19770, 45: 21170, 46: 22635, 47: 24165, 48: 25765, 49: 27435, 50: 29175,
            51: 30990, 52: 32880, 53: 34845, 54: 36885, 55: 39005, 56: 41205, 57: 43485, 58: 45850, 59: 48300, 60: 50835,
            61: 53460, 62: 56175, 63: 58980, 64: 61875, 65: 64865, 66: 67950, 67: 71130, 68: 74410, 69: 77790, 70: 81270,
            71: 84855, 72: 88545, 73: 92340, 74: 96240, 75: 100250, 76: 104370, 77: 108600, 78: 112945, 79: 117405, 80: 121980,
            81: 126675, 82: 131490, 83: 136425, 84: 141480, 85: 146660, 86: 151965, 87: 157395, 88: 162955, 89: 168645, 90: 174465,
            91: 180420, 92: 186510, 93: 192735, 94: 199095, 95: 205595, 96: 212235, 97: 219015, 98: 225940, 99: 233010, 100: 240225
        };

        const giftValues = {
            '2meh': 20, '2like': 40, '2fav': 60, '2love': 80,
            '3meh': 60, '3like': 120, '3fav': 180, '3love': 240
        };

        const giftNames = {
            '2meh': '2★ Meh Gifts', '2like': '2★ Like Gifts', '2fav': '2★ Favorite Gifts', '2love': '2★ Loved Gifts',
            '3meh': '3★ Meh Gifts', '3like': '3★ Like Gifts', '3fav': '3★ Favorite Gifts', '3love': '3★ Loved Gifts'
        };

        function initializeDropdowns() {
            const currentSelect = document.getElementById('currentLevel');
            const targetSelect = document.getElementById('targetLevel');
            
            for (let level = 1; level <= 100; level++) {
                const currentOption = document.createElement('option');
                currentOption.value = level;
                currentOption.textContent = `Level ${level}`;
                currentSelect.appendChild(currentOption);
                
                const targetOption = document.createElement('option');
                targetOption.value = level;
                targetOption.textContent = `Level ${level}`;
                targetSelect.appendChild(targetOption);
            }
        }

        function getLevelFromXP(xp) {
            for (let level = 100; level >= 1; level--) {
                if (xp >= bondLevels[level]) {
                    return level;
                }
            }
            return 1;
        }

        function calculate() {
            const currentLevel = parseInt(document.getElementById('currentLevel').value);
            const targetLevel = parseInt(document.getElementById('targetLevel').value);
            
            if (!currentLevel || !targetLevel) {
                showError('Please select both current and target bond levels.');
                return;
            }
            
            if (targetLevel <= currentLevel) {
                showError('Target level must be higher than current level.');
                return;
            }

            // Calculate current XP from gifts
            const currentGifts = {
                '2meh': parseInt(document.getElementById('gift2Meh').value) || 0,
                '2like': parseInt(document.getElementById('gift2Like').value) || 0,
                '2fav': parseInt(document.getElementById('gift2Fav').value) || 0,
                '2love': parseInt(document.getElementById('gift2Love').value) || 0,
                '3meh': parseInt(document.getElementById('gift3Meh').value) || 0,
                '3like': parseInt(document.getElementById('gift3Like').value) || 0,
                '3fav': parseInt(document.getElementById('gift3Fav').value) || 0,
                '3love': parseInt(document.getElementById('gift3Love').value) || 0
            };

            let currentXPFromGifts = 0;
            for (const [giftType, quantity] of Object.entries(currentGifts)) {
                currentXPFromGifts += quantity * giftValues[giftType];
            }

            const startingXP = bondLevels[currentLevel];
            const totalCurrentXP = startingXP + currentXPFromGifts;
            const achievableLevel = getLevelFromXP(totalCurrentXP);
            
            const targetXP = bondLevels[targetLevel];
            const neededXP = Math.max(0, targetXP - totalCurrentXP);

            const optimalGifts = calculateOptimalGifts(neededXP);

            displayResults(currentLevel, targetLevel, achievableLevel, totalCurrentXP, targetXP, neededXP, optimalGifts);
        }

        function calculateOptimalGifts(neededXP) {
            if (neededXP <= 0) return {};

            const sortedGifts = Object.entries(giftValues).sort((a, b) => b[1] - a[1]);
            const result = {};
            let remainingXP = neededXP;

            for (const [giftType, xpValue] of sortedGifts) {
                if (remainingXP <= 0) break;
                const needed = Math.floor(remainingXP / xpValue);
                if (needed > 0) {
                    result[giftType] = needed;
                    remainingXP -= needed * xpValue;
                }
            }

            return result;
        }

        function displayResults(currentLevel, targetLevel, achievableLevel, totalCurrentXP, targetXP, neededXP, allGiftOptions) {
            const resultsDiv = document.getElementById('results');
            
            let resultsHTML = '<div class="results">';
            resultsHTML += '<h3>Calculation Results</h3>';
            
            resultsHTML += '<div class="current-status">';
            resultsHTML += `<h4>Current Status:</h4>`;
            resultsHTML += `<p><strong>Starting Level:</strong> ${currentLevel} (${bondLevels[currentLevel]} XP)</p>`;
            resultsHTML += `<p><strong>Total XP with current gifts:</strong> ${totalCurrentXP} XP</p>`;
            resultsHTML += `<p><strong>Achievable Level with current gifts:</strong> Level ${achievableLevel}</p>`;
            resultsHTML += '</div>';
            
            if (achievableLevel >= targetLevel) {
                resultsHTML += '<div class="gift-requirements">';
                resultsHTML += `<h4>Congrats, Sensei!</h4>`;
                resultsHTML += `<p>Your current gifts are enough to reach Level ${targetLevel}!</p>`;
                resultsHTML += '</div>';
            } else {
                resultsHTML += '<div class="gift-requirements">';
                resultsHTML += `<h4>Gift Options to Reach Level ${targetLevel}:</h4>`;
                resultsHTML += `<p><strong>Additional XP needed:</strong> ${neededXP} XP</p>`;
                resultsHTML += `<p><strong>Choose any of these options:</strong></p>`;
                
                // Calculate and display each option manually
                const gift3Love = Math.ceil(neededXP / 240);
                const gift3Fav = Math.ceil(neededXP / 180);
                const gift3Like = Math.ceil(neededXP / 120);
                const gift3Meh = Math.ceil(neededXP / 60);
                const gift2Love = Math.ceil(neededXP / 80);
                const gift2Fav = Math.ceil(neededXP / 60);
                const gift2Like = Math.ceil(neededXP / 40);
                const gift2Meh = Math.ceil(neededXP / 20);
                
                resultsHTML += `<div class="gift-req-item">`;
                resultsHTML += `<strong>${gift3Love}</strong> × 3★ Loved Gifts = ${gift3Love * 240} XP`;
                resultsHTML += `</div>`;
                
                resultsHTML += `<div class="gift-req-item">`;
                resultsHTML += `<strong>${gift3Fav}</strong> × 3★ Favorite Gifts = ${gift3Fav * 180} XP`;
                resultsHTML += `</div>`;
                
                resultsHTML += `<div class="gift-req-item">`;
                resultsHTML += `<strong>${gift3Like}</strong> × 3★ Like Gifts = ${gift3Like * 120} XP`;
                resultsHTML += `</div>`;
                
                resultsHTML += `<div class="gift-req-item">`;
                resultsHTML += `<strong>${gift3Meh}</strong> × 3★ Meh Gifts = ${gift3Meh * 60} XP`;
                resultsHTML += `</div>`;
                
                resultsHTML += `<div class="gift-req-item">`;
                resultsHTML += `<strong>${gift2Love}</strong> × 2★ Loved Gifts = ${gift2Love * 80} XP`;
                resultsHTML += `</div>`;
                
                resultsHTML += `<div class="gift-req-item">`;
                resultsHTML += `<strong>${gift2Fav}</strong> × 2★ Favorite Gifts = ${gift2Fav * 60} XP`;
                resultsHTML += `</div>`;
                
                resultsHTML += `<div class="gift-req-item">`;
                resultsHTML += `<strong>${gift2Like}</strong> × 2★ Like Gifts = ${gift2Like * 40} XP`;
                resultsHTML += `</div>`;
                
                resultsHTML += `<div class="gift-req-item">`;
                resultsHTML += `<strong>${gift2Meh}</strong> × 2★ Meh Gifts = ${gift2Meh * 20} XP`;
                resultsHTML += `</div>`;
                
                resultsHTML += '</div>';
            }
            
            resultsHTML += '</div>';
            resultsDiv.innerHTML = resultsHTML;
        }

        function showError(message) {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = `<div class="error">⚠️ ${message}</div>`;
        }

        // Initialize the page
        initializeDropdowns();
