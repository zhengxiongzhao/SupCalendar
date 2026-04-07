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
              title: '日历视图 2 · 密度网格',
              url: '/supcal/calendar-2',
            },
            {
              title: '日历视图 3 · 紧凑网格',
              url: '/supcal/calendar-3',
            },
            {
              title: '日历视图 4 · 卡片网格',
              url: '/supcal/calendar-4',
            },
            {
              title: '日历视图 5 · 玻璃网格',
              url: '/supcal/calendar-5',
            },
            {
              title: '日历视图 6 · 甘特日程',
              url: '/supcal/calendar-6',
            },
            {
              title: '日历视图 7 · 环形统计',
              url: '/supcal/calendar-7',
            },
            {
              title: '日历视图 8 · 双栏日程',
              url: '/supcal/calendar-8',
            },
            {
              title: '日历视图 9 · 看板日程',
              url: '/supcal/calendar-9',
            },
            {
              title: '日历视图 10 · 日程提醒',
              url: '/supcal/calendar-10',
            },
            {
              title: '日历视图 11 · 时间轴日程',
              url: '/supcal/calendar-11',
            },
            {
              title: '日历视图 12 · 迷你仪表盘',
              url: '/supcal/calendar-12',
            },
            {
              title: '日历视图 13 · 泳道视图',
              url: '/supcal/calendar-13',
            },
            {
              title: '日历视图 14 · 气泡矩阵',
              url: '/supcal/calendar-14',
            },
            {
              title: '日历视图 15 · 手风琴日程',
              url: '/supcal/calendar-15',
            },
            {
              title: '日历视图 16 · 拼图网格',
              url: '/supcal/calendar-16',
            },
            {
              title: '日历视图 17 · 径向日历',
              url: '/supcal/calendar-17',
            },
            {
              title: '日历视图 18 · 树形概览',
              url: '/supcal/calendar-18',
            },
            {
              title: '日历视图 19 · 脉冲活动',
              url: '/supcal/calendar-19',
            },
            {
              title: '日历视图 20 · 马赛克热图',
              url: '/supcal/calendar-20',
            },
            {
              title: '日历视图 21 · 波浪日程',
              url: '/supcal/calendar-21',
            },
            {
              title: '日历视图 22 · 瀑布流',
              url: '/supcal/calendar-22',
            },
            {
              title: '日历视图 23 · 轨道视图',
              url: '/supcal/calendar-23',
            },
            {
              title: '日历视图 24 · 菱形日历',
              url: '/supcal/calendar-24',
            },
            {
              title: '日历视图 25 · 棱镜统计',
              url: '/supcal/calendar-25',
            },
            {
              title: '日历视图 26 · 梳子视图',
              url: '/supcal/calendar-26',
            },
            {
              title: '日历视图 27 · 阶梯日程',
              url: '/supcal/calendar-27',
            },
            {
              title: '日历视图 28 · 棋盘视图',
              url: '/supcal/calendar-28',
            },
            {
              title: '日历视图 29 · 蜂巢网格',
              url: '/supcal/calendar-29',
            },
            {
              title: '日历视图 30 · 气压计',
              url: '/supcal/calendar-30',
            },
            {
              title: '日历视图 31 · 涟漪日历',
              url: '/supcal/calendar-31',
            },
            {
              title: '日历视图 32 · 拼贴画',
              url: '/supcal/calendar-32',
            },
            {
              title: '日历视图 33 · 音频波形',
              url: '/supcal/calendar-33',
            },
            {
              title: '日历视图 34 · 流体布局',
              url: '/supcal/calendar-34',
            },
            {
              title: '日历视图 35 · 晶格视图',
              url: '/supcal/calendar-35',
            },
            {
              title: '日历视图 36 · 条形码日历',
              url: '/supcal/calendar-36',
            },
            {
              title: '日历视图 37 · 万花筒',
              url: '/supcal/calendar-37',
            },
            {
              title: '日历视图 38 · 雪花视图',
              url: '/supcal/calendar-38',
            },
            {
              title: '日历视图 39 · 螺旋日程',
              url: '/supcal/calendar-39',
            },
            {
              title: '日历视图 40 · 森林日历',
              url: '/supcal/calendar-40',
            },
            {
              title: '日历视图 41 · 迷宫视图',
              url: '/supcal/calendar-41',
            },
            {
              title: '日历视图 42 · 极光日历',
              url: '/supcal/calendar-42',
            },
            {
              title: '日历视图 43 · 锯齿视图',
              url: '/supcal/calendar-43',
            },
            {
              title: '日历视图 44 · 管道日程',
              url: '/supcal/calendar-44',
            },
            {
              title: '日历视图 45 · 涂鸦日历',
              url: '/supcal/calendar-45',
            },
            {
              title: '日历视图 46 · 折纸视图',
              url: '/supcal/calendar-46',
            },
            {
              title: '日历视图 47 · 气泡视图',
              url: '/supcal/calendar-47',
            },
            {
              title: '日历视图 48 · 山脊线',
              url: '/supcal/calendar-48',
            },
            {
              title: '日历视图 49 · 纺织日历',
              url: '/supcal/calendar-49',
            },
            {
              title: '日历视图 50 · 霓虹视图',
              url: '/supcal/calendar-50',
            },
            {
              title: '日历视图 51 · 蛛网日程',
              url: '/supcal/calendar-51',
            },
            {
              title: '日历视图 52 · 晶体视图',
              url: '/supcal/calendar-52',
            },
            {
              title: '日历视图 53 · 梦幻日历',
              url: '/supcal/calendar-53',
            },
            {
              title: '日历视图 54 · 矩阵视图',
              url: '/supcal/calendar-54',
            },
            {
              title: '日历视图 55 · 渐变视图',
              url: '/supcal/calendar-55',
            },
            {
              title: '日历视图 56 · 细胞视图',
              url: '/supcal/calendar-56',
            },
            {
              title: '日历视图 57 · 星云日历',
              url: '/supcal/calendar-57',
            },
            {
              title: '日历视图 58 · 像素视图',
              url: '/supcal/calendar-58',
            },
            {
              title: '日历视图 59 · 流程日历',
              url: '/supcal/calendar-59',
            },
            {
              title: '日历视图 60 · 沙丘视图',
              url: '/supcal/calendar-60',
            },
            {
              title: '日历视图 61 · 莫比乌斯',
              url: '/supcal/calendar-61',
            },
            {
              title: '日历视图 62 · 漩涡视图',
              url: '/supcal/calendar-62',
            },
            {
              title: '日历视图 63 · 珊瑚日历',
              url: '/supcal/calendar-63',
            },
            {
              title: '日历视图 64 · 分形视图',
              url: '/supcal/calendar-64',
            },
            {
              title: '日历视图 65 · 棱柱视图',
              url: '/supcal/calendar-65',
            },
            {
              title: '日历视图 66 · 光谱日历',
              url: '/supcal/calendar-66',
            },
            {
              title: '日历视图 67 · 波纹视图',
              url: '/supcal/calendar-67',
            },
            {
              title: '日历视图 68 · 档案日历',
              url: '/supcal/calendar-68',
            },
            {
              title: '日历视图 69 · 几何视图',
              url: '/supcal/calendar-69',
            },
            {
              title: '日历视图 70 · 纷繁日历',
              url: '/supcal/calendar-70',
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
