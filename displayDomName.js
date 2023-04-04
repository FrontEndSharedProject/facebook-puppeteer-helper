(()=>{
    if(window.__REACT_DEVTOOLS_GLOBAL_HOOK__) return
    const emptyFn = () => {}
    const emptyMap = new Map()

    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
        rendererInterfaces: emptyMap,
        listeners: {},
        renderers: emptyMap,
        emit: emptyFn,
        getFiberRoots: emptyFn,
        inject: emptyFn,
        on: emptyFn,
        off: emptyFn,
        sub: emptyFn,
        supportsFiber: true,
        checkDCE: emptyFn,
        onCommitFiberUnmount: emptyFn,
        onCommitFiberRoot: emptyFn,
        onPostCommitFiberRoot(_, root) {
            traverse(root.current)
        },
        setStrictMode: emptyFn,
        getInternalModuleRanges: emptyFn,
        registerInternalModuleStart: emptyFn,
        registerInternalModuleStop: emptyFn
    }

    function traverse(node) {
        if (node.type && typeof node.type === "function" && node.type.displayName) {
            if (node.child && node.child.stateNode && node.child.stateNode.tagName) {
                const moduleName = node.type.displayName
                    .split("[from ")[1]
                    .slice(0, -1)
                    .replaceAll(".", "_")
                node.child.stateNode.classList.add(moduleName)
                node.child.stateNode.__props = node.memoizedProps
            }
        }
        if (node.child) {
            traverse(node.child)
        }
        node.sibling && traverse(node.sibling)
    }
})()
