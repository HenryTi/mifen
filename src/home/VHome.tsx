/*eslint @typescript-eslint/no-unused-vars: ["off", { "vars": "all" }]*/
import * as React from 'react';
import { observer } from 'mobx-react';
import { VPage, List, LMR, FA, Scroller, DropdownActions, DropdownAction } from 'tonva-react';
import { NStockInfo } from '../stockinfo';
import { CHome } from './CHome';
import { renderSortHeaders, renderStockInfoRow, renderStockUrl } from '../tool';

export class VHome extends VPage<CHome> {
	header() {
		return React.createElement(observer(() => {
			return <span className="ml-3">首页 - {this.controller.stockGroup.name}</span>;
		}));
	}
	right() {
		return React.createElement(observer(() => {
		/*
		return <button className="btn btn-sm btn-info mr-2"
		onClick={()=>{this.controller.openMarketPE()}}>
		市场平均PE
		</button>;
		*/
		let {store} = this.controller;
		let groups = store.stockGroups.groups.map(v => (
			{
				caption: v.name,
				action: () => this.controller.changeGroup(v)
			}
		));
		let actions: DropdownAction[] = [
			{
				caption: '市场平均PE',
				action: this.controller.openMarketPE,
			},
			{
				caption: '选择股票',
				action: this.controller.onAddStock,
			},
			undefined,
			...groups,
			undefined,
			{
				caption: '管理自选组',
				action: this.controller.manageGroups,
			},
		];
		return <DropdownActions actions={actions} icon="bars" className="mr-2 text-white bg-transparent border-0" />;
	}));
	}

	protected onPageScrollBottom(scroller: Scroller): Promise<void> {
		this.controller.onPage();
		return;
	}

	content() {
		return React.createElement(observer(() => {
			let {setSortType, stockGroup, sortType} = this.controller;
			/*
			let {store} = cApp;
			let {config} = store;
			let title = config.groupName;
			let { items } = home;
			*/
			let title = stockGroup.name;
			let items = stockGroup.stocks;

			let {  onSelectTag, onAddStock } = this.controller;
			/*
			let right = <div className="d-flex">
				<div className="btn cursor-pointer" onClick={onAddStock}><FA name="plus" inverse={false} /></div>
				<div className="btn cursor-pointer ml-2" onClick={onSelectTag}><FA name="bars" inverse={false} /></div>
			</div>;
			let left = <div className="align-self-center">{title}</div>
			<LMR className="px-2 py-1" left={left} right={right}></LMR>
			*/
			return <div>
				<div className="d-flex justify-content-end mr-2 my-1">
					{renderSortHeaders('radioHome', sortType, setSortType)}
				</div>
				<List items={items}
					item={{ render: this.renderRow, key: this.rowKey }}
					before={'...'}
					none={<small className="px-3 py-3 text-info">无自选股, 请选股</small>}
				/>
			</div>;
		}));
	}

	renderRow = (item: any, index: number): JSX.Element => { //<this.rowContent {...item} />;
		return this.rowContent(item);
	} 
	protected rowContent = (row: any): JSX.Element => {
		let right = renderStockUrl(row);
		return renderStockInfoRow(row, this.onClickName, null, right);
	}

	private rowKey = (item: any) => {
		let { id } = item;
		return id;
	}

	protected onClickName = (item: NStockInfo) => {
		this.controller.openStockInfo(item);
	}

	protected onSelected = async (item: any): Promise<void> => {
		let a = 0;
	}

	private callOnSelected(item: any) {
		if (this.onSelected === undefined) {
		alert('onSelect is undefined');
		return;
		}
		this.onSelected(item);
	}
	clickRow = (item: any) => {
		this.callOnSelected(item);
	}
}