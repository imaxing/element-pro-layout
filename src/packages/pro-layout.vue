<script>
import debounce from 'lodash.debounce'
import modifyTheme from '@iamgx/element-ui-theme-set'
import Fullscreen from '@iamgx/fullscreen'
const defaultAvatar = 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'

// 检测屏幕大小是否为手机端尺寸
const isMobileMixin = {
  data: () => ({ mobile: false }),
  mounted() {
    this.checkIsMobile = debounce(this.checkIsMobile, 300)
    window.addEventListener('resize', this.checkIsMobile)
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('resize', this.checkIsMobile)
    })
  },
  methods: {
    checkIsMobile() {
      if (document.hidden) return
      const rect = document.body.getBoundingClientRect()
      this.mobile = rect.width - 1 < 992
    }
  }
}

// submenu bug fixed
const FixiOSBug = {
  mixins: [isMobileMixin],
  mounted() {
    // In order to fix the click on menu on the ios device will trigger the mouseleave bug
    // https://github.com/PanJiaChen/vue-element-admin/issues/1135
    this.fixBugIniOS()
  },
  methods: {
    fixBugIniOS() {
      const $subMenu = this.$refs.subMenu
      if ($subMenu) {
        const handleMouseleave = $subMenu.handleMouseleave
        $subMenu.handleMouseleave = e => {
          if (this.mobile) return
          handleMouseleave(e)
        }
      }
    }
  }
}

// props
const LayoutProps = {
  props: {
    title: { type: String, default: 'Pro Layout', required: false },
    logo: { type: String, default: null, required: false },
    menus: { type: Array, default: () => [], required: true },
    collapsed: { type: Boolean, default: false, required: false },
    isMobile: { type: Boolean, default: false, required: false },
    notice: { type: Boolean, default: true, required: false },
    fullscreen: { type: Boolean, default: true, required: false },
    menuActive: { type: String, default: '/', required: false },
    userName: { type: String, default: null, required: false },
    avatar: { type: String, default: defaultAvatar, required: false },
    menuBackgroundColor: { type: String, default: '#20222a', required: false },
    menuTextColor: { type: String, default: '#bfcbd9', required: false },
    menuActiveText: { type: String, default: '#409eff', required: false },
    theme: { type: String, default: null, required: false },
    cssVariableName: { type: String, default: '--primary-theme', required: false }
  }
}

// watch
const WatchMixin = {
  mounted() {
    const unWatchMobile = this.$watch(
      'mobile',
      value => {
        this.$emit('update:collapsed', !value)
        this.$emit('update:is-mobile', value)
      },
      { immediate: true }
    )
    const unWatchTheme = this.$watch(
      'theme',
      v =>
        modifyTheme({
          theme: v,
          themeName: this.cssVariableName
        }),
      { immediate: true }
    )

    this.$once('hook:beforeDestroy', () => {
      unWatchTheme()
      unWatchMobile()
    })
  }
}

