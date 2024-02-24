export type QuarerType = "1" | "2" | "3" | "4";
export type HouseType = "00" | "02" | "03"

export type FormInputType = {
    startYear: string,
    startQuarter: QuarerType,
    endYear: string,
    endQuarter: QuarerType,
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
