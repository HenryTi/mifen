import { IObservableArray, makeObservable, observable } from "mobx";
import { PickId, Context } from "tonva-react";
import { MiAccount, MGroup, HoldingStock } from "../../store";
import { Stock, StockValue } from "uq-app/uqs/BruceYuMi";
import { CApp, CUqSub, UQs } from "../../uq-app";
import { VAccount } from "./VAccount";
import { VBuyExist, VBuyNew, VCashAdjust, VCashInit, VCashIn, VCashOut, VSell, VChangeCost } from "./VForm";
import { CHome } from "../CHome";
import { VAccounts } from "./VAccounts";
import { VPickStock } from "./VPickStock";

export class CAccount extends CUqSub<CApp, UQs, CHome> {
	miGroup: MGroup = null;
	stocks: IObservableArray<Stock & StockValue>;
	stock: Stock & StockValue;
	miAccount: MiAccount = null;
	holdingStock: HoldingStock;
	listCaption: string;

	constructor(cHome: CHome) {
		super(cHome);
		makeObservable(this, {
			miGroup: observable,
			miAccount: observable,
			stocks: observable,
			stock: observable,
		});
	}

	async internalStart(param: any) {
	}

	renderAccounts() {
		return this.renderView(VAccounts);
	}

	showAccount = async (item: MiAccount) => {
		this.miAccount = item;
		let renderPageRight = () => {
			let cID = this.cApp.cCommon.buildCIDUserAccount();
			return cID.renderViewRight(item);
		}
		this.openVPage(VAccount, {renderPageRight});
		await item.loadItems();
	};
	
	showHolding = async (item: HoldingStock) => {
		let stock = item.stockObj;
		this.cApp.cCommon.showStock(stock);
	}

	createPickStockId() {
		let ret:PickId = async (context:Context, name: string, value: number) => {
			this.stocks = this.cApp.store.stocksMyAll;
			let v = await this.pickStock();
			if (!v) return;
			let stock = await this.cApp.store.loadStock(v.id);
			this.stock = stock;
			if (stock) {
				context.setValue('price', String(stock.price));
			}
			return stock;
		}
		return ret;
	}

	private async pickStock() {
		return this.vCall(VPickStock);
	}

	onSearchStock = async (key: string) => {
		let ret = await this.cApp.store.searchStock({key}, undefined, 50);
		let {$page} = ret;
		this.stocks = observable($page);
	}

	showBuy = async (item?: HoldingStock) => {
		if (item) {
			this.holdingStock = item;
			this.openVPage(VBuyExist);
		}
		else {
			this.holdingStock = undefined;
			this.openVPage(VBuyNew);
		}
	}

	submitBuyNew = async (stockId: number, price:number, quantity:number) => {
		await this.miAccount.buyNewHolding(stockId, price, quantity);
	}

	submitBuy = async (price:number, quantity:number) => {
		await this.miAccount.buyHolding(this.holdingStock.stock, price, quantity);
	}

	showSell = async (item: HoldingStock) => {
		this.holdingStock = item;
		this.openVPage(VSell);
	}

	submitSell = async (price:number, quantity:number) => {
		await this.miAccount.sellHolding(this.holdingStock.stock, price, quantity);
	}
	
	showChangeCost = async (item: HoldingStock) => {
		this.holdingStock = item;
		this.openVPage(VChangeCost);
	}
	
	submitChangeCost = async (costPrice:number) => {
		await this.miAccount.changeCost(this.holdingStock.stock, costPrice);
	}

	showCashInit = async () => {
		this.openVPage(VCashInit);
	}

	submitCashInit = async (value:number) => {
		await this.miAccount.cashInit(value);
	}

	showCashIn = async () => {
		this.openVPage(VCashIn);
	}

	submitCashIn = async (value:number) => {
		await this.miAccount.cashIn(value);
	}
	
	showCashOut = async () => {
		this.openVPage(VCashOut);
	}

	submitCashOut = async (value:number) => {		
		await this.miAccount.cashOut(value);
	}
	
	showCashAdjust = async () => {
		this.openVPage(VCashAdjust);
	}

	submitCashAdjust = async (value:number) => {
		await this.miAccount.cashAdjust(value);
	}

	showTransactionDetail = async (item: HoldingStock) => {
		alert('detail');
	}
}