export default {
  name: 'ProLayout',
  mixins: [LayoutProps, isMobileMixin, FixiOSBug, WatchMixin],
  render(h) {
    const {
      mobile,
      $slots,
      theme,
      fullscreen,
      notice,
      avatar,
      userName,
      collapsed,
      $scopedSlots,
      logo,
      menus,
      title
    } = this

    const ToggleButton = h(
      'div',
      {
        class: 'icon-container toggle-button',
        on: {
          click: () => {
            this.$emit('update:collapsed', !collapsed)
            this.$emit('collapse', !collapsed)
          }
        }
      },
      [h('i', { class: collapsed ? 'el-icon-s-fold' : 'el-icon-s-unfold' })]
    )

    const ColorPicker = h('div', { class: 'icon-container' }, [
      h('el-tooltip', { props: { content: '换色' } }, [
        h('el-color-picker', {
          props: { value: theme },
          on: { change: theme => this.$emit('update:theme', theme) }
        })
      ])
    ])

    const FullscreenIcon = h('div', { class: 'icon-container', on: { click: Fullscreen.toggle } }, [
      h('el-tooltip', { props: { content: !this.state ? '全屏' : '退出全屏' } }, [
        h('i', { class: 'el-icon-full-screen' })
      ])
    ])

    const Feedback = h('div', { class: 'icon-container' }, [
      h('el-tooltip', { props: { content: '反馈' } }, [h('i', { class: 'el-icon-chat-line-square' })])
    ])

    const Notice = h(
      'el-popover',
      {
        props: { width: 300, transition: 'el-zoom-in-top' },
        scopedSlots: {
          reference: () =>
            h('div', { class: 'icon-container' }, [
              h('el-tooltip', { props: { content: '通知' } }, [h('i', { class: 'el-icon-bell' })])
            ])
        }
      },
      [$scopedSlots.notice || h('el-empty', { props: { description: '暂无通知' } })]
    )

    const User = h(
      'el-popover',
      {
        props: { width: 100, transition: 'el-zoom-in-top' },
        scopedSlots: {
          reference: () =>
            h(
              'div',
              { class: 'icon-container' },
              avatar
                ? [h('img', { class: 'user-avatar', attrs: { src: avatar } })]
                : [userName, h('i', { class: 'el-icon-arrow-down' })]
            )
        }
      },
      [h('p', '首页'), h('p', '个人中心'), h('p', { props: { divided: true } }, '退出登录')]
    )

    // logo
    const SideBarLogo = h('a', { class: 'sidebar-logo-container', attrs: { href: '/' } }, [
      collapsed
        ? h('span', { class: 'sidebar-title' }, title)
        : logo
        ? h('img', { class: 'sidebar-logo', attrs: { src: logo, alt: title } })
        : h('span', { class: 'sidebar-title' }, title.substr(0, 1))
    ])

    const Menu = (
      <el-menu
        mode='vertical'
        unique-opened
        default-active={this.menuActive}
        text-color={this.menuTextColor}
        background-color={this.menuBackgroundColor}
        active-text-color={this.menuActiveText}
        collapse={!collapsed}
      >
        {menus
          .filter(menu => !menu.hidden)
          .map((menu, index) =>
            menu.children ? (
              <el-submenu ref='subMenu' index={menu.path} key={index}>
                <template slot='title'>
                  <i class={menu.meta.icon} />
                  <span slot='title'>{menu.meta.title}</span>
                </template>
                {menu.children.map(sMenu => (
                  <el-menu-item key={sMenu.path + index} index={sMenu.path}>
                    <i class={sMenu.meta.icon} />
                    {sMenu.meta.title}
                  </el-menu-item>
                ))}
              </el-submenu>
            ) : (
              <el-menu-item index={menu.path} key={index}>
                <i class={menu.meta.icon} />
                <span slot='title'>{menu.meta.title}</span>
              </el-menu-item>
            )
          )}
      </el-menu>
    )

    // layout
    return h('div', { class: { mobile, 'hide-sidebar': !collapsed, 'pro-layout': true } }, [
      // sidebar
      h('div', { class: 'sidebar' }, [$scopedSlots.menuHeaderRender || SideBarLogo, h('el-scrollbar', [Menu])]),
      // main
      h('div', { class: 'main' }, [
        // header
        h(
          'div',
          { class: 'header' },
          $scopedSlots.headerRender || [
            ToggleButton,
            h('div', { class: 'header-right' }, [
              $scopedSlots.rightContentRender,
              Feedback,
              notice && Notice,
              theme && ColorPicker,
              fullscreen && FullscreenIcon,
              User
            ])
          ]
        ),
        // content
        h('transition', { props: { name: 'fade-transform', mode: 'out-in' } }, [
          h('div', { class: 'main-content' }, [$slots.default])
        ])
      ])
    ])
  }
}
</script>

<style lang="scss">
$subMenuActiveText: #f4f4f5;

