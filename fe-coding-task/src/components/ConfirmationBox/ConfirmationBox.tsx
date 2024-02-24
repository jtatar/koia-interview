import React from 'react'
import { Button } from '@mui/material'
import { FormInputType } from '../../commonTypes'
import queryString from 'query-string';

interface ConfirmationBoxProps {
    setIsFormSubmitted: React.Dispatch<React.SetStateAction<boolean>>
    formState: FormInputType;
}

const ConfirmationBox = ({setIsFormSubmitted, formState}: ConfirmationBoxProps) => {

    const saveToLocalStorage  = (): void => {
        setIsFormSubmitted(false)
        let history = localStorage.getItem('searchHistory') || '';
        history += `${queryString.stringify(formState)};`
        localStorage.setItem('searchHistory', history);
    }

    return (
        <div>
            <h3>
                Do you want to store search in history?
            </h3>
            <Button variant='contained' onClick={saveToLocalStorage}>Yes</Button>
            <Button onClick={() => setIsFormSubmitted(false)}>No</Button>
        </div>
    )
}

export default ConfirmationBox