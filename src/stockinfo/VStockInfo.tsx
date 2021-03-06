/*eslint @typescript-eslint/no-unused-vars: ["off", { "vars": "all" }]*/
import * as React from 'react';
import { VPage, Page, List } from 'tonva-react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import RC2 from 'react-chartjs-2'
import { GFunc } from './GFunc';
import { CStockInfo } from './CStockInfo'
import { StockCapitalearning, StockBonus } from './StockInfoType';
import { renderStockRow } from 'tool';
import { ErForEarning } from './ErForEarning';
import { SlrForEarning } from './SlrForEarning';

export class VStockInfo extends VPage<CStockInfo> {
    private input: HTMLInputElement;
    private key: string = undefined;

    async open(param?: any) {
        this.openPage(this.page);
    }

    @observable protected ttmLimit: boolean = false;

    render(param: any): JSX.Element {
        return this.page();
    }

    checkLimitShow = (e: any) => {
        let check = e.target.checked as boolean;
        this.ttmLimit = check;
    }

    checkShowLater = (e: any) => {
        let check = e.target.checked as boolean;
    }

    private page = observer(() => {
        let { openMetaView, baseItem, isLogined } = this.controller;
        let { name, code, day } = baseItem;
        let viewMetaButton = <></>;
        if (isLogined) {
            viewMetaButton = <button type="button" className="btn w-100" onClick={openMetaView}>view</button>
        }

        let headStr = name + ' ' + code;
        if (day !== undefined) {
            headStr += ' - ' + day;
        }
        let head = <div >{headStr}</div>
        return <Page header={head}
            headerClassName='bg-primary'>
            {React.createElement(this.pageContent)}
        </Page>;
    })

    private pageContent = observer(() => {
        return <>
            {React.createElement(this.baseInfo)}
            {this.historyChart()}
            {React.createElement(this.predictInfo)}
            {React.createElement(this.predictSeasonEarning)}
            {React.createElement(this.seasonEarning)}
            {React.createElement(this.capitalEarning)}
            {React.createElement(this.bonus)}
        </>
    });

    private onChange = (evt: React.ChangeEvent<any>) => {
        let v = evt.target.value;
        let n = Number(v);
        if (isNaN(n) === true || !Number.isInteger(n)) {
            if (this.input) {
                this.input.value = this.key;
            }
            return;
        }
        this.key = evt.target.value;
        if (this.key !== undefined) {
            this.key = this.key.trim();
            if (this.key === '') this.key = undefined;
        }
    }

    private baseInfo = observer(() => {
        let { stock, baseItem } = this.controller;
        let { cCommon } = this.controller.cApp;
        let pinStock = <div className="d-flex align-self-stretch align-items-center">
            {cCommon.renderStockLink(stock)}
			&nbsp;
			{cCommon.renderPinStock(stock, 2)}
			&nbsp;
			{cCommon.renderBlockStock(stock)}
        </div>;
        return <div className="bg-white">{renderStockRow(undefined, stock, undefined, pinStock)}</div>;
    });

    private historyChart = () => {
        let { baseItem } = this.controller;
        let { market, code, symbol } = baseItem;
        if (market === 'sh' || market === 'sz') {
            let urlweek = `https://image.sinajs.cn/newchart/weekly/n/${symbol}.gif`;
            let urlmonth = `https://image.sinajs.cn/newchart/monthly/n/${symbol}.gif`
            return <div className="row">
                <div className="col-md"><img className="w-100" alt="" src={urlweek} /></div>
                <div className="col-md"><img className="w-100" alt="" src={urlmonth} /></div>
            </div>;
        }
    }

