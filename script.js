
document.addEventListener('DOMContentLoaded', function() {
let savedApi = localStorage.getItem('session')
let apiKey  = '';
let ticket  = {
	count:0,
	percent:0,
}
let isLogin = false;
let isRunning = false
let alwaysReset = true

let casino = 'stake.ac'

let lastBet = {
	amount: 0,
	roll  : 0,
	payout: 0,
	profit: 0,
	target: 0,
	chance: 0,
	nonce : 0,
	betId : 0,
}

let lastWin = {
	amount: 0,
	roll  : 0,
	payout: 0,
	profit: 0,
	target: 0,
	chance: 0,
	nonce : 0,
	betId : 0,	
};

let highest = {
	amount : 0,
	payout : 0,
	lose : 0,
	win : 0,
	profit : 0,
	target : 0,
}

let playgame = "mines"
let currency = "btc"
let balance = 0 ;
let startBalance = balance;
let baseBet = 0;
let nextbet = baseBet;
let previousBet = 0

let win ;

let bets  = 0
let wins  = 0
let losses = 0
let currentstreak = 0
let winstreak = 0
let losestreak = 0

let payout = 0


let profit = 0
let partialProfit = 0;
let wagered = 0

let risk = "medium"
let chance = 0
let mines = 1


let picked = 10 ;
let maxBox ;
let maxSelected ;
switch (playgame) {
	case "keno" :
		maxBox = 40 ;
		maxSelected = 10 ;
		break;
	case "mines" :
		maxBox = 25 ;
		maxSelected = 24
		break;
}

let selectedNumbers = [] ;
let resultNumbers = [] ;

 async function resetStatistic(){
	if(apiKey && currency) balance = await getBalance()
	startBalance = parseFloat(balance)
	console.log(startBalance)
	baseBet = parseFloat(betAmount.value)
	nextbet = baseBet
	win = 0
	highestPayout = 0
	wagered = 0
	profit = 0
	partialProfit = 0
	wins =  0
	loses = 0
	losestreak = 0
	winstreak = 0
	ctWin = 0
	ctLose = 0
	updateStatistic()
}
 

const accountDiv = {
	input: document.getElementById('apiKey'),
	login: document.getElementById('accountLogin'),
	connect : document.getElementById('connectBtn'),
	info: document.getElementById('accountInfo'),
	error : document.getElementById('accountErrorMsg'),
	username : document.getElementById('user-name'),
	created: document.getElementById('userInfo'),
	vip: document.getElementById('user-vip')
}	

const statsDiv = {
	balance :  [document.getElementById('Balance')],
	partial : [document.getElementById('Partial'),document.getElementById('PartialPercent')],
	profit : [document.getElementById('Profit'),document.getElementById('ProfitPercent')],
	wager : [document.getElementById('Wagered'),document.getElementById('WageredPercent')],
	
}

const boxSelectionDiv = {
	grid : document.getElementById('number-grid')
}

const luaCode = {
	div: document.getElementById('luaCode'),
	update : {
		selection : async (newValues) => {
			luaCode.div.value = luaCode.div.value.replace(/(selectedNumbers\s*=\s*\{)([^}]*)(\})/, `$1${newValues}$3`);
			luaCode.div.classList.add('flash');
			setTimeout(() => luaCode.div.classList.remove('flash'), 500);
		},
		basebet : async (newValues) => {
			luaCode.div.value = luaCode.div.value.replace(/(basebet\s*=\s*)([^\s;]+)/, `$1${newValues}`);
			luaCode.div.classList.add('flash');
			setTimeout(() => luaCode.div.classList.remove('flash'), 500);
		},
		risk : async (newValues) => {
			luaCode.div.value = luaCode.div.value.replace(/(risk\s*=\s*")([^"]*)(")/, `$1${newValues}$3`);
			luaCode.div.classList.add('flash');
			setTimeout(() => luaCode.div.classList.remove('flash'), 500);
		},
		pick : async (newValues) => {
			luaCode.div.value = luaCode.div.value.replace(/(picked\s*=\s*)([^\s;]+)/, `$1${newValues}`);
			luaCode.div.classList.add('flash');
			setTimeout(() => luaCode.div.classList.remove('flash'), 500);
		},
		game : async (newValues) => {
			luaCode.div.value = luaCode.div.value.replace(/(playgame\s*=\s*")([^"]*)(")/, `$1${newValues}$3`);
			luaCode.div.classList.add('flash');
			setTimeout(() => luaCode.div.classList.remove('flash'), 500);
		}
	}
}

const clearBtn = document.getElementById('clear-table-btn');
const randPickBtn = document.getElementById('auto-pick-btn');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');

const selectedDiv = document.getElementById('selected-numbers');
const resultsDiv = document.getElementById('bet-results');

const betError = document.getElementById('betErrorMsg');

const randomizerDiv = document.querySelectorAll('input[name="randomizer"]');
let randomizer = [] ;



const payoutDisplay = document.getElementById('payoutShow');
const payoutAmount = document.getElementById('payoutAmount');
const betAmount = document.getElementById('bet-amount');
const selectCurrency = document.getElementById('currency-select');
const selectRisk = document.getElementById('risk-select');
const selectMax = document.getElementById('max-select');
const selectGame = document.getElementById('game-select');
const selectMines = document.getElementById('mines-select');

const highestDiv = {
	amount : document.getElementById('high-bet'),
	payout : document.getElementById('high-payout'),
	lose : document.getElementById('high-losses'),
	win : document.getElementById('high-wins'),
}
const countDiv = {
	bet : document.getElementById('total-bet'),
	lose : document.getElementById('total-losses'),
	win : document.getElementById('total-wins'),
	streak : document.getElementById('total-streak'),
}
const ticketDiv = {
	count: document.getElementById('ticket-count'),
	wager: document.getElementById('ticket-wager'),
}

const stakeCurrency = [
  "btc", "eth", "ltc",
  "usdt", "sol", "doge",
  "bch", "xrp", "trx",
  "eos", "bnb", "usdc",
  "ape", "busd", "cro",
  "dai", "link", "sand",
  "shib", "uni", "pol"
];



function identifier(length) {
	var chars = '_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
	var result = '';
	for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
	return result;
}

async function updateHighest(){
	highestDiv.payout.textContent = `${highest.payout} X`
	highestDiv.amount.textContent = `${highest.amount.toFixed(8)} ${currency.toUpperCase()}`
	highestDiv.lose.textContent = `${highest.lose.toFixed(8)} ${currency.toUpperCase()}`
	highestDiv.win.textContent = `${highest.win.toFixed(8)} ${currency.toUpperCase()}`
	
	countDiv.bet.textContent = bets
	countDiv.lose.textContent = `${losestreak} / ${losses}`
	countDiv.win.textContent = `${winstreak} / ${wins}`
	countDiv.streak.textContent = currentstreak
	
}

async function fetchStake1(payload) {
	const xhr = new XMLHttpRequest();
	const url = 'https://' + casino + '/_api/graphql'
	const method = "POST"
	
	const headers = {
	"Content-Type": "application/json",
	"x-access-token": apiKey,
	}
	const body =  JSON.stringify(payload)
	return new Promise((resolve, reject) => {		
		xhr.open(method, url, true);
		for (const [key, value] of Object.entries(headers)) {
			xhr.setRequestHeader(key, value);
		}
		xhr.onload = () => resolve(JSON.parse(xhr.responseText))
		xhr.onerror = reject	
		xhr.send(body);
	});
}
async function fetchStake(payload) {
	const response = await fetch('https://' + casino + '/_api/graphql', {
		timeout:300,
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-access-token": apiKey,
			"origin": '*',
			//"referer":`https://${casino}`,
		},
		//credentials: 'include',
		body: JSON.stringify(payload)
	});
	if (!response.ok) {
		throw new Error(response.status+'Client Error: '+response.statusText);
	}
	return response.json();
}

async function fetchStake2(payload) {
    const randomNumber = Math.random();
    
    // Call functionA or functionB based on the random number
    if (randomNumber < 0.5) {
        return await fetchStake1(payload);
    } else {
        return await fetchStake2(payload);
    }
}
async function getUser() {
	const payload = {
				variables: { "signupCode": true },
				query: `query UserMeta($name: String, $signupCode: Boolean = false) { user(name: $name) { id name isMuted isRainproof isBanned createdAt campaignSet selfExclude { id status active createdAt expireAt } signupCode @include(if: $signupCode) { id code { id code } } } }`
			};
	const response = await fetchStake(payload);
	return response?.data.user;
}
async function getBalance() {
	const payload = {
		operationName: `UserBalances`,
		query: "query UserBalances {\n  user {\n    id\n    balances {\n      available {\n        amount\n        currency\n        __typename\n      }\n      vault {\n        amount\n        currency\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
	};
	const response = await fetchStake(payload)
	return response?.data.user.balances.find(balance => balance.available.currency == currency)?.available.amount;
}
async function getTicket(){
	const payload = {
		variables: { isAuthenticated: true },
		query: "query ActiveRaffles($isAuthenticated: Boolean = false) { activeRaffles { id name description reward startTime endTime ticketCount ticketValue promotionPeriod raffleUser    @include(if: $isAuthenticated) { progress ticketCount } } }"
	};
	const response = await fetchStake(payload)
	return response?.data.activeRaffles[0].raffleUser
}
async function getVip(){
	const payload = {
		query: "query VipProgressMeta {\n  user {\n    id\n    flagProgress {\n      flag\n      progress\n    }\n  }\n}\n",
		variables: {}
	}
	const response = await fetchStake(payload)
	return response?.data.user.flagProgress

}
function tittleCase(str) {
    return str
        .toLowerCase() // Convert the entire string to lowercase
        .split(' ') // Split the string into words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
        .join(' '); // Join the words back into a single string
}
async function updateVip(){
	const response = await getVip()
	if(response){	
		let vipName;
		switch(response.flag){
			case "wagered(500k)" :
				vipName = "Platinum II"
				break;
			case "wagered(1m)" :
				vipName = "Platinum III"
				break;
			case "wagered(2.5m)" :
				vipName = "Platinum IV"
				break;
			case "wagered(5m)" :
				vipName = "Platinum V"
				break;
			case "wagered(10m)" :
				vipName = "Platinum V"
				break;	
			default:
				vipName = tittleCase(response.flag)
				break;
		}
		accountDiv.vip.textContent = `${vipName} - ${parseFloat(response.progress*100).toFixed(2)} %`
		
	}
}
async function updateTicket(){
	const response = await getTicket()
	if(response){
		ticketDiv.count.textContent = response.ticketCount
		ticketDiv.wager.textContent = `$${parseFloat(response.progress*1000).toFixed(2)} / $1,000`
	}
}
async function fetchBet(payload) {
	const response = await fetch('https://' + casino + '/_api/casino/' + playgame + '/bet', {
		timeout:300,
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-access-token": apiKey,
			"origin": '*',
			//"referer":`https://${casino}`,
		},
		//credentials: 'include',
		body: JSON.stringify(payload)
	});
	if (!response.ok) {
		throw new Error(response.status+'Client Error: '+response.statusText);
	}
	return response.json();
}
function betPayload(){
	switch (playgame) {
		case "keno" :
			return {
				"amount": nextbet,
				"currency": currency,
				"identifier": identifier(21),
				"risk": risk,
				"numbers": selectedNumbers
			}
		case "mines" :
			return {
				"amount": nextbet,
				"currency": currency,
				"identifier": identifier(21),
				"minesCount": mines,
				"fields": selectedNumbers
			}
	}
}


async function placeBet(){
	const response = await fetchBet(betPayload())
	const trigger = playgame + 'Bet'
	if(response && response[trigger]){
		return response[trigger]
	}else{
		return response
	}
}
function updateStatistic(){
	statsDiv.balance[0].textContent = `${balance.toFixed(8)} ${currency.toUpperCase()}`;
	statsDiv.profit[0].textContent = `${profit.toFixed(8)} ${currency.toUpperCase()}`;
	statsDiv.profit[1].textContent = `${(parseFloat(profit)/parseFloat(startBalance)*100).toFixed(2)}%`;
	statsDiv.partial[0].textContent = `${partialProfit.toFixed(8)} ${currency.toUpperCase()}`;
	statsDiv.partial[1].textContent = `${(parseFloat(partialProfit)/parseFloat(startBalance)*100).toFixed(2)}%`;
	statsDiv.wager[0].textContent = `${wagered.toFixed(8)} ${currency.toUpperCase()}`;
	statsDiv.wager[1].textContent = `${(parseFloat(wagered)/parseFloat(startBalance)*100).toFixed(2)}%`;
}	
function renderPayout(){
	payoutAmount.textContent = `${lastBet.payout.toFixed(2)}×`
	if(lastBet.payout > 1){
		//payoutDisplay.classList.remove("hidden")
		payoutAmount.classList.remove("border-red-600","text-red-600")
		payoutAmount.classList.add("border-lime-300","text-lime-300")
	}else{
		payoutAmount.classList.remove("border-lime-300","text-lime-300")
		payoutAmount.classList.add("border-red-600","text-red-600")
	}
}
function updateButtonState() {
	startBtn.disabled = selectedNumbers.size === 0;
}
function clearButtonDisplay(div){
	const classes = Array.from(div.classList);
	const classesToRemove = classes.filter(className => className.startsWith('bg-') || className.startsWith('text-') || className.startsWith('hover:bg-'));
	classesToRemove.forEach(className => div.classList.remove(className));
}
function toggleNumber(div) {
	const num = Number(div.dataset.number);
	if (selectedNumbers.includes(num)) {
		selectedNumbers = selectedNumbers.filter(n => n !== num);
	} else {
		if (selectedNumbers.length < maxSelected) {
			selectedNumbers.push(num);
		}
	}
	if(!isRunning) luaCode.update.selection(selectedNumbers)
	displaySelected()
}
function renderMaxOptions(){
	selectMax.innerHTML = ''; // Clear existing options 
	for (let i = 1; i <= maxSelected; i++) {
		const option = document.createElement('option');
			option.value = i;
			option.textContent = String(i).padStart(2, '0');
			option.className = 'mr-2'; // Adding your requested class
			selectMax.appendChild(option);
	}
	selectMax.value = maxSelected
}
function renderMaxMinesOptions(){
	selectMax.innerHTML = ''; // Clear existing options 
	for (let i = 1; i <= maxBox-mines; i++) {
		const option = document.createElement('option');
			option.value = i;
			option.textContent = String(i).padStart(2, '0');
			option.className = 'mr-2'; // Adding your requested class
			selectMax.appendChild(option);
	}
	selectMines.innerHTML = ''; // Clear existing options 
	for (let i = 1; i <= maxBox-picked; i++) {
		const option = document.createElement('option');
			option.value = i;
			option.textContent = String(i).padStart(2, '0');
			option.className = 'mr-2'; // Adding your requested class
			selectMines.appendChild(option);
	}
	selectMax.value = picked
	selectMines.value = mines
}
function renderBoxNumbers() {
	boxSelectionDiv.grid.innerHTML = '';
	//element.className = element.className.replace(/oldClass/g, "newClass");
	switch (playgame) {
	case "keno" :
		maxBox = 40 ;
		maxSelected = 10
		boxSelectionDiv.grid.className = 'flex justify-center grid grid-cols-8 sm:grid-cols-8 gap-2 sm:gap-3'
		selectRisk.parentNode.classList.remove("hidden")
		selectMines.parentNode.classList.add("hidden")
		renderMaxOptions()
		break;
	case "mines" :
		maxBox = 25 ;
		maxSelected = maxBox-mines ;
		selectRisk.parentNode.classList.add("hidden")
		selectMines.parentNode.classList.remove("hidden")
		boxSelectionDiv.grid.className = 'max-w-5/8 grid grid-cols-5 sm:grid-cols-5 gap-2 sm:gap-3'
		renderMaxMinesOptions()
		break;
	}
	for (let i = 0; i < maxBox; i++) {
		const box = document.createElement('div');
		box.className = 'bg-gray-900 aspect-[1/1] rounded-md flex justify-center items-center font-bold text-lg cursor-pointer hover:bg-gray-800';
		box.textContent = (i + 1).toString();
		box.dataset.number = i.toString();
		box.addEventListener('click', () => {
			toggleNumber(box);
		});
		boxSelectionDiv.grid.appendChild(box);
	}
	selectCurrency.value = currency
	selectRisk.value = risk
	selectGame.value = playgame

}


function displaySelected() {
	Array.from(boxSelectionDiv.grid.children).forEach(div => {
		const num = Number(div.dataset.number);
		if (selectedNumbers.includes(num)) {
			clearButtonDisplay(div)
			div.classList.add('bg-gray-600', 'text-white', 'hover:bg-gray-500', 'text-lg');
			
		} else {
			clearButtonDisplay(div)
			div.classList.add('bg-gray-900', 'text-white', 'hover:bg-gray-800', 'text-lg');
			
		}
	});
	const arr = selectedNumbers
		.sort((a, b) => a - b);
	selectedDiv.textContent = JSON.stringify(arr);
}

function displayResult() {
	displaySelected() 
	resultsDiv.textContent = JSON.stringify(resultNumbers);
	switch (playgame) {
	case "keno" :	
		resultNumbers.forEach(num => {
			const div = boxSelectionDiv.grid.querySelector(`[data-number="${num}"]`);
			if (!div) return;
			if (selectedNumbers.includes(num)) {
				clearButtonDisplay(div)
				div.classList.add('bg-lime-300', 'text-black', 'text-lg');
			}else{
				clearButtonDisplay(div)
				div.classList.add('bg-gray-950', 'text-red-600', 'text-lg');
			}
		});
		break;
	case "mines" :	
		const matchNumbers = selectedNumbers.filter(value => resultNumbers.includes(value));
		if(matchNumbers.length){
			resultNumbers.forEach(num => {
				const div = boxSelectionDiv.grid.querySelector(`[data-number="${num}"]`);
				if (!div) return;
				clearButtonDisplay(div)
				div.classList.add('bg-gray-950', 'text-red-600', 'text-lg');
			});
			resultNumbers.forEach(num => {
				const div = boxSelectionDiv.grid.querySelector(`[data-number="${num}"]`);
				if (!div) return;
				clearButtonDisplay(div)
				div.classList.add('bg-gray-800', 'text-red-600', 'text-lg');
			});
		}else{
			selectedNumbers.forEach(num => {
				const div = boxSelectionDiv.grid.querySelector(`[data-number="${num}"]`);
				if (!div) return;
				clearButtonDisplay(div)
				div.classList.add('bg-lime-300', 'text-black', 'text-lg');
			});
			resultNumbers.forEach(num => {
				const div = boxSelectionDiv.grid.querySelector(`[data-number="${num}"]`);
				if (!div) return;
				clearButtonDisplay(div)
				div.classList.add('bg-gray-950', 'text-red-600', 'text-lg');
			});
		}
		break
	}
}

function generate(seed = Date.now()) {
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    seed = (a * seed + c) % m;
    return seed / m; // Returns a number between 0 and 1
}

function generateLCG(resultSize,arraySize, seed = Date.now()) {
  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32);
  let x = seed >>> 0;
  const numbers = new Set();

  while (numbers.size < resultSize) {
    x = (a * x + c) % m;
    // Map to 0..39
    const num = x % arraySize;
    numbers.add(num);
  }

  return Array.from(numbers);
}

