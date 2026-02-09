import { FieldValues, FormProvider, SubmitHandler, UseFormProps, useForm } from 'react-hook-form'

interface FormContextDefault {
  [key: string]: object
}

interface FormProps<TFieldValues extends FieldValues = FieldValues>
  extends UseFormProps<TFieldValues, FormContextDefault> {
  onSubmit: SubmitHandler<TFieldValues>
}

function Form<TFieldValues extends FieldValues = FieldValues>({
  children,
  onSubmit,
  ...props
}: React.PropsWithChildren<FormProps<TFieldValues>>) {
  const methods = useForm<TFieldValues, FormContextDefault>(props)

  return (
    <FormProvider {...methods}>
      <form className="w-full" onSubmit={methods.handleSubmit(onSubmit)}>
        {children}
      </form>
    </FormProvider>
  )
}
export default Form
