import { useNavigate } from 'react-router-dom'
import { useSetRecoilState } from 'recoil'
import { toast } from 'sonner'

import Form from 'common/components/Form'
import TextInput from 'common/components/Input/Text'
import { login } from 'core/apis/auth'
import { authTokenState, authUserState, persistAuthAfterLogin } from 'core/stores/auth'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const LoginPage = () => {
  const navigate = useNavigate()
  const setToken = useSetRecoilState(authTokenState)
  const setUser = useSetRecoilState(authUserState)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="min-w-[360px] overflow-visible border">
        <CardContent className="p-6">
          <h1 className="mb-2 text-center text-xl font-semibold text-primary">
            ระบบจัดการบุคคล
          </h1>
          <p className="mb-4 text-center text-sm text-muted-foreground">
            เข้าสู่ระบบ
          </p>
          <Form
            defaultValues={{ email: '', password: '' }}
            onSubmit={async values => {
              const { email, password } = values as { email: string; password: string }
              try {
                const res = await login({ email, password })
                setToken(res.token)
                setUser(res.user)
                persistAuthAfterLogin(res.token, res.user)
                toast.success('เข้าสู่ระบบสำเร็จ')
                navigate('/', { replace: true })
              } catch (err: unknown) {
                const msg =
                  err != null && typeof (err as { code?: string }).code === 'string' &&
                  (err as { code: string }).code === 'ERR_NETWORK'
                    ? 'เชื่อมต่อ server ไม่ได้ — กรุณารัน backend (port 8080)'
                    : 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
                toast.error(msg)
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
