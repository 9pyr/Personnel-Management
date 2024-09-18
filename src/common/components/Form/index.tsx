import { FieldValues, FormProvider, SubmitHandler, useForm } from 'react-hook-form'

interface FormProps {
  onSubmit: SubmitHandler<FieldValues>
}

const Form = ({ children, onSubmit }: React.PropsWithChildren<FormProps>) => {
  const methods = useForm()

  return (
    <FormProvider {...methods}>
      <form className="w-full" onSubmit={methods.handleSubmit(onSubmit)}>
        {children}
      </form>
    </FormProvider>
  )
}

export default Form
