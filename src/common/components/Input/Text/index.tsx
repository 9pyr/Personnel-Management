import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { Controller, useFormContext } from 'react-hook-form'

export interface TextInputProps {
  name: string
  label: string
  required?: boolean
  type?: 'text' | 'email' | 'password'
  disabled?: boolean
  placeholder?: string
  className?: string
  multiline?: boolean
  minRows?: number
}

const TextInput = ({
  name,
  label,
  required,
  type = 'text',
  disabled,
  placeholder,
  className,
  multiline,
  minRows = 3,
}: TextInputProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      control={control}
      name={name}
      rules={required ? { required: `${label} จำเป็นต้องกรอก` } : undefined}
      render={({ field, fieldState }) => {
        const errorMessage = fieldState.error?.message
        const containerClass =
          className != null && className.trim().length > 0
            ? `grid w-full gap-2 ${className}`
            : 'grid w-full gap-2'
        return (
          <div className={containerClass}>
            <Label htmlFor={name}>
              {label}
              {required && <span className="text-destructive"> *</span>}
            </Label>
            {multiline ? (
              <Textarea
                id={name}
                placeholder={placeholder}
                disabled={disabled}
                rows={minRows}
                className="min-h-[80px] resize-y"
                {...field}
              />
            ) : (
              <Input
                id={name}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                {...field}
              />
            )}
            {errorMessage && <p className="text-xs text-destructive">{String(errorMessage)}</p>}
          </div>
        )
      }}
    />
  )
}

export default TextInput
