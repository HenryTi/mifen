export interface UserTag {
	tagName: string;
	tagID?: number;
}

export interface StockFindConfig {
	sortType: string;
	selectType?: string;
}

export interface UserStockConfig {
	sortType: string;
}

export interface RegressionConfig {
	bmin: number;
	bmax: number;
	r2: number;
	lmin: number;
	lmax: number;
	lr2: number;
	mcount: number;
	lr4: number;
	r210: number;
	irate: number;
}

export interface MiConfigs {
	groupName: string;
	stockFind: StockFindConfig;
	userStock: UserStockConfig;
	regression: RegressionConfig;
	accountName?: string;
}

export interface IdName {
	id: number;
	name: string;
}

export interface Account {
	id: number;
	name: string;
}

export interface Stock {
	id: number;
	name: string;
	order: number;
	data?: string;
	v?: number;
	e: number;
	e3: number;
	ep: number;
	price: number;
	exprice: number;
	divyield: number;
	r2: number;
	lr2: number;
	predictpe?: number;
	dataArr?: number[];
}