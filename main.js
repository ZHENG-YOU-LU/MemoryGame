// 設定遊戲狀態
const GAME_STATE = {
	FirstCardAwaits: 'FirstCardAwaits',
	SecondCardAwaits: 'SecondCardAwaits',
	CardsMatchFailed: 'CardsMatchFailed',
	CardsMatched: 'CardsMatched',
	GameFinished: 'GameFinished'
}
// 常數儲存的資料不會變動，因此習慣上將首字母大寫以表示此特性。
const Symbols = [
	'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
	'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
	'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
	'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]
const view = {
	// 渲染牌背元件，遊戲初始化時會透過 view.displayCards 直接呼叫
	getCardElement(index) {
		return `<div data-index="${index}" class="card back"></div>`
	},
	// 產生牌面元件，使用者點擊時才由負責翻牌的函式來呼叫
	// 負責生成卡片內容，包括花色和數字
	// 00 - 12：黑桃 1 - 13
	// 13 - 25：愛心 1 - 13
	// 26 - 38：方塊 1 - 13
	// 39 - 51：梅花 1 - 13
	getCardContent(index) {
		const number = this.transformNumber((index % 13) + 1)
		const symbol = Symbols[Math.floor(index / 13)]
		return `
      <p>${number}</p>
      <img src="${symbol}" />
      <p>${number}</p>
    `
	},
	transformNumber(number) {
		switch (number) {
			case 1:
				return 'A'
			case 11:
				return 'J'
			case 12:
				return 'Q'
			case 13:
				return 'K'
			default:
				return number
		}
	},
	// 負責選出 #cards 並抽換內容
	displayCards(indexes) {
		const rootElement = document.querySelector('#cards')
		rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
	},
	// 翻牌
	flipCards(...cards) {
		cards.map(card => {
			if (card.classList.contains('back')) {
				// 回傳正面
				card.classList.remove('back')
				card.innerHTML = this.getCardContent(Number(card.dataset.index))
				return
			}
			// 回傳背面
			card.classList.add('back')
			card.innerHTML = null
		})
	},
	pairCards(...cards) {
		cards.map(card => {
			card.classList.add('paired')
		})
	},

	  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  
  renderTriedTimes(times) {
    document.querySelector(".tried").textContent = `You've tried: ${times} times`;
  },

	appendWrongAnimation(...cards){
		cards.map(card => {
			card.classList.add('wrong')
			card.addEventListener('animationend', event => event.target.classList.remove('wrong'), {once: true})
		})
	},
	showGameFinished (){
		const div = document.createElement('div')
		div.classList.add('completed')
		div.innerHTML = `
			<p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
		`
		const header = document.querySelector('#header')
		header.before(div)
	}
}

const model = {
	// 被翻開的卡片
	// revealedCards 是一個暫存牌組，使用者每次翻牌時，就先把卡片丟進這個牌組，集滿兩張牌時就要檢查配對有沒有成功，檢查完以後，這個暫存牌組就需要清空。
	revealedCards: [],
	isRevealedCardsMatched() {
		return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
	},

	score: 0,

	triedTimes: 0

}

// 標記目前的遊戲狀態
const controller = {
	// 初始狀態設定為 FirstCardAwaits，也就是「還沒翻牌」
	currentState: GAME_STATE.FirstCardAwaits,
	generateCards() {
		view.displayCards(utility.getRandomNumberArray(52))
	},
	dispatchCardAction(card) {
		if (!card.classList.contains('back')) {
			return
		}
		switch (this.currentState) {
			case GAME_STATE.FirstCardAwaits:
				view.flipCards(card)
				model.revealedCards.push(card)
				this.currentState = GAME_STATE.SecondCardAwaits
				break
			case GAME_STATE.SecondCardAwaits:
				view.renderTriedTimes(++model.triedTimes)
				view.flipCards(card)
				model.revealedCards.push(card)
				// 判斷配對是否成功
				if (model.isRevealedCardsMatched()) {
					// 配對成功
					view.renderScore(model.score += 10)
					this.currentState = GAME_STATE.CardsMatched
					view.pairCards(...model.revealedCards)
					model.revealedCards = []
					this.currentState = GAME_STATE.FirstCardAwaits
					if(model.score === 260){
						console.log('showGameFinished')
						this.currentState = GAME_STATE.GameFinished
						view.showGameFinished()
						return
					}
				} else {
					// 配對失敗
					this.currentState = GAME_STATE.CardsMatchFailed
					view.appendWrongAnimation(...model.revealedCards)
					setTimeout(this.resetCards, 1000)
				}
				break
		}
		console.log('this.currentState', this.currentState)
		console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
	},

	resetCards() {
		view.flipCards(...model.revealedCards)
		model.revealedCards = []
		controller.currentState = GAME_STATE.FirstCardAwaits
	}
}

// 洗牌演算法
const utility = {
	getRandomNumberArray(count) {
		const number = Array.from(Array(count).keys())
		for (let index = number.length - 1; index > 0; index--) {
			let randomIndex = Math.floor(Math.random() * (index + 1))
				;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
		}
		return number
	}
}

controller.generateCards()

// 翻牌監聽器
document.querySelectorAll('.card').forEach(card => {
	card.addEventListener('click', event => {
		controller.dispatchCardAction(card)
	})
})