    // protected historyChart = observer(() => {
    // 	let {historyData, baseItem} = this.controller;
    // 	if (historyData === undefined) 
    // 	return <></>;
    // 	let chartHistory = <></>;
    // 	let labelList:any[] = [];
    // 	let priceList:number[] = [];
    // 	let ttmList:number[] = [];
    // 	for (let item of historyData) {
    // 	let {day, price, ttm} = item;
    // 	labelList.push(day);
    // 	priceList.push(GFunc.numberToPrecision(price, 4));
    // 	if (ttm <= 0) 
    // 		ttmList.push(undefined);
    // 	else {
    // 		if (this.ttmLimit && ttm >= 35) {
    // 		ttmList.push(35);
    // 		}
    // 		else {
    // 		ttmList.push(GFunc.numberToPrecision(ttm, 4));
    // 		}
    // 	}
    // 	}
    // 	let chartdata1 = {
    // 	labels: labelList,
    // 	datasets: [
    // 		{
    // 		label: '价格',
    // 		data: priceList,
    // 		borderColor:'blue',
    // 		backgroundColor:'skyBlue',
    // 		borderWidth: 1,
    // 		fill: false,
    // 		yAxisID: 'y-axis-1',
    // 		},
    // 		{
    // 		label: 'TTM',
    // 		data: ttmList,
    // 		borderColor:'red',
    // 		backgroundColor:'pink',
    // 		borderWidth: 1,
    // 		fill: false,
    // 		yAxisID: 'y-axis-2',
    // 		}
    // 	]
    // 	};
    // 	let options = {
    // 	scales:{
    // 		yAxes: [{
    // 			type: 'linear',
    // 			display: true,
    // 			position: 'left',
    // 			id: 'y-axis-1',
    // 		}, {
    // 			type: 'linear',
    // 			display: true,
    // 			position: 'right',
    // 			id: 'y-axis-2',
    // 			gridLines: {
    // 				drawOnChartArea: false
    // 			}
    // 		}],       
    // 	}
    // 	}
    // 	chartHistory = <RC2 data={chartdata1} type='line' options={options} />;
    // 	let right = <></>;
    // 	if (baseItem.day !== undefined) {
    // 	right = <><label className="px-3"> <input type="checkbox" name="showLater" defaultChecked={false}
    // 			onChange={this.checkShowLater} />显示后面数据</label>
    // 		<label className="px-3"> <input type="checkbox" name="selectType" defaultChecked={this.ttmLimit}
    // 		onChange={this.checkLimitShow} />限制TTM显示范围</label>
    // 		</>;

    // 	}
    // 	else {
    // 	right = <label className="px-3"> <input type="checkbox" name="selectType" defaultChecked={this.ttmLimit}
    // 		onChange={this.checkLimitShow} />限制TTM显示范围</label>;
    // 	}
    // 	return <><LMR className="px-3 py-2 bg-white" left={'历史走势'} right={right}></LMR>
    // 	<div className="px-3" style={{width:'95%'}}>{chartHistory}</div>
    // 	</>;
    // });

