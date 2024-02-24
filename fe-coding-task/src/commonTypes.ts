export type QuarterType = "1" | "2" | "3" | "4";
export type HouseType = "00" | "02" | "03"

export type FormInputType = {
    startYear: string,
    startQuarter: QuarterType,
    endYear: string,
    endQuarter: QuarterType,
    houseType: HouseType
}

export type HouseQueryType = {
    query: {
        code: string;
        selection: {
            filter: string;
            values: string[];
        };
    }[];
    response: {
        format: string;
    };
}
