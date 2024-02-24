import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { TextField, Button, Select, MenuItem, InputLabel } from "@mui/material"
import { QuarerType, FormInputType, HouseType } from "../../commonTypes";
import './HouseForm.css'

const MIN_YEAR_VALIDATION_MESSAGE = "Year has to be greater than 2009"
const MAX_YEAR_VALIDATION_MESSAGE = "Year can not be greater than current"
const REQUIRED_VALIDATION_MESSAGE = "Field is required"
const INVALID_PERIOD_VALIDATION_MESSAGE = "End Date cannot be earlier than Start Date"

interface HouseFormProps {
    onSubmit: SubmitHandler<FormInputType>,
    startYear?: string,
    startQuarter?: QuarerType,
    endYear?: string,
    endQuarter?: QuarerType,
    houseType?: HouseType
}

const HouseForm = ({onSubmit, startYear, startQuarter, endYear, endQuarter, houseType}: HouseFormProps) => {
    const { control, handleSubmit, formState: {errors} } = useForm({
        defaultValues: {
            startYear: startYear || "2009",
            startQuarter: startQuarter || "1" as QuarerType,
            endYear: endYear || "2023",
            endQuarter: endQuarter || "4" as QuarerType,
            houseType: houseType || "00" as HouseType
        },
    })

    //Maybe better solution to prevent problems with only one input clearing error after validation?
    const validateDate = (value: unknown, fields: FormInputType): boolean | string => {
        if (fields.startYear < fields.endYear) {
            return true
        }

        if (fields.startYear === fields.endYear) {
            if (fields.startQuarter <= fields.endQuarter) {
                return true
            }
        }

        return INVALID_PERIOD_VALIDATION_MESSAGE
    }

    //Would probably go towards DateRangePicker, but it is in pro version of MUI
    return (
        <form className="houseForm" onSubmit={handleSubmit(onSubmit)}>
            <InputLabel variant="standard">
                Start Date
            </InputLabel>
            <div className="houseForm__group">
                <Controller
                    rules={{required: {value: true, message: REQUIRED_VALIDATION_MESSAGE}, min: {value: 2009, message: MIN_YEAR_VALIDATION_MESSAGE}, max: {value: 2023, message: MAX_YEAR_VALIDATION_MESSAGE}, validate:validateDate}}
                    name="startYear"
                    control={control}
                    render={({field}) => <TextField {...field} className="houseForm__textfield" type='number' variant='outlined' error={!!errors.startYear} helperText={errors?.startYear?.message} required={true}/>}
                />
                <Controller
                    rules={{required: {value: true, message: REQUIRED_VALIDATION_MESSAGE}, validate:validateDate}}
                    name="startQuarter"
                    control={control}
                    render={({field}) => {
                        return (
                            <Select
                                {...field}
                                error={!!errors.startQuarter}
                            >
                                <MenuItem value="1">Q1</MenuItem>
                                <MenuItem value="2">Q2</MenuItem>
                                <MenuItem value="3">Q3</MenuItem>
                                <MenuItem value="4">Q4</MenuItem>
                            </Select>
                        )
                    }}
                />
            </div>
            <InputLabel variant="standard">
                    End Date
            </InputLabel>
            <div className="houseForm__group">
                <Controller
                    rules={{required: {value: true, message: REQUIRED_VALIDATION_MESSAGE}, min: {value: 2009, message: MIN_YEAR_VALIDATION_MESSAGE}, max: {value: 2023, message: MAX_YEAR_VALIDATION_MESSAGE}, validate:validateDate}}
                    name="endYear"
                    control={control}
                    render={({field}) => <TextField {...field} className="houseForm__textfield" type='number' variant='outlined' error={!!errors.endYear} helperText={errors?.endYear?.message} required={true}/>}
                />
                <Controller
                    rules={{required: {value: true, message: REQUIRED_VALIDATION_MESSAGE}, validate:validateDate}}
                    name="endQuarter"
                    control={control}
                    render={({field}) => {
                        return (
                            <Select
                                {...field}
                                error={!!errors.endQuarter}
                            >
                                <MenuItem value="1">Q1</MenuItem>
                                <MenuItem value="2">Q2</MenuItem>
                                <MenuItem value="3">Q3</MenuItem>
                                <MenuItem value="4">Q4</MenuItem>
                            </Select>
                        )
                    }}
                />
            </div>
            <InputLabel variant="standard">
                    House Type
                </InputLabel>
            <div className="houseForm__group">
                <Controller
                    rules={{required: {value: true, message: REQUIRED_VALIDATION_MESSAGE}}}
                    name="houseType"
                    control={control}
                    render={({field}) => {
                        return (
                            <Select
                                fullWidth
                                {...field}
                            >
                                <MenuItem value="00">Total</MenuItem>
                                <MenuItem value="02">Row houses</MenuItem>
                                <MenuItem value="03">Multi-dwelling</MenuItem>
                            </Select>
                        )
                    }}
                />
            </div>
            <Button variant='outlined' size='large' onClick={handleSubmit(onSubmit)}>Submit</Button>
        </form>
    )
}

export default HouseForm;