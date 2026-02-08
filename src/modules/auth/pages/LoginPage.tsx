import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'
import { useSetRecoilState } from 'recoil'

import Form from 'common/components/Form'
import TextInput from 'common/components/Input/Text'
import { login } from 'core/apis/auth'
import { authTokenState, authUserState, persistAuthAfterLogin } from 'core/stores/auth'

const LoginPage = () => {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const setToken = useSetRecoilState(authTokenState)
  const setUser = useSetRecoilState(authUserState)

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ minWidth: 360, overflow: 'visible' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom align="center" color="primary" fontWeight={600}>
            ระบบจัดการบุคคล
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} align="center">
            เข้าสู่ระบบ
          </Typography>
          <Form
            defaultValues={{ email: '', password: '' }}
            onSubmit={async values => {
              const { email, password } = values as { email: string; password: string }
              try {
                const res = await login({ email, password })
                setToken(res.token)
                setUser(res.user)
                persistAuthAfterLogin(res.token, res.user)
                enqueueSnackbar('เข้าสู่ระบบสำเร็จ', { variant: 'success' })
                navigate('/', { replace: true })
              } catch (err: unknown) {
                const msg =
                  err != null && typeof (err as { code?: string }).code === 'string' &&
                  (err as { code: string }).code === 'ERR_NETWORK'
                    ? 'เชื่อมต่อ server ไม่ได้ — กรุณารัน backend (port 8080)'
                    : 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
                enqueueSnackbar(msg, { variant: 'error' })
              }
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextInput name="email" label="อีเมล" type="email" required inputProps={{ autoComplete: 'email' }} />
              <TextInput name="password" label="รหัสผ่าน" type="password" required inputProps={{ autoComplete: 'current-password' }} />
              <Button type="submit" variant="contained" size="large" fullWidth>
                เข้าสู่ระบบ
              </Button>
            </Box>
          </Form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default LoginPage
