import { getListLeave } from 'core/apis/leave'
import { selector } from 'recoil'

export const leaveListState = selector({
  key: 'leaveListState',
  get: async () => {
    const { data } = await getListLeave()
    return data
  },
})
