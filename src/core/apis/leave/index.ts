import apiCaller from 'core/endpoints/apiCaller'

import { Leave } from './types'

export const getListLeave = async () => {
  return apiCaller.get('/leaves')
}

export const getLeaveById = async (id: string) => {
  const { data } = await apiCaller.get(`/leaves/${id}`)
  return data
}

export const createLeave = async (payload: Leave) => {
  const { data } = await apiCaller.post('/leaves', payload)
  return data
}

export const updateLeaveById = async (payload: Leave) => {
  const { data } = await apiCaller.post('/leaves', payload)
  return data
}

export const nextStateLeave = async (id: string) => {
  return apiCaller.patch(`/leaves/${id}/next`)
}

export const rejectStateLeave = async (id: string) => {
  return apiCaller.patch(`/leaves/${id}/reject`)
}
