import { Camera } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSetRecoilState } from 'recoil'
import { toast } from 'sonner'

import Form from 'common/components/Form'
import TextInput from 'common/components/Input/Text'
import { getMe, updateProfile, uploadProfileImage } from 'core/apis/auth'
import { updateProfileRequestSchema } from 'core/apis/auth/schemas'
import type { User } from 'core/apis/auth/types'
import apiCaller from 'core/endpoints/apiCaller'
import { authUserState } from 'core/stores/auth'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function profileImageSrc(user: User | null): string | undefined {
  const url = user?.profileImageUrl
  if (!url) return undefined
  const base = apiCaller.defaults.baseURL ?? ''
  return url.startsWith('http') ? url : `${base}${url}`
}

const ProfilePage = () => {
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
      toast.error('โหลดโปรไฟล์ไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }, [setUser])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพ')
      return
    }
    try {
      await uploadProfileImage(file)
      await loadProfile()
      toast.success('อัปโหลดรูปโปรไฟล์สำเร็จ')
    } catch {
      toast.error('อัปโหลดรูปไม่สำเร็จ')
    }
    e.target.value = ''
  }

  if (loading || !profile) {
    return (
      <div className="py-8">
        <p className="text-muted-foreground">กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">จัดการโปรไฟล์</h2>

        <Card className="border">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-row items-start gap-4">
                <div className="relative">
                  <Avatar className="h-28 w-28">
                    <AvatarImage src={profileImageSrc(profile)} alt={profile.name ?? undefined} />
                    <AvatarFallback>{profile.name?.charAt(0) ?? '?'}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    คลิกไอคอนกล้องเพื่อเปลี่ยนรูปโปรไฟล์ (JPEG, PNG, GIF, WebP สูงสุด 5MB)
                  </p>
                </div>
              </div>

              <Form
                defaultValues={{
                  name: profile.name ?? '',
                  email: profile.email ?? '',
                  education: profile.education ?? '',
                  position: profile.position ?? '',
                  phone: profile.phone ?? '',
                }}
                onSubmit={async values => {
                  const parsed = updateProfileRequestSchema.safeParse({
                    name: values.name,
                    email: values.email,
                    education: values.education || undefined,
                    position: values.position || undefined,
                    phone: values.phone || undefined,
                  })
                  if (!parsed.success) {
                    toast.error(parsed.error.errors.map(e => e.message).join(', '))
                    return
                  }
                  const updated = await updateProfile(parsed.data)
                  setProfile(updated)
                  setUser(updated)
                  toast.success('บันทึกโปรไฟล์สำเร็จ')
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput name="name" label="ชื่อ" required />
                  <TextInput name="email" label="อีเมล" type="email" required />
                  <TextInput name="education" label="การศึกษา" />
                  <TextInput name="position" label="ตำแหน่งหน้าที่" />
                  <TextInput name="phone" label="เบอร์โทร" />
                </div>
                <div className="mt-4">
                  <Button type="submit">บันทึก</Button>
                </div>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProfilePage
