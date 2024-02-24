import {useMemo} from 'react';
import { createTheme, Theme, ThemeProvider } from '@mui/material/styles';
import HouseForm from './components/HouseForm/HouseForm'
import BarChart from './components/BarChart/BarChart';
import useFormLogic from './hooks/useFormLogic';
import ConfirmationBox from './components/ConfirmationBox/ConfirmationBox';
import './App.css'

function App() {

  const {chartData, datesRange, formState, onSubmit, loading, setIsFormSubmitted, isFormSubmitted} = useFormLogic();


  const darkTheme = useMemo((): Theme => createTheme({
    palette: {
      mode: 'dark',
    },
  }), []);




  return (
    <ThemeProvider theme={darkTheme}>
      <HouseForm onSubmit={onSubmit} {...formState}/>
      {isFormSubmitted && <ConfirmationBox setIsFormSubmitted={setIsFormSubmitted} formState={formState}/>}
      <BarChart chartData={chartData} xAxis={datesRange} loading={loading}/>
    </ThemeProvider>
  )
}

export default App