function generateFisherYates(resultSize,arraySize) {
  const array = Array.from({ length: arraySize }, (_, i) => i);
  for (let i = arraySize - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.slice(0, resultSize);
}

function generateGaussian(resultSize,arraySize) {
  const numbers = new Set();

  function boxMuller() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  while (numbers.size < resultSize) {
    const z = boxMuller();
    // Normalize z into range 0..39
    // Assuming mean 19.5, stddev ~7, clamp in 0-39
    let num = Math.round(z * 7 + 19.5);
    if (num < 0) num = 0;
    if (num >= arraySize) num = arraySize - 1;
    numbers.add(num);
  }
  return Array.from(numbers);
}

function generateBinaryFind(resultSize,arraySize) {
  let array = Array.from({ length: arraySize }, (_, i) => i);
  const numbers = new Set();

  // We'll repeatedly choose midpoints and randomly decide to pick or move left/right to simulate randomness
  while (numbers.size < resultSize && array.length > 0) {
    let left = 0;
    let right = array.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      // With 50% chance, pick midpoint
      if (Math.random() < 0.5) {
        numbers.add(array[mid]);
        array.splice(mid, 1); // Remove chosen number
        break;
      } else {
        // Otherwise decide randomly left or right segment for next iteration
        if (Math.random() < 0.5) {
          right = mid - 1;
        } else {
          left = mid + 1;
        }
      }
    }

    // If while loop exits without picking (rare due to logic), pick random element anyway
    if (numbers.size < resultSize && (left > right)) {
      // Pick random from array
      const idx = Math.floor(Math.random() * array.length);
      numbers.add(array[idx]);
      array.splice(idx, 1);
    }
  }

  // Defensive fallback if less than resultSize numbers selected due to logic
  while (numbers.size < resultSize && array.length > 0) {
    numbers.add(array.pop());
  }

  return Array.from(numbers);
}

