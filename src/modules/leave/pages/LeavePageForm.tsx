import { Button, Grid2 } from '@mui/material'

import Form from 'common/components/Form'
import DatePicker from 'common/components/Input/DatePicker'
import Select from 'common/components/Input/Select'
import TextInput from 'common/components/Input/Text'
import { getLeaveById, updateLeaveById } from 'core/apis/leave'
import { Leave } from 'core/apis/leave/types'
import { useSnackbar } from 'notistack'
import { useNavigate, useParams } from 'react-router-dom'

import { leaveFields, leaveReason } from '../constants'
import { LEAVE_REASON_LABEL } from '../mapper'

const LeavePageForm = () => {
  const navigation = useNavigate()

  const { enqueueSnackbar } = useSnackbar()

  const { id } = useParams()

  if (!id) {
    return <>404</>
  }

  return (
    <Form
      onSubmit={async values => {
        await updateLeaveById(values as Leave)
        enqueueSnackbar('Submit', { variant: 'success' })
      }}
      defaultValues={async () => {
        const data = await getLeaveById(id)
        return data
      }}
    >
      <Grid2 container spacing={2}>
        <Grid2 size={8}>
          <Select
            name={leaveFields.reason}
            label="Reason"
            options={[
              {
                label: LEAVE_REASON_LABEL[leaveReason.AnnualLeave],
                value: leaveReason.AnnualLeave,
              },
              {
                label: LEAVE_REASON_LABEL[leaveReason.SickLeave],
                value: leaveReason.SickLeave,
              },
            ]}
          />
        </Grid2>
        <Grid2 size={12}>
          <TextInput name={leaveFields.description} label="Description" minRows={4} multiline />
        </Grid2>
        <Grid2 size={6}>
          <DatePicker name={leaveFields.startDate} label="From" />
        </Grid2>
        <Grid2 size={6}>
          <DatePicker name={leaveFields.endDate} label="To" />
        </Grid2>
        <Grid2 container size={12}>
          <Button variant="contained" type="submit">
            Save
          </Button>
          <Button variant="outlined" type="button" onClick={() => navigation('/leave')}>
            Cancel
          </Button>
        </Grid2>
      </Grid2>
    </Form>
  )
}

export default LeavePageForm
