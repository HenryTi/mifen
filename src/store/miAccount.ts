import { action, IObservableArray, makeObservable, observable, runInAction } from "mobx";
import { Account, AccountValue, Holding, Portfolio } from "uq-app/uqs/BruceYuMi";
import { HoldingStock } from "./holdingStock";
import { Store } from "./store";

export class MiAccount  implements Account, AccountValue {
	protected store: Store;
	id: number;
	no: string;
	name: string;
	count: number = 0; 
	miValue: number = 0;
	market: number = 0;
	divident: number = 0;
	cash: number = null;

	holdingStocks: IObservableArray<HoldingStock> = null;

	constructor(store: Store, account: Account&AccountValue) {
		makeObservable(this, {
			holdingStocks: observable,
			count: observable,
			miValue: observable,
			market: observable,
			divident: observable,
			cash: observable,
			loadItems: action,
			buyNewHolding: action,
			buyHolding: action,
			sellHolding: action,
		})
		this.store = store;
		Object.assign(this, account);
		this.cash = undefined;
	}

	async loadItems() {
		let sorter = (a:HoldingStock, b:HoldingStock) => {
			let {stockObj:ao} = a;
			let {stockObj:bo} = b;
			let aMiRate = ao.miRate;
			let bMiRate = bo.miRate;
			if (aMiRate < bMiRate) return 1;
			if (aMiRate > bMiRate) return -1;
			return 0;
		}
		if (this.holdingStocks) {
			this.holdingStocks.sort(sorter);
			return;
		}
		let {yumi} = this.store;
		let ret = await yumi.IX<Holding&Portfolio>({
			IX: yumi.AccountHolding,
			ix: this.id,
			IDX: [yumi.Holding, yumi.Portfolio]
		});
		let noneStocks = ret.filter(v => !this.store.stockFromId(v.stock));
		if (noneStocks.length > 0) {
			await yumi.ActIX({
				IX: yumi.UserAllStock,
				values: noneStocks.map(v => ({ix:undefined, id: v.stock}))
			});
			await this.store.loadMyAll();
		}
		runInAction(() => {
			let list = ret.map(v => {
				let {id, stock:stockId, cost} = v;
				let stock = this.store.stockFromId(stockId);
				let holdingStock = new HoldingStock(id, stock, v.quantity, cost);
				return holdingStock;
			});
			list.sort(sorter);
			this.holdingStocks = observable(list);
			this.count = this.holdingStocks.length;	
		});
	}

	async buyNewHolding(stockId: number, price: number, quantity: number) {
		let holdingId: number;
		let stock = this.store.stockFromId(stockId);
		if (!stock) {
			stock = await this.store.loadStock(stockId);
			if (!stock) throw new Error(`stock ${stockId} not exists`);
		}
		let index = this.holdingStocks.findIndex(v => v.stock === stockId);
		if (index < 0) {
			holdingId = await this.saveHolding(stockId);
			await this.store.addMyAll(stock);
			let hs = new HoldingStock(holdingId, stock, quantity, price*quantity);
			hs.setQuantity(quantity);
			hs.setCost(price, quantity);
			this.holdingStocks.push(hs);
		}
		else {
			let orgHs = this.holdingStocks[index];
			holdingId = orgHs.id;
			let holdingQuantity = orgHs.quantity + quantity;
			orgHs.setQuantity(holdingQuantity);
			orgHs.setCost(price, quantity);
		}
		await this.bookHolding(holdingId, price, quantity);
	}

	async buyHolding(stockId: number, price: number, quantity: number) {
		let index = this.holdingStocks.findIndex(v => v.stock === stockId);
		if (index < 0) return;
		let orgHs = this.holdingStocks[index];
		let holdingId = orgHs.id;
		let holdingQuantity = orgHs.quantity + quantity;
		orgHs.setQuantity(holdingQuantity);
		orgHs.setCost(price, quantity);
		await this.bookHolding(holdingId, price, quantity);
	}

	private async saveHolding(stock:number): Promise<number> {
		let ret = await this.store.yumi.Acts({
			holding: [{account: this.id, stock}]
		});
		return ret.holding[0];
	}

	private async bookHolding(holdingId:number, price:number, quantity:number): Promise<void> {
		this.recalc();
		await this.store.yumi.Acts({
			accountValue: [{
				id: this.id,
				miValue: this.miValue,
				market: this.market,
				count: this.count,
			}],
			accountHolding: [{
				ix: this.id,
				id: holdingId
			}],
			portfolio: [{
				id: holdingId,
				quantity: quantity,
				cost: price * quantity,
			}],
			transaction: [{
				holding: holdingId,
				tick: undefined,
				price, 
				quantity,
				amount: price * quantity,
			}],
		});
	}

	async sellHolding(stockId: number, price: number, quantity: number) {
		let holding = this.holdingStocks.find(v => v.stock === stockId);
		if (holding === undefined) return;
		holding.setQuantity(holding.quantity - quantity);
		holding.setCost(-price, quantity);
		await this.bookHolding(holding.id, price, -quantity);
	}

	private recalc() {
		this.count = this.holdingStocks.length;
		let sumMiValue = 0, sumMarket = 0, sumDivident = 0;
		for (let hs of this.holdingStocks) {
			let {stockObj, market, divident} = hs;
			let {miRate} = stockObj;
			let miValue = miRate * market / 100;
			hs.miValue = miValue;
			sumMiValue += miValue;
			sumMarket += market;
			sumDivident += divident;
		}
		this.miValue = sumMiValue;
		this.market = sumMarket;
		this.divident = sumDivident;
	}

	private async cashAct(amount: number, act: string):Promise<void> {
		await this.store.yumi.Acts({
			accountValue: [{id: this.id, cash: amount}]
		});
	}

	async cashInit(amount: number) {
		await this.cashAct(amount, 'init');
		runInAction(() => {
			if (typeof this.cash !== 'number') this.cash = amount;
		});
	}

	async cashIn(amount: number) {
		await this.cashAct(amount, 'in');
		runInAction(() => {
			if (!this.cash) this.cash = amount;
			else this.cash += amount;
		});
	}

	async cashOut(amount: number) {
		await this.cashAct(-amount, 'out');
		runInAction(() => {
			this.cash -= amount;
		});
	}

	async cashAdjust(amount: number) {
		await this.cashAct(amount, 'adjust');
		runInAction(() => {
			if (!this.cash) this.cash = amount;
			else this.cash += amount;
		});
	}
}