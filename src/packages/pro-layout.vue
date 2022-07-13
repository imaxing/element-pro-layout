<script>
// 检测屏幕大小是否为手机端尺寸
const isMobileMixin = {
  data: () => ({ mobile: false }),
  created() {
    const checkIsMobile = () => {
      if (document.hidden) return
      const rect = document.body.getBoundingClientRect()
      this.mobile = rect.width - 1 < 992
      this.$emit('is-mobile-change', this.mobile)
      this.$emit('update:collapsed', this.mobile ? false : true)
    }
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('resize', checkIsMobile)
    })
  }
}

// submenu bug fixed
const FixiOSBug = {
  mounted() {
    this.$nextTick(() => {
      const $subMenu = this.$refs.subMenu
      if ($subMenu) {
        const handleMouseleave = $subMenu.handleMouseleave
        $subMenu.handleMouseleave = e => {
          if (this.mobile) return
          handleMouseleave(e)
        }
      }
    })
  }
}

// props
const LayoutProps = {
  props: {
    title: { type: String, default: 'Pro Layout' },
    logo: { type: String, default: null },
    menuPathField: { type: String, default: 'path' },
    menus: { type: Array, default: () => [], required: true },
    loading: { type: Boolean, default: false },
    rightIcons: { type: Array, default: () => [] },
    topIcons: { type: Array, default: () => [] },
    collapsed: { type: Boolean, default: false },
    router: { type: Boolean, default: false },
    uniqueOpened: { type: Boolean, default: true },
    menuActive: { type: String, default: '/' },
    menuActiveText: { type: String, default: '#fafafa' },
    theme: { type: String, default: '#409eff', validator: v => !!v && v.startsWith('#') },
    themeReverse: { type: String, default: '#ffffff', validator: v => !!v && v.startsWith('#') },
    sideBarWidth: { type: String, default: '210px' },
    contentTransition: { type: String, default: '' },
    renderContent: { type: Function, default: null },
    renderHeaderBottom: { type: Function, default: null },
    renderHeaderCenter: { type: Function, default: null },
    renderHeaderLeft: { type: Function, default: null },
    renderHeaderRight: { type: Function, default: null },
    renderCollapseButton: { type: Function, default: null },
    renderSidebarHeader: { type: Function, default: null }
  }
}

