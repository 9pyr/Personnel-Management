import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid2 from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import Form from 'common/components/Form'
import TextInput from 'common/components/Input/Text'
import { getMe, updateProfile, uploadProfileImage } from 'core/apis/auth'
import type { UpdateProfileRequest, User } from 'core/apis/auth/types'
import apiCaller from 'core/endpoints/apiCaller'
import { authUserState } from 'core/stores/auth'
import { useSnackbar } from 'notistack'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'

function profileImageSrc(user: User | null): string | undefined {
  const url = user?.profileImageUrl
  if (!url) return undefined
  const base = apiCaller.defaults.baseURL ?? ''
  return url.startsWith('http') ? url : `${base}${url}`
}

const ProfilePage = () => {
  const { enqueueSnackbar } = useSnackbar()
  const user = useRecoilValue(authUserState)
  const setUser = useSetRecoilState(authUserState)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadProfile = useCallback(async () => {
    try {
      const me = await getMe()
      setProfile(me)
      setUser(me)
    } catch {
      enqueueSnackbar('โหลดโปรไฟล์ไม่สำเร็จ', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [enqueueSnackbar, setUser])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('กรุณาเลือกไฟล์รูปภาพ', { variant: 'error' })
      return
    }
    try {
      await uploadProfileImage(file)
      await loadProfile()
      enqueueSnackbar('อัปโหลดรูปโปรไฟล์สำเร็จ', { variant: 'success' })
    } catch {
      enqueueSnackbar('อัปโหลดรูปไม่สำเร็จ', { variant: 'error' })
    }
    e.target.value = ''
  }

  if (loading || !profile) {
    return (
      <Box py={4}>
        <Typography color="text.secondary">กำลังโหลด...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Stack spacing={2}>
        <Typography variant="h5">จัดการโปรไฟล์</Typography>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={3}>
              <Stack direction="row" spacing={3} alignItems="flex-start">
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={profileImageSrc(profile)}
                    sx={{ width: 120, height: 120 }}
                  >
                    {profile.name?.charAt(0) ?? '?'}
                  </Avatar>
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    hidden
                    onChange={handleAvatarChange}
                  />
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    คลิกไอคอนกล้องเพื่อเปลี่ยนรูปโปรไฟล์ (JPEG, PNG, GIF, WebP สูงสุด 5MB)
                  </Typography>
                </Box>
              </Stack>

              <Form
                defaultValues={{
                  name: profile.name ?? '',
                  email: profile.email ?? '',
                  education: profile.education ?? '',
                  position: profile.position ?? '',
                  phone: profile.phone ?? '',
                }}
                onSubmit={async values => {
                  const payload: UpdateProfileRequest = {
                    name: values.name as string,
                    email: values.email as string,
                    education: (values.education as string) || undefined,
                    position: (values.position as string) || undefined,
                    phone: (values.phone as string) || undefined,
                  }
                  const updated = await updateProfile(payload)
                  setProfile(updated)
                  setUser(updated)
                  enqueueSnackbar('บันทึกโปรไฟล์สำเร็จ', { variant: 'success' })
                }}
              >
                <Grid2 container spacing={2}>
                  <Grid2 size={12} md={6}>
                    <TextInput name="name" label="ชื่อ" required />
                  </Grid2>
                  <Grid2 size={12} md={6}>
                    <TextInput name="email" label="อีเมล" type="email" required />
                  </Grid2>
                  <Grid2 size={12} md={6}>
                    <TextInput name="education" label="การศึกษา" />
                  </Grid2>
                  <Grid2 size={12} md={6}>
                    <TextInput name="position" label="ตำแหน่งหน้าที่" />
                  </Grid2>
                  <Grid2 size={12} md={6}>
                    <TextInput name="phone" label="เบอร์โทร" />
                  </Grid2>
                  <Grid2 size={12}>
                    <Button type="submit" variant="contained">
                      บันทึก
                    </Button>
                  </Grid2>
                </Grid2>
              </Form>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  )
}

export default ProfilePage
