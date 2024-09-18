import { Button, Grid2 } from '@mui/material'

import Form from 'common/components/Form'
import DatePicker from 'common/components/Input/DatePicker'
import Select from 'common/components/Input/Select'
import TextInput from 'common/components/Input/Text'
import { getLeaveById } from 'core/apis/leave/inde'
import { useSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'

import { leaveFields, leaveReason } from '../constants'
import { LEAVE_REASON_LABEL } from '../mapper'

const LeavePageForm = () => {
  const navigation = useNavigate()

  const { enqueueSnackbar } = useSnackbar()

  return (
    <Form
      onSubmit={values => {
        console.log(values)
        enqueueSnackbar('Submit', { variant: 'success' })
      }}
      defaultValues={getLeaveById()}
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
          <DatePicker name={leaveFields.dateFrom} label="From" />
        </Grid2>
        <Grid2 size={6}>
          <DatePicker name={leaveFields.dateTo} label="To" />
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