export default {
  name: 'ProLayout',
  mixins: [LayoutProps, isMobileMixin, FixiOSBug],
  render(h) {
    const {
      contentTransition,
      renderContent,
      uniqueOpened,
      collapsed,
      sideBarWidth,
      router,
      rightIcons,
      topIcons,
      menuActiveText,
      mobile,
      logo,
      menuPathField,
      $slots,
      theme,
      themeReverse,
      menus,
      loading,
      menuActive,
      title,
      renderHeaderBottom,
      renderHeaderLeft,
      renderHeaderCenter,
      renderSidebarHeader,
      renderHeaderRight,
      renderCollapseButton
    } = this

    const renderIconContainer = ({
      icon = '',
      title = '',
      count = 0,
      render,
      dropdownOptions,
      popperOptions,
      onClick = () => {}
    }) => {
      const Icon = render ? render(h) : h('i', { class: icon })
      const WithBadge = count !== void 0 && count > 0 ? h('el-badge', { props: { value: count } }, [Icon]) : Icon
      const WithTooltip = title ? h('el-tooltip', { props: { content: title } }, [WithBadge]) : WithBadge
      const IconContainer = h('div', { class: 'icon-container', on: { click: onClick } }, [WithTooltip])

      if (dropdownOptions) {
        const { data, onCommand, width, trigger = 'click', transition = 'el-zoom-in-top' } = dropdownOptions
        const handleCommand = v => {
          const { callback, ...rest } = data.find(item => [item.command, item.value].includes(v)) || {}
          callback && callback(rest)
          onCommand && onCommand(v)
        }
        return h(
          'el-dropdown',
          {
            style: { color: themeReverse },
            props: { width, transition, trigger },
            on: { command: handleCommand }
          },
          [
            h(
              'el-dropdown-menu',
              { slot: 'dropdown' },
              data
                .filter(o => !('condition' in o) || o.condition)
                .map(({ command, value, label, ...rest }) =>
                  h('el-dropdown-item', { props: { ...rest, command: command || value } }, label)
                )
            ),
            IconContainer
          ]
        )
      }
      if (popperOptions) {
        const { reference = () => IconContainer, children, ...rest } = popperOptions
        return h('el-popover', { props: rest, scopedSlots: { reference } }, [
          typeof children === 'function' ? children(h) : children
        ])
      }
      return IconContainer
    }

    // logo
    const Logo = h('img', { class: 'sidebar-logo', attrs: { src: logo, alt: title } })
    const SideBarHeader = h(
      'div',
      {
        class: 'sidebar-logo-container',
        style: { background: theme },
        on: { click: () => this.$emit('logo-click') }
      },
      renderSidebarHeader
        ? renderSidebarHeader(h)
        : [logo && Logo, h('span', { class: 'sidebar-title' }, collapsed ? title : logo || title.substr(0, 1))]
    )

    const renderMenuItems = (menu, index) => {
      return menu.children ? (
        <el-submenu ref='subMenu' index={menu[menuPathField]} key={index}>
          <template slot='title'>
            <i class={menu.icon || menu.meta.icon} />
            <span slot='title'>{menu.name || menu.title || menu.meta.title}</span>
          </template>
          {menu.children && menu.children.map(renderMenuItems)}
        </el-submenu>
      ) : (
        <el-menu-item index={menu[menuPathField]} key={index} route={menu}>
          <i class={menu.icon || menu.meta.icon} />
          <span slot='title'>{menu.name || menu.title || menu.meta.title}</span>
        </el-menu-item>
      )
    }

    const SideBar = h('div', { class: { sidebar: true, loading }, style: { background: theme, width: sideBarWidth } }, [
      SideBarHeader,
      h('el-scrollbar', [
        loading ? (
          h('i', { class: 'el-icon-loading' })
        ) : (
          <el-menu
            mode='vertical'
            unique-opened={uniqueOpened}
            default-active={menuActive}
            text-color={themeReverse}
            background-color={theme}
            active-text-color={menuActiveText}
            collapse={!collapsed}
            router={router}
            onSelect={(index, indexPath) => this.$emit('menu-click', index, indexPath)}
          >
            {menus.map(renderMenuItems)}
          </el-menu>
        )
      ])
    ])

    const Header = h('div', { class: 'header', style: { background: theme, width: `calc(100% - ${sideBarWidth})` } }, [
      h('div', { class: 'header-left' }, [
        renderIconContainer({
          render: renderCollapseButton,
          title: collapsed ? '收起' : '展开',
          icon: collapsed ? 'el-icon-s-fold toggle-button' : 'el-icon-s-unfold toggle-button',
          onClick: () => {
            this.$emit('update:collapsed', !collapsed)
            this.$emit('collapse', !collapsed)
          }
        }),
        topIcons && topIcons.length > 0 && topIcons.map(renderIconContainer),
        renderHeaderLeft && renderHeaderLeft(h)
      ]),
      renderHeaderCenter && h('div', { class: 'header-center' }, [renderHeaderCenter(h)]),
      h('div', { class: 'header-right' }, [
        renderHeaderRight && h('div', { class: 'hide-is-mobile' }, [renderHeaderRight(h)]),
        rightIcons && rightIcons.length > 0 && rightIcons.map(renderIconContainer)
      ]),
      renderHeaderBottom && h('div', { class: 'header-bottom' }, [renderHeaderBottom(h)])
    ])

    const Content = h('div', { class: 'main', style: { marginLeft: collapsed ? sideBarWidth : '54px' } }, [
      Header,
      h('transition', { props: { name: contentTransition } }, [
        h(
          'div',
          { class: { 'main-content': true, 'has-header--bottom': renderHeaderBottom && renderHeaderBottom(h) } },
          [renderContent ? renderContent(h) : $slots.default]
        )
      ])
    ])
    return h(
      'div',
      { style: { color: themeReverse }, class: { mobile, 'hide-sidebar': !collapsed, 'pro-layout': true } },
      [SideBar, Content]
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
    // width: calc(#{$headerHeight} / 1.2);
    padding: 0 10px;
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
    &.loading {
      .el-scrollbar__view {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
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
        margin-left: 8px;
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
