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
            {
              title: '日历视图 16 · 月历日程',
              url: '/supcal/calendar-16',
            },
            {
              title: '日历视图 17 · 周日程表',
              url: '/supcal/calendar-17',
            },
            {
              title: '日历视图 18 · 日视图',
              url: '/supcal/calendar-18',
            },
            {
              title: '日历视图 19 · 年度总览',
              url: '/supcal/calendar-19',
            },
            {
              title: '日历视图 20 · 列表日程',
              url: '/supcal/calendar-20',
            },
            {
              title: '日历视图 21 · 日程排期',
              url: '/supcal/calendar-21',
            },
            {
              title: '日历视图 22 · 分类泳道',
              url: '/supcal/calendar-22',
            },
            {
              title: '日历视图 23 · 对比月历',
              url: '/supcal/calendar-23',
            },
            {
              title: '日历视图 24 · 月进度线',
              url: '/supcal/calendar-24',
            },
            {
              title: '日历视图 25 · 周报卡片',
              url: '/supcal/calendar-25',
            },
            {
              title: '日历视图 26 · 账本视图',
              url: '/supcal/calendar-26',
            },
            {
              title: '日历视图 27 · 折叠周历',
              url: '/supcal/calendar-27',
            },
            {
              title: '日历视图 28 · 环形月历',
              url: '/supcal/calendar-28',
            },
            {
              title: '日历视图 29 · 日程瀑布',
              url: '/supcal/calendar-29',
            },
            {
              title: '日历视图 30 · 水平时间轴',
              url: '/supcal/calendar-30',
            },
            {
              title: '日历视图 31 · 便签日历',
              url: '/supcal/calendar-31',
            },
            {
              title: '日历视图 32 · 日程仪表盘',
              url: '/supcal/calendar-32',
            },
            {
              title: '日历视图 33 · 优先级矩阵',
              url: '/supcal/calendar-33',
            },
            {
              title: '日历视图 34 · 打卡日历',
              url: '/supcal/calendar-34',
            },
            {
              title: '日历视图 35 · 双列表格',
              url: '/supcal/calendar-35',
            },
            {
              title: '日历视图 36 · 卡片墙',
              url: '/supcal/calendar-36',
            },
            {
              title: '日历视图 37 · 收支天平',
              url: '/supcal/calendar-37',
            },
            {
              title: '日历视图 38 · 脉冲月历',
              url: '/supcal/calendar-38',
            },
            {
              title: '日历视图 39 · 报纸排版',
              url: '/supcal/calendar-39',
            },
            {
              title: '日历视图 40 · 仪表盘',
              url: '/supcal/calendar-40',
            },
            {
              title: '日历视图 41 · 票据风格',
              url: '/supcal/calendar-41',
            },
            {
              title: '日历视图 42 · 棋盘格月历',
              url: '/supcal/calendar-42',
            },
            {
              title: '日历视图 43 · 泡泡月历',
              url: '/supcal/calendar-43',
            },
            {
              title: '日历视图 44 · 便签月历',
              url: '/supcal/calendar-44',
            },
            {
              title: '日历视图 45 · 波浪月历',
              url: '/supcal/calendar-45',
            },
            {
              title: '日历视图 46 · 邮戳月历',
              url: '/supcal/calendar-46',
            },
            {
              title: '日历视图 47 · 交通信号',
              url: '/supcal/calendar-47',
            },
            {
              title: '日历视图 48 · 电路板',
              url: '/supcal/calendar-48',
            },
            {
              title: '日历视图 49 · 标签云月历',
              url: '/supcal/calendar-49',
            },
            {
              title: '日历视图 50 · 温度计月历',
              url: '/supcal/calendar-50',
            },
            {
              title: '日历视图 51 · 数据矩阵',
              url: '/supcal/calendar-51',
            },
            {
              title: '日历视图 52 · 地图风格',
              url: '/supcal/calendar-52',
            },
            {
              title: '日历视图 53 · 书架月历',
              url: '/supcal/calendar-53',
            },
            {
              title: '日历视图 54 · 磁带月历',
              url: '/supcal/calendar-54',
            },
            {
              title: '日历视图 55 · 日晷月历',
              url: '/supcal/calendar-55',
            },
            {
              title: '日历视图 56 · 电影胶片',
              url: '/supcal/calendar-56',
            },
            {
              title: '日历视图 57 · 蓝图月历',
              url: '/supcal/calendar-57',
            },
            {
              title: '日历视图 58 · 植物花园',
              url: '/supcal/calendar-58',
            },
            {
              title: '日历视图 59 · 太空月历',
              url: '/supcal/calendar-59',
            },
            {
              title: '日历视图 60 · 蓝图方格',
              url: '/supcal/calendar-60',
            },
            {
              title: '日历视图 61 · 瀑布流',
              url: '/supcal/calendar-61',
            },
            {
              title: '日历视图 62 · 杂志封面',
              url: '/supcal/calendar-62',
            },
            {
              title: '日历视图 63 · 音波月历',
              url: '/supcal/calendar-63',
            },
            {
              title: '日历视图 64 · 金字塔',
              url: '/supcal/calendar-64',
            },
            {
              title: '日历视图 65 · 拼图月历',
              url: '/supcal/calendar-65',
            },
            {
              title: '日历视图 66 · 螺旋月历',
              url: '/supcal/calendar-66',
            },
            {
              title: '日历视图 67 · 日历邮票',
              url: '/supcal/calendar-67',
            },
            {
              title: '日历视图 68 · 仪表条',
              url: '/supcal/calendar-68',
            },
            {
              title: '日历视图 69 · 蜂巢月历',
              url: '/supcal/calendar-69',
            },
            {
              title: '日历视图 70 · 弹幕月历',
              url: '/supcal/calendar-70',
            },
            {
              title: '日历视图 71 · 柱状图月历',
              url: '/supcal/calendar-71',
            },
            {
              title: '日历视图 72 · 转盘月历',
              url: '/supcal/calendar-72',
            },
            {
              title: '日历视图 73 · 树形月历',
              url: '/supcal/calendar-73',
            },
            {
              title: '日历视图 74 · 层叠卡片',
              url: '/supcal/calendar-74',
            },
            {
              title: '日历视图 75 · 信号强度',
              url: '/supcal/calendar-75',
            },
            {
              title: '日历视图 76 · 黑板月历',
              url: '/supcal/calendar-76',
            },
            {
              title: '日历视图 77 · 霓虹灯月历',
              url: '/supcal/calendar-77',
            },
            {
              title: '日历视图 78 · 折纸月历',
              url: '/supcal/calendar-78',
            },
            {
              title: '日历视图 79 · 密码锁月历',
              url: '/supcal/calendar-79',
            },
            {
              title: '日历视图 80 · 水墨月历',
              url: '/supcal/calendar-80',
            },
            {
              title: '日历视图 81 · 像素月历',
              url: '/supcal/calendar-81',
            },
            {
              title: '日历视图 82 · 名片月历',
              url: '/supcal/calendar-82',
            },
            {
              title: '日历视图 83 · 交通地图',
              url: '/supcal/calendar-83',
            },
            {
              title: '日历视图 84 · 气泡浮窗',
              url: '/supcal/calendar-84',
            },
            {
              title: '日历视图 85 · 药丸月历',
              url: '/supcal/calendar-85',
            },
            {
              title: '日历视图 86 · 旗帜月历',
              url: '/supcal/calendar-86',
            },
            {
              title: '日历视图 87 · 日历卷轴',
              url: '/supcal/calendar-87',
            },
            {
              title: '日历视图 88 · 电池电量',
              url: '/supcal/calendar-88',
            },
            {
              title: '日历视图 89 · 织布月历',
              url: '/supcal/calendar-89',
            },
            {
              title: '日历视图 90 · 玻璃态月历',
              url: '/supcal/calendar-90',
            },
            {
              title: '日历视图 91 · 邮筒月历',
              url: '/supcal/calendar-91',
            },
            {
              title: '日历视图 92 · 星星月历',
              url: '/supcal/calendar-92',
            },
            {
              title: '日历视图 93 · 调色板月历',
              url: '/supcal/calendar-93',
            },
            {
              title: '日历视图 94 · 棱镜月历',
              url: '/supcal/calendar-94',
            },
            {
              title: '日历视图 95 · 管道月历',
              url: '/supcal/calendar-95',
            },
            {
              title: '日历视图 96 · 海洋月历',
              url: '/supcal/calendar-96',
            },
            {
              title: '日历视图 97 · 消防月历',
              url: '/supcal/calendar-97',
            },
            {
              title: '日历视图 98 · 树木年轮',
              url: '/supcal/calendar-98',
            },
            {
              title: '日历视图 99 · 像素艺术',
              url: '/supcal/calendar-99',
            },
            {
              title: '日历视图 100 · 渐变流月历',
              url: '/supcal/calendar-100',
            },
            {
              title: '日历视图 101 · 面包屑月历',
              url: '/supcal/calendar-101',
            },
            {
              title: '日历视图 102 · 代码终端',
              url: '/supcal/calendar-102',
            },
            {
              title: '日历视图 103 · 唱片月历',
              url: '/supcal/calendar-103',
            },
            {
              title: '日历视图 104 · 条纹月历',
              url: '/supcal/calendar-104',
            },
            {
              title: '日历视图 105 · 雷达月历',
              url: '/supcal/calendar-105',
            },
            {
              title: '日历视图 106 · 抽屉月历',
              url: '/supcal/calendar-106',
            },
            {
              title: '日历视图 107 · 拼贴月历',
              url: '/supcal/calendar-107',
            },
            {
              title: '日历视图 108 · 电梯楼层',
              url: '/supcal/calendar-108',
            },
            {
              title: '日历视图 109 · 金字塔进度',
              url: '/supcal/calendar-109',
            },
            {
              title: '日历视图 110 · 多米诺骨牌',
              url: '/supcal/calendar-110',
            },
            {
              title: '日历视图 111 · 护照月历',
              url: '/supcal/calendar-111',
            },
            {
              title: '日历视图 112 · 流光溢彩',
              url: '/supcal/calendar-112',
            },
            {
              title: '日历视图 113 · 积木月历',
              url: '/supcal/calendar-113',
            },
            {
              title: '日历视图 114 · 分子结构',
              url: '/supcal/calendar-114',
            },
            {
              title: '日历视图 115 · 沙漠月历',
              url: '/supcal/calendar-115',
            },
            {
              title: '日历视图 116 · 月光月历',
              url: '/supcal/calendar-116',
            },
            {
              title: '日历视图 117 · 花瓣月历',
              url: '/supcal/calendar-117',
            },
            {
              title: '日历视图 118 · 键盘月历',
              url: '/supcal/calendar-118',
            },
            {
              title: '日历视图 119 · 森林月历',
              url: '/supcal/calendar-119',
            },
            {
              title: '日历视图 120 · 冰晶月历',
              url: '/supcal/calendar-120',
            },
            {
              title: '日历视图 121 · 烟花月历',
              url: '/supcal/calendar-121',
            },
            {
              title: '日历视图 122 · 拼字游戏',
              url: '/supcal/calendar-122',
            },
            {
              title: '日历视图 123 · 彩虹月历',
              url: '/supcal/calendar-123',
            },
            {
              title: '日历视图 124 · 砖墙月历',
              url: '/supcal/calendar-124',
            },
            {
              title: '日历视图 125 · 音符月历',
              url: '/supcal/calendar-125',
            },
            {
              title: '日历视图 126 · 帆布月历',
              url: '/supcal/calendar-126',
            },
            {
              title: '日历视图 127 · 电路板V2',
              url: '/supcal/calendar-127',
            },
            {
              title: '日历视图 128 · 瀑布线图',
              url: '/supcal/calendar-128',
            },
            {
              title: '日历视图 129 · 万花筒',
              url: '/supcal/calendar-129',
            },
            {
              title: '日历视图 130 · 灯塔月历',
              url: '/supcal/calendar-130',
            },
            {
              title: '日历视图 131 · 齿轮月历',
              url: '/supcal/calendar-131',
            },
            {
              title: '日历视图 132 · 折扇月历',
              url: '/supcal/calendar-132',
            },
            {
              title: '日历视图 133 · 星座月历',
              url: '/supcal/calendar-133',
            },
            {
              title: '日历视图 134 · 提花月历',
              url: '/supcal/calendar-134',
            },
            {
              title: '日历视图 135 · 钻石月历',
              url: '/supcal/calendar-135',
            }
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
