import { BarChart as BarChartMui } from "@mui/x-charts"
import { CircularProgress } from "@mui/material"

interface BarChartProps {
    xAxis: string[],
    chartData: number[],
    loading: boolean
}

const BarChart = ({xAxis, chartData, loading}: BarChartProps) => {
  return (
    <>
        {loading && <CircularProgress style={{marginTop: '150px'}}/>}
        {!loading && xAxis?.length && chartData?.length && <BarChartMui width={500} height={300} xAxis={[{scaleType: 'band', data:xAxis}]} series={[{data: chartData}]}/> || null}
    </>
  )
}

export default BarChart