import { LayoutDashboard, Calendar, ListTodo, Plus, Settings } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'SupCalendar',
    email: '管理你的收付款和提醒',
    avatar: '',
  },
  navGroups: [
    {
      title: '导航',
      items: [
        { title: 'Dashboard', url: '/', icon: LayoutDashboard },
        { title: '日历', url: '/calendar', icon: Calendar },
        { title: '所有记录', url: '/records', icon: ListTodo },
        { title: '创建记录', url: '/create', icon: Plus },
      ],
    },
    {
      title: '其他',
      items: [
        { title: '设置', url: '/settings', icon: Settings },
      ],
    },
  ],
}
