/*eslint @typescript-eslint/no-unused-vars: ["off", { "vars": "all" }]*/
import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { VPage, Page, List, LMR, SearchBox } from 'tonva-react';
import { CStock } from './CStock'

export class VStockSelect extends VPage<CStock> {
  async open(item: any) {
      this.openPage(this.page, item);
  }

  private renderStock(stock: any, index: number) {
      let { name, code } = stock;
      return <LMR className="px-3 py-2 " >
          <div className="font-weight-bold"></div>
          <div>{name + ' ' + code}</div>
      </LMR >
  }

  private onClickStock = async (model: any) => {
      await this.controller.returnStock(model);
      this.closePage();
  }

  private page = observer((customer: any) => {
      let { pageItems, onPage } = this.controller;
      let none = <div className="my-3 mx-2 text-warning">请搜索股票！</div>;
      return <Page header="选择股票" headerClassName='bg-primary' onScrollBottom={onPage}>
          <SearchBox className="px-1 w-100  mt-2 mr-2"
              size='md'
              allowEmptySearch={true}
              onSearch={(key: string) => this.controller.searchByKey(key)}
              placeholder="搜索股票" />
          <List before={''} none={none} items={pageItems} item={{ render: this.renderStock, onClick: this.onClickStock }} />
      </Page>
  })
}