    protected predictInfo = observer(() => {
        let { predictData, ypredict } = this.controller;
        if (predictData === undefined)
            return <></>;
        let { e, b, r2, epre, l, lr2, lpre } = predictData;
        let chart1 = <></>;
        if (ypredict.length === 5) {
            let er = new ErForEarning(ypredict);
            let chartdata1 = {
                labels: ['0', '1', '2', '3', '4'],
                datasets: [
                    {
                        label: '收益原值',
                        data: ypredict.map(v => GFunc.numberToPrecision(v)),
                        borderColor: 'black',
                        backgroundColor: 'skyBlue',
                        showLine: false,
                        pointStyle: "crossRot",
                        borderWidth: 1,
                        pointRadius: 5,
                        fill: false,
                    } as any
                ]
            };
            if (!(isNaN(er.B) || isNaN(er.A))) {
                let per: number[] = [];
                for (let i = 0; i < 5; ++i) {
                    per.push(GFunc.numberToPrecision(er.predict(i), 4));
                }
                chartdata1.datasets.push(
                    {
                        label: '指数回归',
                        data: per,
                        borderColor: 'red',
                        backgroundColor: 'pink',
                        borderWidth: 1,
                        fill: false,
                    });
            }
            let lr = new SlrForEarning(ypredict);
            if (!(isNaN(lr.slope) || isNaN(lr.intercept))) {
                let plr: number[] = [];
                for (let i = 0; i < 5; ++i) {
                    plr.push(GFunc.numberToPrecision(lr.predict(i), 4));
                }
                chartdata1.datasets.push(
                    {
                        label: '线性回归',
                        data: plr,
                        borderColor: 'blue',
                        backgroundColor: 'pink',
                        borderWidth: 1,
                        fill: false,
                    });
            }
            chart1 = <RC2 data={chartdata1} type='line' />;
        }
        let chart2 = this.predictChartBonus();
        let chart3 = this.predictChartFullInfo();
        let chart4 = this.predictChartROE();
        return <><div className="px-3 py-2 bg-white">指数回归预测</div>
            <div className="d-flex flex-wrap">
                <div className="px-3 c12">{GFunc.caption('e')}{GFunc.numberToString(e, 4)}</div>
                <div className="px-3 c12">{GFunc.caption('指数b')}{GFunc.numberToString(b, 4)}</div>
                <div className="px-3 c12">{GFunc.caption('r2')}{GFunc.numberToString(r2, 4)}</div>
                <div className="px-3 c12">{GFunc.caption('e预测')}{GFunc.numberToString(epre)}</div>
            </div>
            <div className="px-3 py-2 bg-white">线性回归预测</div>
            <div className="d-flex flex-wrap">
                <div className="px-3 c12">{GFunc.caption('e')}{GFunc.numberToString(e, 4)}</div>
                <div className="px-3 c12">{GFunc.caption('增长率')}{GFunc.numberToString(l, 4)}</div>
                <div className="px-3 c12">{GFunc.caption('r2')}{GFunc.numberToString(lr2, 4)}</div>
                <div className="px-3 c12">{GFunc.caption('e预测')}{GFunc.numberToString(lpre)}</div>
            </div>
            <div className="row">
                <div className="col">{chart1}</div>
                <div className="col">{chart2}</div>
            </div>
            <div className="row">
                <div className="col">{chart3}</div>
                <div className="col">{chart4}</div>
            </div>
        </>;
    });

    protected predictChartFullInfo = () => {
        let { predictSeasonDataFull } = this.controller;
        let len = predictSeasonDataFull.length;
        if (len <= 0)
            return <></>;
        let label = [];
        let y: number[] = [];
        for (let i = len - 1; i >= 0; --i) {
            let item = predictSeasonDataFull[i];
            if (item.esum === undefined)
                continue;
            label.push(GFunc.SeasonnoToYearMonth(item.season));
            y.push(item.esum);
        }

        let er = new ErForEarning(y);
        let chartdataFull = {
            labels: label,
            datasets: [
                {
                    label: '收益原值',
                    data: y.map(v => GFunc.numberToPrecision(v)),
                    borderColor: 'black',
                    backgroundColor: 'skyBlue',
                    showLine: false,
                    pointStyle: "crossRot",
                    borderWidth: 1,
                    pointRadius: 5,
                    fill: false,
                } as any
            ]
        };
        if (!(isNaN(er.B) || isNaN(er.A))) {
            let per: number[] = [];
            for (let i = 0; i < len; ++i) {
                per.push(GFunc.numberToPrecision(er.predict(i), 4));
            }
            chartdataFull.datasets.push(
                {
                    label: '指数 R2:' + GFunc.numberToString(er.r2, 4),
                    data: per,
                    borderColor: 'red',
                    backgroundColor: 'pink',
                    borderWidth: 1,
                    fill: false,
                });
        }
        let lr = new SlrForEarning(y);
        if (!(isNaN(lr.slope) || isNaN(lr.intercept))) {
            let plr: number[] = [];
            for (let i = 0; i < len; ++i) {
                plr.push(GFunc.numberToPrecision(lr.predict(i), 4));
            }
            chartdataFull.datasets.push(
                {
                    label: '线性 R2:' + GFunc.numberToString(lr.r2, 4),
                    data: plr,
                    borderColor: 'blue',
                    backgroundColor: 'pink',
                    borderWidth: 1,
                    fill: false,
                });
        }
        return <RC2 data={chartdataFull} type='line' />;
    };

