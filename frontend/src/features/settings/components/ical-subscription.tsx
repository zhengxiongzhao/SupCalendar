import { useState } from 'react'
import { Copy, Check, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSubscriptionUrls } from '@/api/calendar'

function deriveSubscriptionUrls(baseUrl: string) {
  const httpUrl = baseUrl.replace(/^webcal:\/\//, 'https://')
  const webcalUrl = baseUrl.startsWith('webcal://') ? baseUrl : baseUrl.replace(/^https?:\/\//, 'webcal://')
  return [
    { label: 'iCloud / Mac 日历', url: webcalUrl },
    { label: 'Google 日历', url: httpUrl },
    { label: '其他日历 (HTTP)', url: httpUrl },
  ]
}

export function IcalSubscription() {
  const { data: subscriptionData, isLoading } = useSubscriptionUrls()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>日历订阅</CardTitle>
          <CardDescription>通过 iCal 订阅你的日历记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-4'>
            <Loader2 className='size-6 animate-spin text-muted-foreground' />
          </div>
        </CardContent>
      </Card>
    )
  }

  const subscriptionUrls = deriveSubscriptionUrls(subscriptionData?.url || '')

  return (
    <Card>
      <CardHeader>
        <CardTitle>日历订阅</CardTitle>
        <CardDescription>将你的记录同步到外部日历应用</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {subscriptionUrls.map((item) => (
            <SubscriptionUrlItem key={item.label} label={item.label} url={item.url} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SubscriptionUrlItem({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('已复制到剪贴板')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('复制失败')
    }
  }

  return (
    <div className='flex items-center gap-2'>
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-medium'>{label}</p>
        <p className='truncate font-mono text-xs text-muted-foreground'>{url}</p>
      </div>
      <div className='flex gap-1'>
        <Button variant='ghost' size='icon' onClick={handleCopy}>
          {copied ? <Check className='size-4 text-emerald-500' /> : <Copy className='size-4' />}
        </Button>
        <Button variant='ghost' size='icon' asChild>
          <a href={url} target='_blank' rel='noopener noreferrer'>
            <ExternalLink className='size-4' />
          </a>
        </Button>
      </div>
    </div>
  )
}
