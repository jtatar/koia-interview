import { QuarerType, HouseQueryType } from "./commonTypes";

export const calculateDateRange = (startYear: string, endYear: string, startQuarter: QuarerType, endQuarter: QuarerType): string[] => {
    const datesRange = [] as string[];

    //Years are equal
    if (startYear === endYear) {
        for (let i = Number(startQuarter); i <= Number(endQuarter); i++) {
            datesRange.push(`${startYear}K${i}`)
        }
        return datesRange;
    }

    //Start year
    for (let i = Number(startQuarter); i <= 4; i++) {
        datesRange.push(`${startYear}K${i}`)
    }
    //Years between
    for(let i = Number(startYear) + 1; i < Number(endYear); i++) {
        for (let j = 1; j <= 4; j++) {
            datesRange.push(`${i}K${j}`)
        }
    }
    //End year
    for (let i = 1; i <= Number(endQuarter); i++) {
        datesRange.push(`${endYear}K${i}`)
    }

    return datesRange;
}

export const prepareQuery = (datesRange: string[], houseType: string): HouseQueryType => {
    return {
        query: [
          {
            code: "Boligtype",
            selection: {
                filter: "item",
                values: [
                    houseType
                ]
            }
          },
          {
            code: "ContentsCode",
            selection: {
                filter: "item",
                values: [
                    "KvPris"
                ]
            }
          },
          {
                code: "Tid",
                selection: {
                    filter: "item",
                    values: datesRange
                }
            }
        ],
        response: {
            format: "json-stat2"
        }
    }
}