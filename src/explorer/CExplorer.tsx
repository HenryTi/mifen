import * as React from 'react';
import { PageItems } from 'tonva';
import { CUqBase } from '../CUqBase';
import { CMiApp } from '../CMiApp';
import { CStockInfo, NStockInfo } from '../stockinfo';
import { VSiteHeader } from './VSiteHeader';
import { VExplorer } from './VExplorer';

class HomePageItems<T> extends PageItems<T> {
    ce: CExplorer;
    constructor(cHome: CExplorer) {
        super(true);
        this.ce = cHome;
        this.pageSize = 30;
        this.firstSize = 30;
    }
    protected async load(param: any, pageStart: any, pageSize: number): Promise<any[]> {
        let query = {
            name:'pe',
            pageStart:pageStart,
            pageSize:pageSize,
            user:this.ce.user.id,
            //blackID:this.ce.cApp.blackListTagID,
            yearlen: 1,
        };
        let result = await this.ce.cApp.miApi.process(query, []);
        if (Array.isArray(result) === false) return [];
        return result as any[];
    }
    protected setPageStart(item: any) {
        this.pageStart = item === undefined ? 0 : item.order;
    }
}

export class CExplorer extends CUqBase {
    PageItems: PageItems<any> = new HomePageItems<any>(this);
    get cApp(): CMiApp { return this._cApp as CMiApp };

    onPage = () => {
        this.PageItems.more();
    }

    async searchMain(key: string) {
        if (key !== undefined) await this.PageItems.first(key);
    }

    async internalStart(param: any) {
    }

    async load() {
      this.searchMain('');
    }

    renderSiteHeader = () => {
        return this.renderView(VSiteHeader);
    }
   
    renderHome = () => {
        return this.renderView(VExplorer);
    }
    

    openMetaView = () => {
    }

    tab = () => <this.renderHome />;

    openStockInfo = (item:NStockInfo) => {
        let cStockInfo = this.newC(CStockInfo);
        cStockInfo.start(item);
    }
}