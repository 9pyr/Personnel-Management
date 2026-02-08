import { InputLabel } from '@mui/material'
import FormControl from '@mui/material/FormControl'
import ListSubheader from '@mui/material/ListSubheader'
import MenuItem from '@mui/material/MenuItem'
import BaseSelect from '@mui/material/Select'

import { Controller, useFormContext } from 'react-hook-form'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectOptionGroup {
  groupLabel: string
  options: SelectOption[]
}

interface SelectInputProps {
  name: string
  label: string
  options: SelectOption[]
  optionGroups?: SelectOptionGroup[]
  disabled?: boolean
}

const SelectInput = ({ name, label, options, optionGroups, disabled }: SelectInputProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormControl fullWidth disabled={disabled}>
          <InputLabel id={`select:${name}`}>{label}</InputLabel>
          <BaseSelect
            variant="outlined"
            labelId={`select:${name}`}
            id={`select:${name}`}
            label={label}
            {...field}
            disabled={disabled}
          >
            {optionGroups != null && optionGroups.length > 0
              ? optionGroups.map((group, gi) => [
                  <ListSubheader key={`group-${name}-${gi}`} sx={{ lineHeight: 2 }}>
                    {group.groupLabel}
                  </ListSubheader>,
                  ...group.options.map((opt, oi) => (
                    <MenuItem key={`${name}-${gi}-${oi}`} value={opt.value} sx={{ pl: 3 }}>
                      {opt.label}
                    </MenuItem>
                  )),
                ])
              : options.map(({ value, label: optLabel }, index) => (
                  <MenuItem key={`select-optins-${name}:${index}`} value={value}>
                    {optLabel}
                  </MenuItem>
                ))}
          </BaseSelect>
        </FormControl>
      )}
    />
  )
}

export default SelectInput
