<script>
import debounce from 'lodash.debounce'
import modifyTheme from '@iamgx/element-ui-theme-set'
import Fullscreen from '@iamgx/fullscreen'
import loadStyle from '@iamgx/load-style'
import colorReverse from '@iamgx/color-reverse'
const { toggle } = Fullscreen

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
    topMenus: { type: Array, default: () => [], required: false },
    languages: { type: Array, default: () => [], required: false },
    rightIcons: { type: Array, default: () => [], required: false },
    userOpts: { type: Array, default: () => [{ label: '首页', value: '/' }], required: false },
    collapsed: { type: Boolean, default: false, required: false },
    isMobile: { type: Boolean, default: false, required: false },
    fullscreen: { type: Boolean, default: true, required: false },
    uniqueOpened: { type: Boolean, default: true, required: false },
    feedback: { type: Boolean, default: false, required: false },
    menuActive: { type: String, default: '/', required: false },
    userName: { type: String, default: null, required: false },
    avatar: { type: String, default: null, required: false },
    elementUiCdn: { type: String, default: undefined, required: false },
    menuActiveText: { type: String, default: '#fafafa', required: false },
    theme: { type: String, default: '#409eff', required: false, validator: theme => !!theme && theme.startsWith('#') },
    cssVariableName: { type: String, default: '--primary-theme', required: false },
    renderContent: { type: Function, default: null, required: false },
    contentTransition: { type: String, default: '', required: false },
    sideBarWidth: { type: String, default: '210px', required: false },
    renderHeaderBottom: { type: Function, default: null, required: false },
    renderHeaderCenter: { type: Function, default: null, required: false },
    renderHeaderLeft: { type: Function, default: null, required: false },
    renderHeaderRight: { type: Function, default: null, required: false },
    renderMenuHeader: { type: Function, default: null, required: false },
    router: { type: Boolean, default: false, required: false }
  }
}

