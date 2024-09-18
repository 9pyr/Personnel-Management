import { FieldValues, FormProvider, SubmitHandler, UseFormProps, useForm } from 'react-hook-form'

interface FormProps extends UseFormProps<FieldValues, any> {
  onSubmit: SubmitHandler<FieldValues>
}

const Form = ({ children, onSubmit, ...props }: React.PropsWithChildren<FormProps>) => {
  const methods = useForm(props)

  return (
    <FormProvider {...methods}>
      <form className="w-full" onSubmit={methods.handleSubmit(onSubmit)}>
        {children}
      </form>
    </FormProvider>
  )
}

export default Form
