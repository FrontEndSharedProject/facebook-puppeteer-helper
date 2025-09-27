import { throttle } from 'lodash-es';

(() => {
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log('⚠️ React DevTools Global Hook already exists, script will exit');
        return;
    }
    
    console.log('🚀 Initializing React DevTools Display Name Helper');
    
    // 更新的 ReactTypeOfWork 枚举，基于最新的 React DevTools
    const ReactTypeOfWork = {
        CacheComponent: 24,
        ClassComponent: 1,
        ContextConsumer: 9,
        ContextProvider: 10,
        CoroutineComponent: -1, // Removed
        CoroutineHandlerPhase: -1, // Removed
        DehydratedSuspenseComponent: 18,
        ForwardRef: 11,
        Fragment: 7,
        FunctionComponent: 0,
        HostComponent: 5,
        HostPortal: 4,
        HostRoot: 3,
        HostHoistable: 26, // React 18.2+
        HostSingleton: 27, // React 18.2+
        HostText: 6,
        IncompleteClassComponent: 17,
        IncompleteFunctionComponent: 28, // 新增
        IndeterminateComponent: 2,
        LazyComponent: 16,
        LegacyHiddenComponent: 23,
        MemoComponent: 14,
        Mode: 8,
        OffscreenComponent: 22,
        Profiler: 12,
        ScopeComponent: 21,
        SimpleMemoComponent: 15,
        SuspenseComponent: 13,
        SuspenseListComponent: 19,
        TracingMarkerComponent: 25,
        Throw: 29, // 新增
        ViewTransitionComponent: 30, // 新增
        ActivityComponent: 31, // 新增
        YieldComponent: -1 // Removed
    };
    const { 
        CacheComponent, 
        ClassComponent, 
        IncompleteClassComponent, 
        IncompleteFunctionComponent,
        FunctionComponent, 
        IndeterminateComponent, 
        ForwardRef, 
        HostRoot, 
        HostHoistable, 
        HostSingleton, 
        HostComponent, 
        HostPortal, 
        HostText, 
        Fragment, 
        LazyComponent, 
        LegacyHiddenComponent, 
        MemoComponent,
        Mode,
        OffscreenComponent, 
        Profiler, 
        ScopeComponent, 
        SimpleMemoComponent, 
        SuspenseComponent, 
        SuspenseListComponent, 
        TracingMarkerComponent,
        Throw,
        ViewTransitionComponent,
        ActivityComponent
    } = ReactTypeOfWork;
    function getTypeSymbol(type) {
        const symbolOrNumber = typeof type === "object" && type !== null ? type.$$typeof : type;
        return typeof symbolOrNumber === "symbol"
            ? // $FlowFixMe[incompatible-return] `toString()` doesn't match the type signature?
            symbolOrNumber.toString()
            : symbolOrNumber;
    }
    const NoFlags = /*                      */ 0b000000000000000000000000000;
    const PerformedWork = /*                */ 0b000000000000000000000000001;
    const Placement = /*                    */ 0b000000000000000000000000010;
    const DidCapture = /*                   */ 0b000000000000000000010000000;
    const Hydrating = /*                    */ 0b000000000000001000000000000;
    const MEMO_NUMBER = 0xead3;
    const MEMO_SYMBOL_STRING = "Symbol(react.memo)";
    const FORWARD_REF_NUMBER = 0xead0;
    const FORWARD_REF_SYMBOL_STRING = "Symbol(react.forward_ref)";
    const CONCURRENT_MODE_NUMBER = 0xeacf;
    const CONCURRENT_MODE_SYMBOL_STRING = "Symbol(react.concurrent_mode)";
    const DEPRECATED_ASYNC_MODE_SYMBOL_STRING = "Symbol(react.async_mode)";
    const PROVIDER_NUMBER = 0xeacd;
    const PROVIDER_SYMBOL_STRING = "Symbol(react.provider)";
    const CONTEXT_NUMBER = 0xeace;
    const CONTEXT_SYMBOL_STRING = "Symbol(react.context)";
    const SERVER_CONTEXT_SYMBOL_STRING = "Symbol(react.server_context)";
    const STRICT_MODE_NUMBER = 0xeacc;
    const STRICT_MODE_SYMBOL_STRING = "Symbol(react.strict_mode)";
    const PROFILER_NUMBER = 0xead2;
    const PROFILER_SYMBOL_STRING = "Symbol(react.profiler)";
    const SCOPE_NUMBER = 0xead7;
    const SCOPE_SYMBOL_STRING = "Symbol(react.scope)";
    function resolveFiberType(type) {
        const typeSymbol = getTypeSymbol(type);
        switch (typeSymbol) {
            case MEMO_NUMBER:
            case MEMO_SYMBOL_STRING:
                // recursively resolving memo type in case of memo(forwardRef(Component))
                return resolveFiberType(type.type);
            case FORWARD_REF_NUMBER:
            case FORWARD_REF_SYMBOL_STRING:
                return type.render;
            default:
                return type;
        }
    }
    const cachedDisplayNames = new WeakMap();
    function getDisplayName(type, fallbackName = "Anonymous") {
        const nameFromCache = cachedDisplayNames.get(type);
        if (nameFromCache != null) {
            return nameFromCache;
        }
        let displayName = fallbackName;
        // The displayName property is not guaranteed to be a string.
        // It's only safe to use for our purposes if it's a string.
        // github.com/facebook/react-devtools/issues/803
        if (typeof type.displayName === "string") {
            displayName = type.displayName;
        }
        else if (typeof type.name === "string" && type.name !== "") {
            displayName = type.name;
        }
        cachedDisplayNames.set(type, displayName);
        return displayName;
    }
    function getWrappedDisplayName(outerType, innerType, wrapperName, fallbackName) {
        const displayName = outerType.displayName;
        return (displayName ||
            `${wrapperName}(${getDisplayName(innerType, fallbackName)})`);
    }
    function getDisplayNameForFiber(fiber) {
        const { elementType, type, tag } = fiber;
        let resolvedType = type;
        if (typeof type === "object" && type !== null) {
            resolvedType = resolveFiberType(type);
        }
        let resolvedContext = null;
        
        switch (tag) {
            case ActivityComponent:
                return "Activity";
            case CacheComponent:
                return "Cache";
            case ClassComponent:
            case IncompleteClassComponent:
                return getDisplayName(resolvedType);
            case IncompleteFunctionComponent:
            case FunctionComponent:
            case IndeterminateComponent:
                return getDisplayName(resolvedType);
            case ForwardRef:
                return getWrappedDisplayName(elementType, resolvedType, "ForwardRef", "Anonymous");
            case HostRoot:
                const fiberRoot = fiber.stateNode;
                if (fiberRoot != null && fiberRoot._debugRootType !== null) {
                    return fiberRoot._debugRootType;
                }
                return null;
            case HostComponent:
            case HostSingleton:
            case HostHoistable:
                return type;
            case HostPortal:
            case HostText:
                return null;
            case Fragment:
                return "Fragment";
            case LazyComponent:
                // This display name will not be user visible.
                // Once a Lazy component loads its inner component, React replaces the tag and type.
                // This display name will only show up in console logs when DevTools DEBUG mode is on.
                return "Lazy";
            case MemoComponent:
            case SimpleMemoComponent:
                // Display name in React does not use `Memo` as a wrapper but fallback name.
                return getWrappedDisplayName(elementType, resolvedType, "Memo", "Anonymous");
            case SuspenseComponent:
                return "Suspense";
            case LegacyHiddenComponent:
                return "LegacyHidden";
            case OffscreenComponent:
                return "Offscreen";
            case ScopeComponent:
                return "Scope";
            case SuspenseListComponent:
                return "SuspenseList";
            case Profiler:
                return "Profiler";
            case TracingMarkerComponent:
                return "TracingMarker";
            case ViewTransitionComponent:
                return "ViewTransition";
            case Throw:
                // This should really never be visible.
                return "Error";
            default:
                const typeSymbol = getTypeSymbol(type);
                switch (typeSymbol) {
                    case CONCURRENT_MODE_NUMBER:
                    case CONCURRENT_MODE_SYMBOL_STRING:
                    case DEPRECATED_ASYNC_MODE_SYMBOL_STRING:
                        return null;
                    case PROVIDER_NUMBER:
                    case PROVIDER_SYMBOL_STRING:
                        // 16.3.0 exposed the context object as "context"
                        // PR #12501 changed it to "_context" for 16.3.1+
                        // NOTE Keep in sync with inspectElementRaw()
                        resolvedContext = fiber.type._context || fiber.type.context;
                        return `${resolvedContext.displayName || "Context"}.Provider`;
                    case CONTEXT_NUMBER:
                    case CONTEXT_SYMBOL_STRING:
                    case SERVER_CONTEXT_SYMBOL_STRING:
                        // 16.3-16.5 read from "type" because the Consumer is the actual context object.
                        // 16.6+ should read from "type._context" because Consumer can be different (in DEV).
                        // NOTE Keep in sync with inspectElementRaw()
                        resolvedContext = fiber.type._context || fiber.type;
                        // NOTE: TraceUpdatesBackendManager depends on the name ending in '.Consumer'
                        // If you change the name, figure out a more resilient way to detect it.
                        return `${resolvedContext.displayName || "Context"}.Consumer`;
                    case STRICT_MODE_NUMBER:
                    case STRICT_MODE_SYMBOL_STRING:
                        return null;
                    case PROFILER_NUMBER:
                    case PROFILER_SYMBOL_STRING:
                        return `Profiler(${fiber.memoizedProps.id})`;
                    case SCOPE_NUMBER:
                    case SCOPE_SYMBOL_STRING:
                        return "Scope";
                    default:
                        // Unknown element type.
                        // This may mean a new element type that has not yet been added to DevTools.
                        return null;
                }
        }
    }
    const emptyFn = () => { };
    const emptyMap = new Map();
    
    // 缓存和状态管理
    const nodeToClassListCache = new Map(); // DOM 节点到 classList 的映射
    const rootNodes = new Set(); // 存储所有的 React root 节点
    
    let isTraversing = false; // 防止重入
    
    // 主更新函数 - 支持多个 root
    window.updateDomName = function () {
        if (isTraversing || rootNodes.size === 0) return;
        
        console.time("update dom");
        isTraversing = true;
        
        try {
            // 清理过期的缓存
            cleanupStaleCache();
            
            // 遍历所有 React root 节点
            rootNodes.forEach(rootNode => {
                if (rootNode) {
                    console.log('🌲 Traversing root:', rootNode);
                    traverseFiberTree(rootNode);
                }
            });
            
            // 应用 className 更新
            applyClassNameUpdates();
            console.log('📊 Processed', rootNodes.size, 'root(s), updated', nodeToClassListCache.size, 'elements');
        } catch (error) {
            console.error("Error updating DOM names:", error);
        } finally {
            isTraversing = false;
            console.timeEnd("update dom");
        }
    };
    
    // 使用更合适的节流时间
    const trigger = throttle(window.updateDomName, 1000);
    
    // 为 Portal 和动态组件使用更快的触发器
    const portalTrigger = throttle(window.updateDomName, 300);
    
    // 清理过期缓存的函数
    function cleanupStaleCache() {
        for (const [node, classList] of nodeToClassListCache) {
            // 检查 DOM 节点是否仍然在文档中
            if (!document.contains(node)) {
                nodeToClassListCache.delete(node);
            }
        }
    }
    
    // 应用 className 更新
    function applyClassNameUpdates() {
        nodeToClassListCache.forEach((classList, node) => {
            if (node && node.classList && classList.length > 0) {
                // 只添加新的 className，避免重复
                const currentClasses = Array.from(node.classList);
                const newClasses = classList.filter(cls => !currentClasses.includes(cls));
                if (newClasses.length > 0) {
                    node.classList.add(...newClasses);
                }
            }
        });
    }

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
        onCommitFiberUnmount(_, root) {
            // 当根节点卸载时，从集合中移除
            if (root && root.current) {
                rootNodes.delete(root.current);
                console.log('🗑️ Removed root node, remaining roots:', rootNodes.size);
            }
        },
        onPostCommitFiberRoot(_, root) {
            console.log('🔄 React commit detected, root:', root);
            
            // 添加到 root 节点集合中
            if (root && root.current) {
                rootNodes.add(root.current);
                console.log('📌 Added root node, total roots:', rootNodes.size);
                
                // 检查是否是 Portal 根节点
                const containerInfo = root.containerInfo;
                if (containerInfo && containerInfo !== document.body && containerInfo !== document.documentElement) {
                    console.log('🌀 Portal root detected, container:', containerInfo);
                }
            }
            
            trigger();
        },
        setStrictMode: emptyFn,
        getInternalModuleRanges: emptyFn,
        registerInternalModuleStart: emptyFn,
        registerInternalModuleStop: emptyFn
    };
    // 组件名称匹配缓存
    const nameMatchCache = new Map();
    
    // 清理和标准化 CSS 类名
    function sanitizeClassName(name) {
        if (!name || typeof name !== 'string') return '';
        
        let cleaned = name
            // 移除方括号和其内容（如 [from Actor] -> Actor）
            .replace(/.*\[from\s(.*?)(\.react)?\].*/, '$1')
            // 如果没有 [from] 模式，就使用原名称
            .replace(/^\s+|\s+$/g, '') // 去除首尾空格
            // 替换空格和其他特殊字符为连字符
            .replace(/[\s\(\)\[\]\.\/\\]+/g, '-')
            // 移除其他非法字符，只保留字母、数字、连字符和下划线
            .replace(/[^\w\-]/g, '')
            // 移除连续的连字符
            .replace(/-+/g, '-')
            // 移除开头和结尾的连字符
            .replace(/^-+|-+$/g, '');
        
        // 确保类名以字母开头（CSS 规范）
        if (cleaned && /^\d/.test(cleaned)) {
            cleaned = 'component-' + cleaned;
        }
        
        return cleaned || 'component';
    }
    
    // 改进的 Fiber 树遍历函数 - 修复为类似原版逻辑
    function traverseFiberTree(node) {
        if (!node) return;
        
        try {
            // 处理当前节点（不管是否跳过）
            processNode(node);
        } catch (error) {
            console.warn("Error processing fiber node:", error, node);
        }
        
        // 递归遍历子节点和兄弟节点（与原版相同）
        if (node.child) {
            traverseFiberTree(node.child);
        }
        if (node.sibling) {
            traverseFiberTree(node.sibling);
        }
    }
    
    // 处理单个节点 - 恢复为原版逻辑
    function processNode(node) {
        // 特殊处理：Portal 节点
        if (node.tag === HostPortal) {
            console.log('🌀 Processing Portal node:', node);
            // Portal 节点本身不需要处理，但要确保遍历其子节点
            return;
        }
        
        const displayName = getDisplayNameForFiber(node);
        
        // 原版逻辑：检查名称长度和提取模块名
        if (displayName && displayName.length > 14) {
            let moduleName = "";
            if (nameMatchCache.has(displayName)) {
                moduleName = nameMatchCache.get(displayName);
            } else if (nameMatchCache.get(displayName) !== false) {
                const res = displayName.match(/\[from\s(.*?)(\.react)?\]/);
                if (res && res[1]) {
                    moduleName = res[1];
                    nameMatchCache.set(displayName, res[1]);
                } else {
                    nameMatchCache.set(displayName, false);
                }
            }
            
            if (moduleName) {
                const nodes = findHostNodesForFiber(node);
                
                if (nodes[0] && nodes[0].tagName) {
                    let classList = nodeToClassListCache.get(nodes[0]) || [];
                    
                    // 清理模块名称
                    const cleanModuleName = sanitizeClassName(moduleName);
                    
                    if (cleanModuleName && !classList.includes(cleanModuleName)) {
                        classList.push(cleanModuleName);
                        nodes[0].__props = nodes[0].__props || {};
                        nodes[0].__props[moduleName] = node.memoizedProps; // 保存原始名称作为 key

                        // 将 RelayFBMatchContainer 匹配到的类型添加到 class 上面
                        if (moduleName === "RelayFBMatchContainer" && 
                            node.memoizedProps?.match?.__typename) {
                            const typename = sanitizeClassName(node.memoizedProps.match.__typename);
                            if (typename && !classList.includes(typename)) {
                                classList.push(typename);
                            }
                        }

                        nodeToClassListCache.set(nodes[0], classList);
                        console.log('🏷️ Added className:', cleanModuleName, '(from:', moduleName, ') to', nodes[0].tagName);
                    }
                }
            }
        }
        
        // 新逻辑：也处理短名称（但不覆盖原有逻辑）
        else if (displayName && displayName.length > 3) {
            const nodes = findHostNodesForFiber(node);
            if (nodes[0] && nodes[0].tagName) {
                let classList = nodeToClassListCache.get(nodes[0]) || [];
                
                // 对于短名称，使用简化的清理逻辑
                const cleanDisplayName = displayName
                    .replace(/[\s\(\)\[\]\.\/\\]+/g, '-')
                    .replace(/[^\w\-]/g, '')
                    .replace(/-+/g, '-')
                    .replace(/^-+|-+$/g, '');
                
                if (cleanDisplayName && !classList.includes(cleanDisplayName)) {
                    classList.push(cleanDisplayName);
                    nodes[0].__props = nodes[0].__props || {};
                    nodes[0].__props[displayName] = node.memoizedProps; // 保存原始名称作为 key
                    nodeToClassListCache.set(nodes[0], classList);
                    console.log('🏷️ Added className:', cleanDisplayName, '(from:', displayName, ') to', nodes[0].tagName);
                }
            }
        }
    }
    
    // 改进的宿主节点查找函数
    function findHostNodesForFiber(fiber) {
        if (!fiber) return [];
        
        try {
            // 特殊情况：超时的 Suspense 组件
            const isTimedOutSuspense = fiber.tag === SuspenseComponent && fiber.memoizedState !== null;
            if (isTimedOutSuspense) {
                // 尝试找到 fallback 内容
                const maybeFallbackFiber = fiber.child && fiber.child.sibling;
                if (maybeFallbackFiber != null) {
                    fiber = maybeFallbackFiber;
                }
            }
            
            const hostFibers = findAllCurrentHostFibers(fiber);
            return hostFibers
                .map(hostFiber => {
                    // 支持不同类型的宿主节点
                    if (hostFiber.tag === HostComponent || 
                        hostFiber.tag === HostSingleton || 
                        hostFiber.tag === HostHoistable) {
                        return hostFiber.stateNode;
                    }
                    // HostText 节点返回其父 DOM 元素
                    if (hostFiber.tag === HostText && hostFiber.return) {
                        const parentHostFiber = findNearestHostFiber(hostFiber.return);
                        return parentHostFiber ? parentHostFiber.stateNode : null;
                    }
                    return null;
                })
                .filter(Boolean);
        } catch (err) {
            console.warn("Error finding host nodes for fiber:", err, fiber);
            return [];
        }
    }
    
    // 查找最近的宿主 Fiber
    function findNearestHostFiber(fiber) {
        while (fiber) {
            if (fiber.tag === HostComponent || 
                fiber.tag === HostSingleton || 
                fiber.tag === HostHoistable ||
                fiber.tag === HostRoot) {
                return fiber;
            }
            fiber = fiber.return;
        }
        return null;
    }
    // 改进的查找所有当前宿主 Fiber 函数
    function findAllCurrentHostFibers(fiber) {
        const fibers = [];
        if (!fiber) return fibers;
        
        // 深度优先搜索查找所有宿主组件
        let node = fiber;
        const stack = [node];
        const visited = new Set();
        
        while (stack.length > 0) {
            node = stack.pop();
            
            if (!node || visited.has(node)) continue;
            visited.add(node);
            
            // 检查是否是宿主组件类型
            if (isHostFiber(node)) {
                fibers.push(node);
                // 如果找到宿主组件，不需要继续向下搜索其子节点
                continue;
            }
            
            // 添加子节点到栈中（逆序添加以保持正确的遍历顺序）
            const children = [];
            let child = node.child;
            while (child) {
                children.push(child);
                child = child.sibling;
            }
            
            // 逆序添加，使得第一个子节点最后被处理
            for (let i = children.length - 1; i >= 0; i--) {
                stack.push(children[i]);
            }
        }
        
        return fibers;
    }
    
    // 检查是否为宿主 Fiber 类型
    function isHostFiber(fiber) {
        return fiber.tag === HostComponent || 
               fiber.tag === HostText || 
               fiber.tag === HostSingleton || 
               fiber.tag === HostHoistable;
    }
    
    
    // 添加调试和监控工具
    window.reactDevDisplayNameHelpers = {
        // 快速诊断函数
        diagnose() {
            console.log('🔧 Running diagnostics...');
            console.log('1. Hook installed:', !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
            console.log('2. Root nodes count:', rootNodes.size);
            console.log('3. Root nodes:', Array.from(rootNodes));
            console.log('4. Cache stats:', this.getCacheStats());
            console.log('5. Performance stats:', this.getPerformanceStats());
            
            if (rootNodes.size > 0) {
                console.log('6. Forcing update...');
                this.forceUpdate();
            } else {
                console.log('❌ No root nodes found - React may not have rendered yet');
            }
            
            return {
                hookInstalled: !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__,
                rootNodesCount: rootNodes.size,
                cacheStats: this.getCacheStats(),
                performanceStats: this.getPerformanceStats()
            };
        },
        // 获取缓存统计信息
        getCacheStats() {
            return {
                nodeCache: nodeToClassListCache.size,
                nameMatchCache: nameMatchCache.size
            };
        },
        
        // 清理所有缓存
        clearAllCaches() {
            nodeToClassListCache.clear();
            nameMatchCache.clear();
            console.log('All caches cleared');
        },
        
        // 手动触发更新
        forceUpdate() {
            window.updateDomName();
        },
        
        // 获取指定元素的 React 信息
        getReactInfo(element) {
            if (!element || !element.__props) {
                return null;
            }
            return element.__props;
        },
        
        // 查看所有被标记的元素
        getAllMarkedElements() {
            const elements = [];
            nodeToClassListCache.forEach((classList, node) => {
                elements.push({
                    element: node,
                    classList: classList,
                    tagName: node.tagName,
                    id: node.id,
                    className: node.className
                });
            });
            return elements;
        },
        
        // 测试类名清理函数
        testSanitizeClassName(name) {
            console.log('🧪 Testing className sanitization:');
            console.log('Input:', name);
            console.log('Output:', sanitizeClassName(name));
            return sanitizeClassName(name);
        },
        
        // 查看所有根节点
        getRootNodes() {
            return Array.from(rootNodes);
        },
        
        // 查看根节点的容器信息
        getRootContainers() {
            const containers = [];
            rootNodes.forEach(root => {
                // 尝试找到根节点的容器
                let current = root;
                while (current && current.return) {
                    current = current.return;
                }
                if (current && current.stateNode && current.stateNode.containerInfo) {
                    containers.push({
                        root: root,
                        container: current.stateNode.containerInfo,
                        isPortal: current.stateNode.containerInfo !== document.body && 
                                 current.stateNode.containerInfo !== document.documentElement
                    });
                }
            });
            return containers;
        },
        
        // 手动扫描新的根节点
        scanForNewRoots() {
            console.log('🔍 Manual scanning for new React roots...');
            scanForNewRoots();
        },
        
        // 启用/禁用自动扫描
        setAutoScan(enabled) {
            if (enabled) {
                if (!this._scanInterval) {
                    this._scanInterval = setInterval(scanForNewRoots, 5000);
                    console.log('✅ Auto scan enabled (5s interval)');
                }
            } else {
                if (this._scanInterval) {
                    clearInterval(this._scanInterval);
                    this._scanInterval = null;
                    console.log('❌ Auto scan disabled');
                }
            }
        }
    };
    
    // 添加性能监控
    let performanceStats = {
        lastUpdateTime: 0,
        updateCount: 0,
        averageUpdateTime: 0,
        maxUpdateTime: 0
    };
    
    // 重新包装 updateDomName 函数以添加性能监控
    const originalUpdateDomName = window.updateDomName;
    window.updateDomName = function() {
        const startTime = performance.now();
        
        try {
            originalUpdateDomName();
        } finally {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            performanceStats.lastUpdateTime = duration;
            performanceStats.updateCount++;
            performanceStats.averageUpdateTime = 
                (performanceStats.averageUpdateTime * (performanceStats.updateCount - 1) + duration) / 
                performanceStats.updateCount;
            performanceStats.maxUpdateTime = Math.max(performanceStats.maxUpdateTime, duration);
        }
    };
    
    // 将性能统计添加到调试工具中
    window.reactDevDisplayNameHelpers.getPerformanceStats = () => ({ ...performanceStats });
    
    // 监听 DOM 变化，检测新的 React Portal 容器
    const observer = new MutationObserver((mutations) => {
        let hasNewPortals = false;
        
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType !== Node.ELEMENT_NODE) return;
                
                // 检查是否是常见的 Portal 容器
                const isPortalContainer = 
                    // React 内部属性
                    node._reactInternalFiber ||
                    node.__reactInternalInstance ||
                    // 常见的 Portal 容器类名
                    node.classList?.contains('ant-message') ||
                    node.classList?.contains('ant-notification') ||
                    node.classList?.contains('ant-modal') ||
                    node.classList?.contains('ant-drawer') ||
                    node.classList?.contains('ant-popover') ||
                    node.classList?.contains('ant-tooltip') ||
                    // 其他可能的 Portal 标识
                    node.hasAttribute('data-reactroot') ||
                    node.querySelector?.('[data-reactroot]') ||
                    // 检查是否有 React Fiber 属性
                    Object.keys(node).some(key => key.startsWith('__reactInternalInstance') || key.startsWith('__reactFiber'));
                
                if (isPortalContainer) {
                    console.log('🌀 Detected Portal container:', node.className || node.tagName, node);
                    hasNewPortals = true;
                }
                
                // 也检查深层嵌套的 React 节点
                if (node.querySelector) {
                    const reactElements = node.querySelectorAll('*');
                    for (let el of reactElements) {
                        if (Object.keys(el).some(key => key.startsWith('__reactInternalInstance') || key.startsWith('__reactFiber'))) {
                            console.log('🔍 Found React element in new DOM:', el);
                            hasNewPortals = true;
                            break;
                        }
                    }
                }
            });
        });
        
        // 如果检测到新的 Portal，延迟触发更新
        if (hasNewPortals) {
            setTimeout(() => {
                console.log('🔄 Triggering update due to Portal detection');
                portalTrigger();
            }, 100);
        }
    });
    
    // 开始监听 body 的变化
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // 定期扫描新的 React 根节点（适用于动态创建的 Portal）
    const scanForNewRoots = () => {
        // 查找所有可能的 React 容器
        const allElements = document.querySelectorAll('*');
        let foundNewRoots = false;
        
        for (let element of allElements) {
            // 检查是否有 React Fiber 属性
            const fiberKey = Object.keys(element).find(key => 
                key.startsWith('__reactInternalInstance') || 
                key.startsWith('__reactFiber')
            );
            
            if (fiberKey) {
                const fiber = element[fiberKey];
                if (fiber && fiber.return === null && fiber.tag === HostRoot) {
                    // 这是一个根节点
                    if (!rootNodes.has(fiber)) {
                        rootNodes.add(fiber);
                        foundNewRoots = true;
                        console.log('🆕 Found new root via scanning:', element, fiber);
                    }
                }
            }
        }
        
        if (foundNewRoots) {
            console.log('📡 Scan found new roots, triggering update');
            portalTrigger();
        }
    };
    
    // 定期扫描（每 5 秒）
    const scanInterval = setInterval(scanForNewRoots, 5000);
    
    // 页面卸载时清理
    window.addEventListener('beforeunload', () => {
        observer.disconnect();
        clearInterval(scanInterval);
        rootNodes.clear();
        nodeToClassListCache.clear();
    });
    
    console.log('React DevTools Display Name Helper loaded successfully');
    console.log('🌀 Portal detection enabled');
    console.log('Use window.reactDevDisplayNameHelpers for debugging utilities');
})();