// watch
const WatchMixin = {
  mounted() {
    loadStyle('https://at.alicdn.com/t/font_3206016_nq7r8gbdo8s.css')

    const unWatchMobile = this.$watch(
      'mobile',
      value => {
        this.$emit('update:collapsed', value ? false : true)
        this.$emit('update:is-mobile', value)
      },
      { immediate: true }
    )
    const unWatchTheme = this.$watch(
      'theme',
      v => {
        if (!v) return
        modifyTheme({
          theme: v,
          elementUiCdn: this.elementUiCdn,
          themeName: this.cssVariableName
        })
      },
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
      contentTransition,
      renderContent,
      uniqueOpened,
      fullscreen,
      languages,
      collapsed,
      sideBarWidth,
      router,
      feedback,
      topMenus,
      userName,
      userOpts,
      rightIcons,
      menuActiveText,
      avatar,
      mobile,
      theme,
      menus,
      title,
      renderHeaderBottom,
      renderHeaderLeft,
      renderHeaderCenter,
      renderMenuHeader,
      renderHeaderRight,
      logo,
      $slots
    } = this

    const themeReverse = colorReverse(theme)

    const renderDropDown = ({ data = [], title, children, onCommand }) => {
      return h(
        'el-dropdown',
        {
          attrs: { title },
          style: { color: themeReverse },
          props: { width: 150, transition: 'el-zoom-in-top', trigger: 'click' },
          on: {
            command: v => {
              const item = data.find(item => item.label === v || item.value === v) || {}
              item.callback && item.callback(item)
              onCommand && onCommand(v)
            }
          }
        },
        [
          h(
            'el-dropdown-menu',
            { slot: 'dropdown' },
            data.map(item =>
              h('el-dropdown-item', { props: { ...item, command: item.value || item.label } }, item.label)
            )
          ),
          children
        ]
      )
    }

    const renderIconContainer = ({
      className = '',
      condition = true,
      children = null,
      icon = '',
      title,
      count = 0,
      render,
      popperProps = {},
      popperChildren,
      onClick = () => {}
    }) => {
      if (!condition) return null
      const content = render ? render(h) : children || h('i', { class: icon })
      const IconEl = h(
        'div',
        {
          attrs: { title },
          class: `icon-container ${className}`,
          on: { click: onClick }
        },
        [count ? h('el-badge', { props: { value: count } }, [content]) : content]
      )
      return popperChildren
        ? h('el-popover', { props: popperProps, scopedSlots: { reference: () => IconEl } }, [
            typeof popperChildren === 'function' ? popperChildren(h) : popperChildren
          ])
        : IconEl
    }

    const ToggleButton = renderIconContainer({
      title: collapsed ? '收起' : '展开',
      icon: 'iconfont icon-menu',
      className: `toggle-button ${collapsed ? 'collapsed' : ''}`,
      onClick: () => {
        this.$emit('update:collapsed', !collapsed)
        this.$emit('collapse', !collapsed)
      }
    })

    // 主题色
    const ColorPicker = renderIconContainer({
      title: '主题色',
      condition: theme,
      className: 'hide-is-mobile',
      children: h('el-color-picker', {
        props: { value: theme, size: 'mini' },
        on: {
          change: theme => {
            this.$emit('update:theme', theme)
            this.$emit('theme-change', theme)
          }
        }
      })
    })

    // 全屏
    const FullscreenIcon = renderIconContainer({
      title: '全屏',
      condition: fullscreen,
      className: 'hide-is-mobile',
      onClick: toggle,
      icon: 'el-icon-full-screen'
    })

    // 反馈
    const Feedback = renderIconContainer({
      title: '反馈',
      condition: feedback,
      className: 'hide-is-mobile',
      onClick: () => this.$emit('feedback'),
      icon: 'iconfont icon-feedback'
    })

    // 国际化
    const Language = renderIconContainer({
      title: '多语言',
      condition: languages && languages.length > 0,
      className: 'hide-is-mobile',
      children: renderDropDown({
        onCommand: v => this.$emit('language-change', v),
        data: languages,
        children: h('i', { class: 'iconfont icon-language' })
      })
    })

    // 用户中心
    const User = renderIconContainer({
      children: renderDropDown({
        onCommand: v => this.$emit('opt-change', v),
        data: userOpts,
        children: avatar
          ? h('img', { class: 'user-avatar', attrs: { src: avatar } })
          : [userName, h('i', { class: 'iconfont icon-2PersonalCenter_01' })]
      })
    })

    // logo
    const SideBarLogo = h(
      'div',
      {
        class: 'sidebar-logo-container',
        style: { background: theme },
        on: { click: () => this.$emit('logo-click') }
      },
      renderMenuHeader
        ? [renderMenuHeader(h, collapsed)]
        : [
            collapsed
              ? h('span', { class: 'sidebar-title' }, title)
              : logo
              ? h('img', { class: 'sidebar-logo', attrs: { src: logo, alt: title } })
              : h('span', { class: 'sidebar-title' }, title.substr(0, 1))
          ]
    )

    const Menu = (
      <el-menu
        mode='vertical'
        unique-opened={uniqueOpened}
        default-active={this.menuActive}
        text-color={themeReverse}
        background-color={theme}
        active-text-color={menuActiveText}
        collapse={!collapsed}
        router={router}
        onSelect={(index, indexPath) => {
          this.$emit('menu-click', index, indexPath)
        }}
      >
        {menus.map((menu, index) =>
          menu.children ? (
            <el-submenu ref='subMenu' index={menu.path} key={index}>
              <template slot='title'>
                <i class={menu.icon || menu.meta.icon} />
                <span slot='title'>{menu.name || menu.title || menu.meta.title}</span>
              </template>
              {menu.children.map(sMenu => (
                <el-menu-item key={sMenu.path + index} index={sMenu.path} route={sMenu}>
                  <i class={sMenu.icon || sMenu.meta.icon} />
                  {sMenu.name || sMenu.title || sMenu.meta.title}
                </el-menu-item>
              ))}
            </el-submenu>
          ) : (
            <el-menu-item index={menu.path} key={index} route={menu}>
              <i class={menu.icon || menu.meta.icon} />
              <span slot='title'>{menu.name || menu.title || menu.meta.title}</span>
            </el-menu-item>
          )
        )}
      </el-menu>
    )

    const TopMenu = topMenus.map((menu, index) => {
      return h(
        'div',
        {
          class: 'top-menu hide-is-mobile',
          on: {
            click: () => {
              this.$emit('top-menu-click', menu, index)
              // this.$emit('update:menu-active', '')
            }
          }
        },
        [h('i', { class: menu.icon }), menu.text]
      )
    })

    // layout
    return h(
      'div',
      { style: { color: themeReverse }, class: { mobile, 'hide-sidebar': !collapsed, 'pro-layout': true } },
      [
        // sidebar
        h('div', { class: 'sidebar', style: { background: theme, width: sideBarWidth } }, [
          SideBarLogo,
          h('el-scrollbar', [Menu])
        ]),
        // main
        h('div', { class: 'main', style: { marginLeft: collapsed ? sideBarWidth : '54px' } }, [
          // header
          h('div', { class: 'header', style: { background: theme, width: `calc(100% - ${sideBarWidth})` } }, [
            h('div', { class: 'header-left' }, [ToggleButton, TopMenu, renderHeaderLeft && renderHeaderLeft(h)]),
            renderHeaderCenter && h('div', { class: 'header-center' }, [renderHeaderCenter(h)]),
            h('div', { class: 'header-right' }, [
              renderHeaderRight && h('div', { class: 'hide-is-mobile' }, [renderHeaderRight(h)]),
              ColorPicker,
              FullscreenIcon,
              rightIcons && rightIcons.length > 0 && rightIcons.map(renderIconContainer),
              Feedback,
              Language,
              User
            ]),
            renderHeaderBottom && h('div', { class: 'header-bottom' }, [renderHeaderBottom(h)])
          ]),
          // content
          h('transition', { props: { name: contentTransition } }, [
            h(
              'div',
              { class: { 'main-content': true, 'has-header--bottom': renderHeaderBottom && renderHeaderBottom(h) } },
              [renderContent ? renderContent(h) : $slots.default]
            )
          ])
        ])
      ]
    )
  }
}
</script>

