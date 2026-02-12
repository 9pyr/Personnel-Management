import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import Form from 'common/components/Form'
import TextInput from 'common/components/Input/Text'
import { useLogin } from 'core/apis/auth/queries'
import { persistAuthAfterLogin, useAuthActions } from 'core/stores/auth'
import type { FieldValues } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface LoginFormValues extends FieldValues {
  email: string
  password: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function getErrorCode(error: unknown): string | undefined {
  if (!isRecord(error)) return undefined
  const code = error['code']
  return typeof code === 'string' ? code : undefined
}

const LoginPage = () => {
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthActions()
  const loginMutation = useLogin()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="min-w-[360px] overflow-visible border">
        <CardContent className="p-6">
          <h1 className="mb-2 text-center text-xl font-semibold text-primary">ระบบจัดการบุคคล</h1>
          <p className="mb-4 text-center text-sm text-muted-foreground">เข้าสู่ระบบ</p>
          <Form
            <LoginFormValues>
            defaultValues={{ email: '', password: '' }}
            onSubmit={async values => {
              const { email, password } = values
              try {
                const response = await loginMutation.mutateAsync({ email, password })
                setToken(response.token)
                setUser(response.user)
                persistAuthAfterLogin(response.token, response.user)
                toast.success('เข้าสู่ระบบสำเร็จ')
                navigate('/', { replace: true })
              } catch (error) {
                let message = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
                const code = getErrorCode(error)
                if (code === 'ERR_NETWORK') {
                  message = 'เชื่อมต่อ server ไม่ได้ — กรุณารัน backend (port 8080)'
                }
                toast.error(message)
              }
            }}
          >
            <div className="flex flex-col gap-4">
              <TextInput name="email" label="อีเมล" type="email" required />
              <TextInput name="password" label="รหัสผ่าน" type="password" required />
              <Button type="submit" size="lg" className="w-full">
                เข้าสู่ระบบ
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
