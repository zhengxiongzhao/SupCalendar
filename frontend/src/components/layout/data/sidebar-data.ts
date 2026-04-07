import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
} from 'lucide-react'
import { CalendarDays } from 'lucide-react'
import { DollarSign } from 'lucide-react'
import { User } from 'lucide-react'
import { ClerkLogo } from '@/assets/clerk-logo'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: 'Apps',
          url: '/apps',
          icon: Package,
        },
        {
          title: 'Chats',
          url: '/chats',
          badge: '3',
          icon: MessagesSquare,
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Secured by Clerk',
          icon: ClerkLogo,
          items: [
            {
              title: 'Sign In',
              url: '/clerk/sign-in',
            },
            {
              title: 'Sign Up',
              url: '/clerk/sign-up',
            },
            {
              title: 'User Management',
              url: '/clerk/user-management',
            },
          ],
        },
      ],
    },
    {
      title: 'SupCalendar',
      items: [
        {
          title: '财务概览',
          url: '/supcal',
          icon: LayoutDashboard,
        },
        {
          title: '日历视图',
          icon: CalendarDays,
          items: [
            {
              title: '日历视图 1 · 热力图',
              url: '/supcal/calendar-1',
            },
            {
              title: '日历视图 2 · 卡片网格',
              url: '/supcal/calendar-2',
            },
            {
              title: '日历视图 3 · 玻璃网格',
              url: '/supcal/calendar-3',
            },
            {
              title: '日历视图 4 · 环形统计',
              url: '/supcal/calendar-4',
            },
            {
              title: '日历视图 5 · 双栏日程',
              url: '/supcal/calendar-5',
            },
            {
              title: '日历视图 6 · 看板日程',
              url: '/supcal/calendar-6',
            },
            {
              title: '日历视图 7 · 日程提醒',
              url: '/supcal/calendar-7',
            },
            {
              title: '日历视图 8 · 时间轴日程',
              url: '/supcal/calendar-8',
            },
            {
              title: '日历视图 9 · 迷你仪表盘',
              url: '/supcal/calendar-9',
            },
            {
              title: '日历视图 10 · 拼图网格',
              url: '/supcal/calendar-10',
            },
            {
              title: '日历视图 11 · 径向日历',
              url: '/supcal/calendar-11',
            },
            {
              title: '日历视图 12 · 树形概览',
              url: '/supcal/calendar-12',
            },
            {
              title: '日历视图 13 · 脉冲活动',
              url: '/supcal/calendar-13',
            },
            {
              title: '日历视图 14 · 马赛克热图',
              url: '/supcal/calendar-14',
            },
            {
              title: '日历视图 15 · 轨道视图',
              url: '/supcal/calendar-15',
            },
          ],
        },
        {
          title: '所有记录',
          url: '/supcal/records',
          icon: ListTodo,
        },
        {
          title: '新建记录',
          url: '/supcal/create',
          icon: DollarSign,
        },
        {
          title: '个人中心',
          url: '/supcal/profile',
          icon: User,
        },
      ],
    },
    {
      title: 'Pages',
      items: [
        {
          title: 'Auth',
          icon: ShieldCheck,
          items: [
            {
              title: 'Sign In',
              url: '/sign-in',
            },
            {
              title: 'Sign In (2 Col)',
              url: '/sign-in-2',
            },
            {
              title: 'Sign Up',
              url: '/sign-up',
            },
            {
              title: 'Forgot Password',
              url: '/forgot-password',
            },
            {
              title: 'OTP',
              url: '/otp',
            },
          ],
        },
        {
          title: 'Errors',
          icon: Bug,
          items: [
            {
              title: 'Unauthorized',
              url: '/errors/unauthorized',
              icon: Lock,
            },
            {
              title: 'Forbidden',
              url: '/errors/forbidden',
              icon: UserX,
            },
            {
              title: 'Not Found',
              url: '/errors/not-found',
              icon: FileX,
            },
            {
              title: 'Internal Server Error',
              url: '/errors/internal-server-error',
              icon: ServerOff,
            },
            {
              title: 'Maintenance Error',
              url: '/errors/maintenance-error',
              icon: Construction,
            },
          ],
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