<style lang="scss">
$headerHeight: 60px;
$sideBarWidth: 210px;
$sideBarHideWidth: 54px;
$headerBottomHeight: 40px;

.pro-layout {
  position: relative;
  height: 100%;
  width: 100%;

  .icon-container {
    height: $headerHeight;
    width: calc(#{$headerHeight} / 1.2);
    float: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
    &.toggle-button {
      width: $headerHeight;
      min-width: $headerHeight;
      transition: transform ease-in-out 0.2s;
      &.collapsed i {
        transform: rotate(90deg);
      }
    }
  }

  .sidebar {
    transition: width 0.2s cubic-bezier(0.39, 0.58, 0.57, 1);
    height: 100vh;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 1001;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .sidebar-logo-container {
      position: relative;
      width: 100%;
      height: $headerHeight;
      line-height: $headerHeight;
      background: #20222a;
      text-align: center;
      display: inline-block;
      overflow: hidden;
      text-decoration: none;

      .sidebar-logo {
        width: 32px;
        height: 32px;
        max-width: 32px;
        max-height: 32px;
        vertical-align: middle;
        &.un-collapsed {
          margin-right: 0px;
        }
      }

      .sidebar-title {
        display: inline-block;
        margin: 0;
        font-weight: 400;
        line-height: 50px;
        font-size: 20px;
        font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
        vertical-align: middle;
        font-size: 20px;
      }
    }
    .el-scrollbar {
      height: calc(100% - #{$headerHeight});
      .el-scrollbar__view {
        height: 100%;
      }
    }
  }

  .main {
    min-height: 100%;
    transition: margin-left 0.2s cubic-bezier(0.39, 0.58, 0.57, 1);
    position: relative;

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #fff;
      transition: width 0.2s cubic-bezier(0.39, 0.58, 0.57, 1);
      box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
      position: fixed;
      top: 0;
      right: 0;
      z-index: 9;

      .header-center,
      .header-left,
      .header-right {
        display: flex;
        align-items: center;
        height: $headerHeight;
      }
      .header-center {
        flex-grow: 1;
      }
      .header-bottom {
        width: 100%;
        height: $headerBottomHeight;
        position: absolute;
        top: 100%;
        left: 0;
      }

      .top-menu {
        font-size: 14px;
        padding: 0 8px;
        height: $headerHeight;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
        i {
          margin-right: 4px;
        }
      }

      .user-avatar {
        width: 30px;
        height: 30px;
        object-fit: contain;
      }
    }

    .main-content {
      padding: 15px;
      transform: translateY($headerHeight);
      &.has-header--bottom {
        transform: translateY(#{$headerHeight + $headerBottomHeight});
      }
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

    // scroll-bar
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
    .scrollbar-wrapper {
      overflow-x: hidden !important;
    }
    .el-scrollbar__bar.is-vertical {
      right: 0px;
    }
    .is-horizontal {
      display: none;
    }
    // scroll-bar end

    // el-menu
    .el-menu {
      border: none;
      height: 100%;
      width: 100% !important;

      .nest-menu .el-submenu > .el-submenu__title,
      .el-submenu .el-menu-item {
        min-width: 100% !important;
      }
    }
    // el-menu end
  }
  .el-color-picker__trigger {
    border-color: currentColor;
  }
}

@media (max-width: 767px) {
  .hide-is-mobile {
    display: none !important;
  }
}
</style>