// Function to randomly call one of the above functions
function callRandomFunction(minSize,maxSize) {
	const functionsMap = {
		generateLCG,
		generateFisherYates,
		generateBinaryFind,
		generateGaussian,
	};
	const functionList = randomizer.map(name => functionsMap[name]);
	const randomIndex = Math.floor(generate() * functionList.length);
	const selectedFunction = functionList[randomIndex];
	// Call the selected function with appropriate arguments
	switch (selectedFunction) {
		case generateFisherYates:
			return selectedFunction(minSize,maxSize);
		case generateBinaryFind:
			return selectedFunction(minSize,maxSize); 
		case generateGaussian:
			return selectedFunction(minSize,maxSize); 
		default:
			//return generateLCG(minSize,maxSize); 
	}
}
// TESTING - Run each method and print results

async function autoPick() {
	console.log(maxBox)
	console.log(maxSelected)
	console.log(picked)
	selectedNumbers = callRandomFunction(picked, maxBox)
	console.log(selectedNumbers)
	selectedNumbers.sort((a, b) => a - b);
	if(!isRunning) luaCode.update.selection(selectedNumbers)
	
}

async function startBet() {
	
	while (isRunning) {
		betError.classList.add("hidden");
		resultNumbers = []
		betAmount.value = nextbet.toFixed(8)

		try{
			const [ betData, rbalance] = await Promise.all([placeBet(), getBalance()]);
			balance = rbalance ? rbalance : balance 
			if(betData){
				if(betData.errors){
						//console.log(betData)
						isRunning = false
						resumeBtn.classList.remove('hidden');
						clearBtn.classList.remove('hidden');
						randPickBtn.classList.remove('hidden');
						stopBtn.classList.remove('hidden');
						pauseBtn.classList.add('hidden');
						betError.textContent = `[ ${betData.errors[0].errorType} ] ${betData.errors[0].message}`;
						betError.classList.remove("hidden");
						
				}else{
					payoutDisplay.classList.remove("hidden")
					lastBet.amount = betData.amount;
					lastBet.payout = betData.payoutMultiplier;
					lastBet.profit = parseFloat(betData.payout) - parseFloat(betData.amount);
					switch (playgame) {
						case "keno" :
							lastBet.target = betData.state.selectedNumbers;
							lastBet.roll   = betData.state.drawnNumbers;
							break;
						case "mines" :
							lastBet.target = betData.state.selectedNumbers;
							lastBet.roll   = betData.state.mines;
							break;
					}
					resultNumbers = lastBet.roll
					profit += lastBet.profit
					partialProfit += lastBet.profit
					wagered += lastBet.amount
					
					bets ++
					if(lastBet.payout >= 1 ){
						lastBet.win = true;
						win = true
						wins ++
						currentstreak = Math.max(currentstreak+1,1)
						winstreak = Math.max(currentstreak,winstreak)
						
						lastWin.amount = betData.amount;
						lastWin.payout = betData.payoutMultiplier;
						lastWin.roll   = betData.state.drawnNumbers;
						lastWin.profit = parseFloat(betData.payout) - parseFloat(betData.amount);
						lastWin.target = betData.state.selectedNumbers;	
					}else{
						lastBet.win = false;
						win = false
						losses ++
						currentstreak = Math.min(currentstreak-1,-1)
						losestreak = Math.min(currentstreak,losestreak)
						
					}
					
					nextbet = Math.abs(partialProfit)/25
					nextbet = Math.max(nextbet,baseBet)	
										
					if(partialProfit >= 0){
						partialProfit = 0
						nextbet = baseBet
					}
					

					if(ctWin && ctWin%2== 0){
						autoPick()
					}
					if(lastBet.payout == 4){
						autoPick()
					}
					highest.amount = Math.max(highest.amount,lastBet.amount)
					highest.payout = Math.max(highest.payout,lastBet.payout)
					highest.lose = Math.min(highest.lose,lastBet.profit)
					highest.win = Math.max(highest.win,lastBet.profit)
					updateHighest()
					displayResult();
					renderPayout()
					updateStatistic()
				}
			}
		
		}catch(err){
			console.log(err)
		}
		
		//isRunning = false
	}
	payoutDisplay.classList.add("hidden")

}

