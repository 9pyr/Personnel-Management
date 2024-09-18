import { Button, Grid2 } from '@mui/material'

import DatePicker from 'common/components/DatePicker'
import Form from 'common/components/Form'
import Input from 'common/components/Input'
import Select from 'common/components/Select'
import { useSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'

import { leaveReason } from '../constants'
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
    >
      <Grid2 container spacing={2}>
        <Grid2 size={8}>
          <Select
            name="leaveReason"
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
          <Input name="desc" label="description" minRows={4} multiline />
        </Grid2>
        <Grid2 size={6}>
          <DatePicker name="from" label="from" />
        </Grid2>
        <Grid2 size={6}>
          <DatePicker name="to" label="to" />
        </Grid2>
        <Grid2 container size={6}>
          <Button variant="contained" type="submit">
            Save
          </Button>
          <Button variant="outlined" type="button" onClick={() => navigation('/leave')}>
            cancel
          </Button>
        </Grid2>
      </Grid2>
    </Form>
  )
}

export default LeavePageForm
