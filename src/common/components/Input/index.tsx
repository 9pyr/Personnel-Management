import { FilledTextFieldProps, TextField } from '@mui/material'

import { Controller, useFormContext } from 'react-hook-form'

interface InputProps extends Omit<FilledTextFieldProps, 'variant'> {
  name: string
  label: string
}

const Input = ({ name, label, ...props }: InputProps) => {
  const { control } = useFormContext()
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <TextField label={label} {...field} {...props} variant="filled" fullWidth />
      )}
    />
  )
}

export default Input