$menuBg: #20222a;
$menuHover: #263445;

$subMenuBg: #1f2d3d;
$subMenuHover: #001528;
$headerHeight: 60px;
$sideBarWidth: 210px;
$sideBarHideWidth: 54px;

.pro-layout {
  position: relative;
  height: 100%;
  width: 100%;

  .icon-container {
    height: $headerHeight;
    width: calc(#{$headerHeight} / 1.3);
    float: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;

    &.toggle-button {
      width: $headerHeight;
      min-width: $headerHeight;
      &:hover {
        background: rgba(0, 0, 0, 0.025);
      }
    }
  }

  .sidebar {
    transition: width 0.28s;
    width: $sideBarWidth !important;
    background-color: $menuBg;
    height: 100%;
    position: fixed;
    font-size: 0px;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 1001;
    overflow: hidden;
    .sidebar-logo-container {
      position: relative;
      width: 100%;
      height: 64px;
      line-height: 64px;
      background: #20222a;
      text-align: center;
      display: inline-block;
      overflow: hidden;

      .sidebar-logo {
        width: 32px;
        height: 32px;
        vertical-align: middle;
        &.un-collapsed {
          margin-right: 0px;
        }
      }

      .sidebar-title {
        display: inline-block;
        margin: 0;
        color: #fff;
        font-weight: 400;
        line-height: 50px;
        font-size: 20px;
        font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
        vertical-align: middle;
        font-size: 20px;
        color: #fff;
      }
    }
    .el-scrollbar {
      height: calc(100% - 50px);
    }
  }

  .main {
    min-height: 100%;
    transition: margin-left 0.28s;
    margin-left: $sideBarWidth;
    position: relative;

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #fff;
      transition: width 0.28s;
      box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
      position: fixed;
      top: 0;
      right: 0;
      z-index: 9;
      width: calc(100% - #{$sideBarWidth});

      .header-right {
        flex-grow: 1;
        height: $headerHeight;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 0 10px 0 0;
        .user-avatar {
          width: 30px;
          height: 30px;
          object-fit: contain;
          margin-right: 4px;
        }
      }
    }

    .main-content {
      padding: 15px;
      transform: translateY($headerHeight);
    }
  }

  &.hide-sidebar {
    .header {
      width: calc(100% - #{$sideBarHideWidth}) !important;
    }
    .sidebar {
      width: $sideBarHideWidth !important;

      .el-menu-item,
      .el-menu-item > .el-tooltip,
      .el-submenu__title {
        padding: 0 !important;
        text-align: center;
      }
    }
    .main {
      margin-left: $sideBarHideWidth;
    }
  }

  .sidebar {
    .horizontal-collapse-transition {
      transition: 0s width ease-in-out, 0s padding-left ease-in-out, 0s padding-right ease-in-out;
    }

    .el-menu-item {
      &:hover {
        background-color: $menuHover !important;
      }
    }
    &::-webkit-scrollbar-track-piece {
      background: #d3dce6;
    }

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #99a9bf;
      border-radius: 20px;
    }

    .el-menu--collapse .el-menu .el-submenu {
      min-width: $sideBarWidth !important;
    }

    .scrollbar-wrapper {
      overflow-x: hidden !important;
    }

    .el-scrollbar__bar.is-vertical {
      right: 0px;
    }

    .el-scrollbar {
      height: 100%;
    }

    .is-horizontal {
      display: none;
    }

    .el-menu {
      border: none;
      height: 100%;
      width: 100% !important;
    }

    // // menu hover
    .el-submenu__title {
      &:hover {
        background-color: $menuHover !important;
      }
    }

    & .nest-menu .el-submenu > .el-submenu__title,
    & .el-submenu .el-menu-item {
      min-width: $sideBarWidth !important;
      background-color: $subMenuBg !important;

      &:hover {
        background-color: $subMenuHover !important;
      }
    }
  }
}
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.5s;
}

.fade-transform-enter {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
