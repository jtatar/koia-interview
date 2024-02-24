import { useMemo, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import { FormInputType } from '../commonTypes';
import { calculateDateRange, prepareQuery } from '../helpers'

const TABLE_URL = 'https://data.ssb.no/api/v0/en/table/07241/'

interface useFormLogicResult {
    onSubmit: (fields: FormInputType) => void;
    formState: FormInputType;
    chartData: number[];
    datesRange: string[];
    loading: boolean;
    setIsFormSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
    isFormSubmitted: boolean;
}

const useFormLogic = () => {
    //Would need some function to extract query params we want
    const queryParams = useMemo(() => queryString.parse(window.location.search) as unknown as FormInputType, [])
    const [formState, setFormState] = useState<FormInputType>(queryParams);
    const [chartData, setChartData] = useState<number[]>([]);
    const [datesRange, setDatesRange] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false)
    const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

    const getNewChartData = useCallback((houseType: string, datesRange: string[]): void => {
        setLoading(true)
        axios.post(TABLE_URL, {
            ...prepareQuery(datesRange, houseType)
        }).then(
          ({data}) => {
            if (data?.value) {
              setChartData(data?.value)
            }
          }
        ).catch((err): void => {
          console.error(err)
        }).finally(() => {
            setLoading(false)
        })
    }, [])


    useEffect((): void => {
        const {endQuarter, endYear, houseType, startQuarter, startYear} = queryParams;
        if (!endQuarter || !endYear || !houseType || !startQuarter || !startYear) {
          return;
        }
    
        const datesRange = calculateDateRange(startYear, endYear, startQuarter, endQuarter);
        setDatesRange(datesRange);
        getNewChartData(houseType, datesRange);
      }, [getNewChartData, queryParams])


    const onSubmit = useCallback((fields: FormInputType): void => {
        const {endQuarter, endYear, houseType, startQuarter, startYear} = fields
        const queryParams = queryString.stringify(fields);
        window.history.replaceState(null, '', `?${queryParams}`)
        setIsFormSubmitted(true);
        setFormState(fields);
        const datesRange = calculateDateRange(startYear, endYear, startQuarter, endQuarter);
        setDatesRange(datesRange);
        getNewChartData(houseType, datesRange);
      }, [getNewChartData])

    return useMemo((): useFormLogicResult => {
        return {
            onSubmit,
            formState,
            chartData,
            datesRange,
            loading,
            setIsFormSubmitted,
            isFormSubmitted
        }
    }, [onSubmit, formState, chartData, datesRange, loading, setIsFormSubmitted, isFormSubmitted])
}

export default useFormLogic