    protected predictChartROE = () => {
        let { predictSeasonDataFull } = this.controller;
        let len = predictSeasonDataFull.length;
        if (len <= 0)
            return <></>;
        let label = [];
        let y: number[] = [];
        for (let i = len - 1; i >= 0; --i) {
            let item = predictSeasonDataFull[i];
            if (item.esum === undefined)
                continue;
            label.push(GFunc.SeasonnoToYearMonth(item.season));
            y.push(item.esumorg / item.corg);
        }

        let chartdataFull = {
            labels: label,
            datasets: [
                {
                    label: 'ROE原值',
                    data: y.map(v => GFunc.numberToPrecision(v)),
                    borderColor: 'black',
                    backgroundColor: 'skyBlue',
                    showLine: false,
                    pointStyle: "crossRot",
                    borderWidth: 1,
                    pointRadius: 5,
                    fill: false,
                } as any
            ]
        };
        let lr = new SlrForEarning(y);
        if (!(isNaN(lr.slope) || isNaN(lr.intercept))) {
            let plr: number[] = [];
            for (let i = 0; i < len; ++i) {
                plr.push(Number.parseFloat(lr.predict(i).toPrecision(4)));
            }
            chartdataFull.datasets.push(
                {
                    label: '线性 R2:' + GFunc.numberToString(lr.r2, 4),
                    data: plr,
                    borderColor: 'blue',
                    backgroundColor: 'pink',
                    borderWidth: 1,
                    fill: false,
                });
        }
        return <RC2 data={chartdataFull} type='line' />;
    };

    protected predictChartBonus = () => {
        let { predictBonusData } = this.controller;
        let len = predictBonusData.length;
        if (len <= 0)
            return <></>;
        let label = [];
        let y: number[] = [];
        for (let i = 0; i < len; ++i) {
            let item = predictBonusData[i];
            if (item.bonus === undefined)
                continue;
            label.push(item.year);
            y.push(item.bonus);
        }

        let chartdataFull = {
            labels: label,
            datasets: [
                {
                    label: '分红原值',
                    data: y.map(v => GFunc.numberToPrecision(v)),
                    borderColor: 'black',
                    backgroundColor: 'skyBlue',
                    showLine: false,
                    pointStyle: "crossRot",
                    borderWidth: 1,
                    pointRadius: 5,
                    fill: false,
                } as any
            ]
        };
        if (y.length >= 3) {
            let lr = new SlrForEarning(y);
            if (!(isNaN(lr.slope) || isNaN(lr.intercept))) {
                let plr: number[] = [];
                for (let i = 0; i < len; ++i) {
                    plr.push(Number.parseFloat(lr.predict(i).toPrecision(4)));
                }
                chartdataFull.datasets.push(
                    {
                        label: '线性 R2:' + GFunc.numberToString(lr.r2, 4),
                        data: plr,
                        borderColor: 'blue',
                        backgroundColor: 'pink',
                        borderWidth: 1,
                        fill: false,
                    });
            }
        }
        return <RC2 data={chartdataFull} type='line' />;
    };

    private predictSeasonEarning = observer(() => {
        let items = this.controller.predictSeasonData;
        let header = <div className="px-3">
            <div className="px-3 c6">年月</div>
            <div className="px-3 c6 text-right">股本</div>
            <div className="px-3 c6 text-right">季收益</div>
            <div className="px-3 c6 text-right">年收益</div>
            <div className="px-3 c6 text-right">ROE</div>
            <div className="px-3 c6 text-right">股本o</div>
            <div className="px-3 c6 text-right">季收益o</div>
            <div className="px-3 c6 text-right">年收益o</div>
        </div>;
        return <>
            <div className="px-3 py-1">历年股本收益-用于回归计算</div>
            <List header={header} loading="..."
                items={items}
                item={{
                    render: (row: { season: number, c: number, e: number, esum: number, corg: number, eorg: number, esumorg: number }) => {
                        let { season, c, e, esum, corg, eorg, esumorg } = row;
                        let ym = GFunc.SeasonnoToYearMonth(season);
                        let a = 0;
                        return <div className="px-3 py-2 d-flex flex-wrap">
                            <div className="px-3 c6">{ym.toString()}</div>
                            <div className="px-3 c6 text-right">{GFunc.numberToFixString(c)}</div>
                            <div className="px-3 c6 text-right">{GFunc.numberToFixString(e)}</div>
                            <div className="px-3 c6 text-right">{GFunc.numberToFixString(esum)}</div>
                            <div className="px-3 c6 text-right">{GFunc.percentToFixString(esum / c)}</div>
                            <div className="px-3 c6 text-right">{GFunc.numberToFixString(corg)}</div>
                            <div className="px-3 c6 text-right">{GFunc.numberToFixString(eorg)}</div>
                            <div className="px-3 c6 text-right">{GFunc.numberToFixString(esumorg)}</div>
                        </div>
                    }
                }}
            />
        </>
    });


