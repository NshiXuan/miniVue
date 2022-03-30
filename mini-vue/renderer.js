const h = (tag, props, children) => {
  // vnode -> JavaScript对象 -> {}
  return {
    tag,
    props,
    children
  }
}

const mount = (vnode, container) => {
  // vnode -> element
  // 1.创建出真实的原生，并且在vnode上保留el
  const el = vnode.el = document.createElement(vnode.tag)
  // console.log(el);

  // 2.处理props
  if (vnode.props) {
    for (const key in vnode.props) {
      const value = vnode.props[key]
      if (key.startsWith('on')) {
        // 绑定事件
        el.addEventListener(key.slice(2).toLocaleLowerCase(), value)
      } else {
        // 设置class、id等类型
        el.setAttribute(key, value)
      }
    }
  }

  // 3.处理children
  if (vnode.children) {
    if (typeof vnode.children === "string") {
      // 如果是文字，添加文本内容
      el.textContent = vnode.children
    } else {
      // 如果是数组，遍历递归
      vnode.children.forEach(item => {
        mount(item, el)
      });
    }
  }

  // 4.将el挂载到container上
  container.appendChild(el)
}

const patch = (n1, n2) => {
  if (n1.tag !== n2.tag) {
    const n1ElParent = n1.el.parentElement
    n1ElParent.removeChild(n1.el)
    mount(n2, n1ElParent)
  } else {
    // 1.取出element对象，并且在n2中进行保存
    const el = n2.el = n1.el

    // 2.处理props
    const oldProps = n1.props || {}
    const newProps = n2.props || {}
    // 2.1获取所有的newProps添加到el
    for (const key in newProps) {
      const oldValue = oldProps[key]
      const newValue = newProps[key]
      if (newValue !== oldValue) {
        if (key.startsWith('on')) {
          el.addEventListener(key.slice(2).toLocaleLowerCase(), newValue)
        } else {
          el.setAttribute(key, newValue)
        }
      }
    }

    // 2.2删除旧的props
    for (const key in oldProps) {
      // 如果我们的newProps中没有这个属性就删除
      if (key.startsWith('on')) {
        const value = oldProps[key]
        el.removeEventListener(key.slice(2).toLocaleLowerCase(), value)
      }
      if (!(key in newProps)) {
        el.removeAttribute(key)
      }
    }

    // 3.处理children
    const oldChildren = n1.children || []
    const newChildren = n2.children || []

    // 3.1 newChildren是一个字符串
    if (typeof newChildren === 'string') {
      // 边界情况 edge case
      if (typeof oldChildren === 'string') {
        if (newChildren !== oldChildren) {
          el.innerHTML = newChildren
        }
      } else {
        el.innerHTML = newChildren
      }
    } else {
      // 3.2 newChildren是一个数组
      if (typeof oldChildren === 'string') {
        el.innerHTML = ''
        newChildren.forEach(item => {
          mount(item, el)
        })
      } else {
        // oldChildren:[v1,v2,v3]
        // newChildren:[v1,v5,v6,v8,v9]
        // 3.2.1 前面有相同节点的原生进行patch操作
        const commonLength = Math.min(oldChildren.length, newChildren.length)
        for (let i = 0; i < commonLength; i++) {
          patch(oldChildren[i], newChildren[i])
        }

        // 3.2.2 newChildren > oldChildren
        if (newChildren.length > oldChildren.length) {
          newChildren.slice(oldChildren.length).forEach(item => {
            mount(item, el)
          })
        }

        // 3.2.3 newChildren.length < oldChildren
        if (newChildren.length < oldChildren.length) {
          oldChildren.slice(newChildren.length).forEach(item => {
            el.removeChild(item.el)
          })
        }
      }
    }

  }
}