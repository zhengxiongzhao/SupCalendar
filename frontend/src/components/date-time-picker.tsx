import { useState } from 'react'
import { format, parseISO, set } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DateTimePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = '选择日期和时间',
  disabled = false,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)

  const selectedDate = value ? parseISO(value) : undefined

  const hours = selectedDate ? format(selectedDate, 'HH') : ''
  const minutes = selectedDate ? format(selectedDate, 'mm') : ''

  function handleDateSelect(date: Date | undefined) {
    if (!date) return
    const now = new Date()
    const h = selectedDate ? selectedDate.getHours() : now.getHours()
    const m = selectedDate ? selectedDate.getMinutes() : now.getMinutes()
    const newDate = set(date, { hours: h, minutes: m })
    onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"))
  }

  function handleTimeChange(newHours: string, newMinutes: string) {
    const h = parseInt(newHours) || 0
    const m = parseInt(newMinutes) || 0
    const base = selectedDate || new Date()
    const newDate = set(base, { hours: h, minutes: m })
    onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          disabled={disabled}
          data-empty={!selectedDate}
          className={cn(
            'w-full justify-start text-start font-normal',
            !selectedDate && 'text-muted-foreground'
          )}
        >
          {selectedDate ? (
            format(selectedDate, 'yyyy年M月d日 HH:mm')
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className='ms-auto h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          captionLayout='dropdown'
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
        />
        <div className='border-t p-3'>
          <div className='flex items-center gap-2'>
            <Label className='text-xs text-muted-foreground shrink-0'>
              时间
            </Label>
            <Input
              type='text'
              value={hours}
              onChange={(e) => {
                const v = e.target.value
                if (v === '' || (/^\d{0,2}$/.test(v) && parseInt(v) <= 23)) {
                  handleTimeChange(v, minutes)
                }
              }}
              className='h-8 w-14 text-center text-sm'
              placeholder='HH'
              maxLength={2}
            />
            <span className='text-sm text-muted-foreground'>:</span>
            <Input
              type='text'
              value={minutes}
              onChange={(e) => {
                const v = e.target.value
                if (v === '' || (/^\d{0,2}$/.test(v) && parseInt(v) <= 59)) {
                  handleTimeChange(hours, v)
                }
              }}
              className='h-8 w-14 text-center text-sm'
              placeholder='mm'
              maxLength={2}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
