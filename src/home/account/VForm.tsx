import { observer } from "mobx-react";
import React from "react";
import { IntSchema, ButtonSchema, UiNumberItem, UiButton, Form, Schema, VPage, UiSchema, Context, NumSchema, IdSchema, UiIdItem, ItemSchema, FA } from "tonva-react";
import { formatNumber } from "tool";
import { Stock } from "uq-app/uqs/BruceYuMi";
import { CAccount } from "./CAccount";

abstract class VForm extends VPage<CAccount> {
	protected form: Form;
	protected get back(): 'close' | 'back' | 'none' {return 'close'}
	protected onCheckValue(value:any): string[] | string {
		return;
    }

	protected get valueLabel(): string {return '股票数量'}
	protected get placeholder(): string {return '股票数量'}
	protected get valueSchema(): ItemSchema {
		return { name: 'value', type: 'integer', min: 0, required: true } as IntSchema;
	}

	protected schema: Schema = [
		this.valueSchema,
		{ name: 'submit', type: 'submit'} as ButtonSchema,
	];

	protected uiSchema: UiSchema = {
		items: {
			value: {
				widget: 'number',
				min: 0,
				step: 1,
				label: this.valueLabel,
				placeholder: this.placeholder,
				rules: (value:any) => this.onCheckValue(value),
			} as UiNumberItem,
			submit: {
				widget: 'button', className: 'btn btn-primary w-25', label: '提交', disabled: false,
			} as UiButton,
		}
	}

	protected renderStock(): JSX.Element {
		let {holdingStock} = this.controller;
		if (!holdingStock) return null;
		let {stockObj, quantity, miValue, market} = holdingStock;
		let {name, no} = stockObj;
		return <div className="py-2">
			<div className="mr-auto px-3 mb-2">
				<b>{name}</b> <span className="ml-2 small text-muted">{no}</span>
			</div>
			<div className="d-flex my-2 py-2 border-top border-bottom justify-content-center text-center bg-white">
				{this.renderQuantity('股数', quantity)}
				{this.renderValue('米息', miValue, 2)}
				{this.renderValue('市值', market, 2)}
			</div>
		</div>;
	}

	private renderValue(caption:string, value: number, dec: number = 0) {
		return <div className="mx-1 border rounded w-min-5c px-1 py-2">
			<small className="text-muted">{caption}</small>
			<div>{formatNumber(value??0)}</div>
		</div>;
	}

	protected renderQuantity(caption:string, value: number, dec: number = 0) {
		return this.renderValue(caption, value, dec);
	}

	protected beforeRender() {}

	protected renderForm(): JSX.Element {
		this.beforeRender();
		return <Form ref={f => this.form = f} className="mx-3"
			onButtonClick={this.onFormSubmit}
			onEnter={this.onFormSubmit}
			fieldLabelSize={3}
			fieldLabelAlign='right'
			schema={this.schema}
			uiSchema={this.uiSchema} />;
	}

	private onFormSubmit = async (name:string, context: Context):Promise<void> => {
		context.setDisabled(name, true);
		await this.onSubmit(context.data);
		context.setDisabled(name, false);
		this.closePage();
	}

	protected renderFormTop():JSX.Element {
		return null;
	}

	protected abstract onSubmit(data:any): Promise<void>;

	content() {
		return <div className="my-3">
			{this.renderStock()}
			{this.renderFormTop()}
			{this.renderForm()}
		</div>;
	}
}

abstract class VStock extends VForm {
	protected beforeRender() {
		super.beforeRender();
		this.schema.unshift(
			{ name: 'price', type: 'number', min: 0, required: true } as NumSchema,
		);
		this.uiSchema.items['price'] = {
			widget: 'number',
			min: 0,
			step: 1,
			label: '价格',
			placeholder: '股票价格',
			defaultValue: this.controller.holdingStock?.stockObj.price
			//rules: (value:any) => this.onCheckValue(value),
		} as UiNumberItem;
	}
}

abstract class VBuy extends VStock {
	protected beforeRender() {
		super.beforeRender();
		this.uiSchema.rules = [this.checkCash];
	}
	protected checkCash = (context:Context): string[] | string => {
		let {holdingStock, miAccount} = this.controller;
		let {cash} = miAccount;
		if (typeof cash !== 'number') return;
		let stock = holdingStock?.stockObj || this.controller.stock;
		let quantity = context.data.value;
		let {price} = stock;
		if ((quantity as number) * (price as number) > (cash as number))
			return `超过账户资金余额，无法买入`;
    }

	protected renderFormTop():JSX.Element {
		return React.createElement(observer(() => {
			let {miAccount, holdingStock, stock} = this.controller;
			let {portionAmount, cash} = miAccount;
			if (typeof cash !== 'number') return null;
			if (!portionAmount) return null;
			let vComment: any;
			if (!stock && !holdingStock) {
				vComment = <>
					<FA name="bell-o mr-1 text-warning" />
					建议不超过每份金额{portionAmount}
				</>;
			}
			else {
				if (!stock) {
					stock = holdingStock.stockObj;
				}
				let {price} = stock;
				let quantity: number;
				if (holdingStock) {
					quantity = portionAmount / price -  holdingStock.quantity;
					if (quantity < 0) quantity = 0;
				}
				else {
					quantity = portionAmount / price;
				}
				vComment = quantity === 0?
				<>
					<FA name="times-circle-o mr-1 text-danger" />
					每份金额{portionAmount}，已超单只股票份额，建议不要购买
				</>
				:
				<>
					<FA name="check-circle-o mr-1 text-warning" />
					每份金额{portionAmount}，建议不超过：{Math.round(quantity)} 股
				</>
			}
			
			return <div className="pb-3 px-3 text-center small text-muted">
				{vComment}
			</div>;
		}));		
	}
}