selectCurrency.addEventListener('change', async (e) => {
	currency = e.target.value;
	baseBet = parseFloat(betAmount.value)
	nextbet = baseBet
	await resetStatistic()
});
selectMax.addEventListener('change', async (e) => {
	picked = e.target.value;
	if(playgame == 'mines')renderMaxMinesOptions()
	if(!isRunning) luaCode.update.pick(picked)
});
selectGame.addEventListener('change', async (e) => {
	playgame = e.target.value;
	if(!isRunning) luaCode.update.game(playgame)
	renderBoxNumbers() 
});
selectMines.addEventListener('change', async (e) => {
	mines = e.target.value;
	renderMaxMinesOptions()
	
});
selectRisk.addEventListener('change', async (e) => {
	risk = e.target.value;
	if(!isRunning) luaCode.update.risk(risk)

});
betAmount.addEventListener('input', () => {
	baseBet = parseFloat(betAmount.value)
	if(!isRunning) luaCode.update.basebet(baseBet)
	nextbet = baseBet

});
clearBtn.addEventListener('click', () => {
	selectedNumbers = [];
	resultNumbers = [];
	if(!isRunning) luaCode.update.selection(selectedNumbers)
	displaySelected()
});
startBtn.addEventListener('click', async () => {
	if (alwaysReset) await resetStatistic()
	if (!selectedNumbers.length) {
		autoPick()
	}
	stopBtn.classList.remove('hidden');
	pauseBtn.classList.remove('hidden');
	startBtn.classList.add('hidden');
	randPickBtn.classList.add('hidden');
	clearBtn.classList.add('hidden');
	startBtn.classList.add('hidden');
	isRunning = true
	startBet()
});
stopBtn.addEventListener('click', async () => {
	isRunning = false
	startBtn.classList.remove('hidden');
	clearBtn.classList.remove('hidden');
	randPickBtn.classList.remove('hidden');
	pauseBtn.classList.add('hidden');
	resumeBtn.classList.add('hidden');
	stopBtn.classList.add('hidden');
});
resumeBtn.addEventListener('click', async () => {
	if (!selectedNumbers.length) {
		autoPick()
	}
	stopBtn.classList.remove('hidden');
	pauseBtn.classList.remove('hidden');
	startBtn.classList.add('hidden');
	randPickBtn.classList.add('hidden');
	clearBtn.classList.add('hidden');
	resumeBtn.classList.add('hidden');
	isRunning = true
	startBet()
});
pauseBtn.addEventListener('click', async () => {
	isRunning = false
	resumeBtn.classList.remove('hidden');
	clearBtn.classList.remove('hidden');
	randPickBtn.classList.remove('hidden');
	stopBtn.classList.remove('hidden');
	pauseBtn.classList.add('hidden');
});
randPickBtn.addEventListener('click', ()=>{
	autoPick()
	displaySelected()
	payoutDisplay.classList.add("hidden")

});

