import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'

import Inprogress from '../components/Inprogress'

const LeavePageList = () => {
  const navigate = useNavigate()

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <strong>การลา</strong>
          <div className="flex justify-end">
            <Button onClick={() => navigate('/leave/new')}>ขอลา</Button>
          </div>
        </div>
        <Inprogress />
      </div>
    </div>
  )
}

export default LeavePageList