    private seasonEarning = observer(() => {
        let items = this.controller.seasonData;
        let header = <div className="px-3">
            <div className="px-3 c6">年月</div>
            <div className="px-3 c6 text-right">股本</div>
            <div className="px-3 c6 text-right">季收益</div>
            <div className="px-3 c6 text-right">年收益</div>
            <div className="px-3 c6 text-right">ROE</div>
            <div className="px-3 c6 text-right">股本o</div>
            <div className="px-3 c6 text-right">季收益o</div>
            <div className="px-3 c6 text-right">年收益o</div>
        </div>;
        return <>
            <div className="px-3 py-1">历年季度股本收益</div>
            <List header={header} loading="..."
                items={items}
                item={{
                    render: (row: { season: number, c: number, e: number, esum: number, corg: number, eorg: number, esumorg: number }) => {
                        let { season, c, e, esum, corg, eorg, esumorg } = row;
                        let ym = GFunc.SeasonnoToYearMonth(season);
                        let a = 0;
                        return <div className="px-3 py-2 d-flex flex-wrap">
                            <div className="px-3 c6">{ym.toString()}</div>
                            <div className="px-3 c6 text-right">{GFunc.numberToFixString(c)}</div>
                            <div className="px-3 c6 text-right">{GFunc.numberToFixString(e)}</div>
                            <div className="px-3 c6 text-right">{GFunc.numberToFixString(esum)}</div>
                            <div className="px-3 c6 text-right">{GFunc.percentToFixString(esum / c)}</div>
                            <div className="px-3 c6 text-right">{GFunc.numberToFixString(corg)}</div>
                            <div className="px-3 c6 text-right">{GFunc.numberToFixString(eorg)}</div>
                            <div className="px-3 c6 text-right">{GFunc.numberToFixString(esumorg)}</div>
                        </div>
                    }
                }}
            />
        </>
    });


    private capitalEarning = observer(() => {
        let items = this.controller.capitalearning;
        let header = <div className="px-3">
            <div className="px-3 c6">年</div>
            <div className="px-3 c6 text-right">股本</div>
            <div className="px-3 c6 text-right">收益</div>
            <div className="px-3 c6 text-right">ROE</div>
        </div>;
        return <>
            <div className="px-3 py-1">历年股本收益</div>
            <List header={header} loading="..."
                items={items}
                item={{
                    render: (row: StockCapitalearning) => {
                        let { capital, earning } = row;
                        return <div className="px-3 py-2 d-flex flex-wrap">
                            <div className="px-3 c6">{row.year}</div>
                            <div className="px-3 c6 text-right"> {capital.toFixed(2)}</div>
                            <div className="px-3 c6 text-right"> {earning.toFixed(2)}</div>
                            <div className="px-3 c6 text-right"> {(earning / capital * 100).toFixed(1)}%</div>
                        </div>
                    }
                }}
            />
        </>
    });

    private bonus = observer(() => {
        let items = this.controller.bonus;
        let header = <div className="px-3">
            <div className="px-3 c8">日期</div>
            <div className="px-3 c6 text-right">分红</div>
        </div>;
        return <>
            <div className="px-3 py-1">历年分红</div>
            <List header={header} loading="..."
                items={items}
                item={{
                    render: (row: StockBonus) => {
                        return <div className="px-3 py-2 d-flex flex-wrap">
                            <div className="px-3 c8">{row.day}</div>
                            <div className="px-3 c6 text-right"> {row.bonus.toFixed(2)}</div>
                        </div>
                    }
                }}
            />
        </>
    });
}