stakeCurrency.forEach(curr => {
	const option = document.createElement('option');
	option.value = curr;
	option.textContent = `  ${curr.toUpperCase()}  `;
	selectCurrency.appendChild(option);
	
});

randomizerDiv.forEach(cb => cb.addEventListener('change', ()=> {
	randomizer = Array.from(randomizerDiv)
        .filter(cb => cb.checked)
		.map(cb => cb.value);
	console.log('Checked randomizer values:', randomizer);
}));

async function connectApi(){
	console.log(isLogin)
	if(!isLogin){
		if (!apiKey || apiKey.length !== 96) {
			accountDiv.error.textContent = "API Key must be exactly 96 characters.";
			accountDiv.error.classList.remove("hidden");
			return;
		}
		const user = await getUser();
		if (!user ) {
			isLogin = false
			accountDiv.err.textContent = "Invalid API Key or unable to fetch username.";
			accountDiv.error.classList.remove("hidden");
			return;
		}else{
			isLogin = true	
			localStorage.setItem('session', apiKey);			
			updateTicket()
			updateVip()
			if( user.name ) accountDiv.username.textContent = user.name
			if( user.createdAt ) {
				const parsedDate = new Date(user.createdAt);
				const options = { year: 'numeric', month: 'long', day: 'numeric' };
				const formattedDate = parsedDate.toLocaleDateString('en-US', options);
				accountDiv.created.textContent = `Joined on ${formattedDate}`
			}
			accountDiv.login.classList.add("hidden");
			accountDiv.info.classList.remove("hidden");
			accountDiv.connect.textContent = 'logout';
		}
	}else{
		isLogin = false
		apiKey = null
		localStorage.setItem('session', apiKey);
		accountDiv.input.value = ''
		accountDiv.login.classList.remove("hidden");
		accountDiv.info.classList.add("hidden");
		accountDiv.connect.textContent = 'login';
	}

}

accountDiv.connect.addEventListener("click", async () => {
	accountDiv.error.classList.add("hidden");
	if(!isLogin) apiKey = accountDiv.input.value.trim();
	
	connectApi()
});
document.querySelectorAll('.tab-button').forEach(button => {
	button.addEventListener('click', () => {
		document.querySelectorAll('.tab-button').forEach(btn => {
			btn.classList.add('cursor-pointer','text-lime-300')
			btn.classList.remove('text-gray-950','bg-lime-300')
		});
		document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
		button.classList.add('text-gray-950','bg-lime-300')
		button.classList.remove('cursor-pointer','text-lime-300')
		const tabId = button.getAttribute('data-tab');
		document.getElementById(tabId).classList.remove('hidden');
	});
});
if(savedApi != 'undefined' && savedApi != 'null' && savedApi != '' && savedApi) {
	console.log(savedApi)
	apiKey =  savedApi
	connectApi()
}
renderBoxNumbers()
});