export class VBuyNew extends VBuy {
	header() {return '新买股票'}
	protected beforeRender() {
		super.beforeRender();
		this.schema.unshift(
			{ name: 'stock', type: 'id', required: true } as IdSchema,
		);
		this.uiSchema.items['stock'] = {
			widget: 'id',
			label: '股票',
			pickId: this.controller.createPickStockId(),
			placeholder: '请选择股票',
			Templet: this.renderStockPick,
		} as UiIdItem;
	}

	private renderStockPick = (values: Stock):JSX.Element => {
		let {name, no} = values;
		return <>{name} <small className="text-muted">{no}</small></>;
	}

	protected async onSubmit(data:any): Promise<void> {
		let {stock, price, value} = data;
		await this.controller.submitBuyNew(stock.id, price, value);
	}
}

export class VBuyExist extends VBuy {
	header() {return '加买股票'}
	protected get placeholder(): string {return '加买数量'}

	protected async onSubmit(data:any): Promise<void> {
		let {price, value} = data;
		await this.controller.submitBuy(price, value);
	}
}

export class VSell extends VStock {
	header() {return '卖出股票'}
	protected get placeholder(): string {return '卖出数量'}
	protected onCheckValue(value:any): string[] | string {
		let {holdingStock} = this.controller;
		let {quantity} = holdingStock;
		if (value > quantity)
			return `现有持股${quantity}，卖出数量超出`;
    }

	protected async onSubmit(data:any): Promise<void> {
		let {price, value} = data;
		await this.controller.submitSell(price, value);
	}

	protected renderQuantity(caption:string, value: number, dec: number = 0) {
		return <div className="mx-1 border border-info rounded w-min-5c px-1 py-2 cursor-pointer"
			onClick={this.onClickQuantity}>
			<small className="text-muted">{caption}</small>
			<div>{formatNumber(value??0)}</div>
		</div>;
	}

	private onClickQuantity = () => {
		this.form.formContext.setValue('value', this.controller.holdingStock.quantity);
	}
}

export class VChangeCost extends VForm {
	header() {return '修改成本'}
	protected get valueLabel(): string {return '新成本'}
	protected get placeholder(): string {return '新股票成本'}
	protected get valueSchema(): ItemSchema {
		return { name: 'value', type: 'number', min: 0.01, required: true } as NumSchema;
	}
	protected beforeRender() {
		let {holdingStock} = this.controller;
		if (!holdingStock) return;
		let {cost, quantity} = holdingStock;
		let {value} = this.uiSchema.items;
		let uiValue = value as UiNumberItem;
		uiValue.min = 0.01;
		uiValue.step = 0.01;
		let oldPrice = cost/quantity;
		uiValue.defaultValue = oldPrice.toFixed(2);
	}
	protected async onSubmit(data:any): Promise<void> {
		let {value} = data;
		await this.controller.submitChangeCost(value);
	}
}

abstract class VCash extends VForm {
	protected get valueLabel(): string {return '资金数量'}
	protected renderStock(): JSX.Element {return null}
}

export class VCashInit extends VCash {
	header() {return '期初资金'}
	protected get placeholder(): string {return '期初金额'}
	protected async onSubmit(data:any): Promise<void> {
		let {value} = data;
		await this.controller.submitCashInit(value);
	}
}

export class VCashIn extends VCash {
	header() {return '调入资金'}
	protected get placeholder(): string {return '调入金额'}
	protected async onSubmit(data:any): Promise<void> {
		let {value} = data;
		await this.controller.submitCashIn(value);
	}
}

export class VCashOut extends VCash {
	header() {return '调出资金'}
	protected get placeholder(): string {return '调出金额'}
	protected onCheckValue(value:any): string[] | string {
		let {cash} = this.controller.miAccount; 
		if (value > cash)
			return `调出金额不能超过总现金${cash}`;
    }
	protected async onSubmit(data:any): Promise<void> {
		let {value} = data;
		await this.controller.submitCashOut(value);
	}
}

export class VCashAdjust extends VCash {
	header() {return '调整资金'}
	protected beforeRender() {
		(this.schema[0] as IntSchema).min = undefined;
	}
	protected get placeholder(): string {return '调整金额'}
	protected onCheckValue(value:any): string[] | string {
		let {cash} = this.controller.miAccount; 
		if (value < 0 && -value > cash)
			return `负向调整金额不能超过总现金${cash}`;
    }
	protected async onSubmit(data:any): Promise<void> {
		let {value} = data;
		await this.controller.submitCashAdjust(value);
	}
}
