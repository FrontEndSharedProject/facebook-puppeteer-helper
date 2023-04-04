import { throttle } from 'lodash-es';
(() => {
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__)
        return;
    const ReactTypeOfWork = {
        CacheComponent: 24,
        ClassComponent: 1,
        ContextConsumer: 9,
        ContextProvider: 10,
        CoroutineComponent: -1,
        CoroutineHandlerPhase: -1,
        DehydratedSuspenseComponent: 18,
        ForwardRef: 11,
        Fragment: 7,
        FunctionComponent: 0,
        HostComponent: 5,
        HostPortal: 4,
        HostRoot: 3,
        HostHoistable: 26,
        HostSingleton: 27,
        HostText: 6,
        IncompleteClassComponent: 17,
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
        // want to fork again so we're adding it here instead
        YieldComponent: -1 // Removed
    };
    const { CacheComponent, ClassComponent, IncompleteClassComponent, FunctionComponent, IndeterminateComponent, ForwardRef, HostRoot, HostHoistable, HostSingleton, HostComponent, HostPortal, HostText, Fragment, LazyComponent, LegacyHiddenComponent, MemoComponent, OffscreenComponent, Profiler, ScopeComponent, SimpleMemoComponent, SuspenseComponent, SuspenseListComponent, TracingMarkerComponent } = ReactTypeOfWork;
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
            case CacheComponent:
                return "Cache";
            case ClassComponent:
            case IncompleteClassComponent:
                return getDisplayName(resolvedType);
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
    const renderers = new Map();
    const cache = new Map();
    let rootNode = null;
    window.updateDomName = function () {
        console.time("udpate dom");
        traverse(rootNode);
        cache.forEach((classList, node) => {
            node.classList.add(...classList);
        });
        console.timeEnd("udpate dom");
    };
    const trigger = throttle(window.updateDomName, 2000);

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
        onPostCommitFiberRoot(_, root) {
            rootNode = root.current;
            trigger();
        },
        setStrictMode: emptyFn,
        getInternalModuleRanges: emptyFn,
        registerInternalModuleStart: emptyFn,
        registerInternalModuleStop: emptyFn
    };
    let nameMatchRes = {};
    function traverse(node) {
        const name = getDisplayNameForFiber(node);
        if (name && name.length > 14) {
            let moduleName = "";
            if (nameMatchRes[name]) {
                moduleName = nameMatchRes[name];
            }
            else if (nameMatchRes[name] !== false) {
                const res = name.match(/\[from\s(.*?)(?<!Provider|Context)\.react\]/);
                if (res && res[1]) {
                    moduleName = res[1];
                    nameMatchRes[name] = res ? res[1] : false;
                }
            }
            if (moduleName) {
                const nodes = findNativeNodesForFiberID(node);
                if (nodes[0] && nodes[0].tagName) {
                    let classList = [];
                    if (cache.has(nodes[0])) {
                        classList = cache.get(nodes[0]);
                    }
                    if (!classList.includes(moduleName)) {
                        classList.push(moduleName);
                        cache.set(nodes[0], classList);
                        nodes[0][`__props`] = nodes[0][`__props`] || {};
                        nodes[0][`__props`][moduleName] = node.memoizedProps;
                    }
                }
            }
        }
        if (node.child) {
            traverse(node.child);
        }
        node.sibling && traverse(node.sibling);
    }
    function findNativeNodesForFiberID(fiber) {
        try {
            // Special case for a timed-out Suspense.
            const isTimedOutSuspense = fiber.tag === SuspenseComponent && fiber.memoizedState !== null;
            if (isTimedOutSuspense) {
                // A timed-out Suspense's findDOMNode is useless.
                // Try our best to find the fallback directly.
                const maybeFallbackFiber = fiber.child && fiber.child.sibling;
                if (maybeFallbackFiber != null) {
                    fiber = maybeFallbackFiber;
                }
            }
            const hostFibers = findAllCurrentHostFibers(fiber);
            return hostFibers.map((hostFiber) => hostFiber.stateNode).filter(Boolean);
        }
        catch (err) {
            // The fiber might have unmounted by now.
            return null;
        }
    }
    function findAllCurrentHostFibers(fiber) {
        const fibers = [];
        // Next we'll drill down this component to find all HostComponent/Text.
        let node = fiber;
        while (true) {
            if (fibers.map((hostFiber) => hostFiber.stateNode).filter(Boolean).length >
                0) {
                return fibers;
            }
            if (node.tag === HostComponent || node.tag === HostText) {
                fibers.push(node);
            }
            else if (node.child) {
                node.child.return = node;
                node = node.child;
                continue;
            }
            if (node === fiber) {
                return fibers;
            }
            while (!node.sibling) {
                if (!node.return || node.return === fiber) {
                    return fibers;
                }
                node = node.return;
            }
            node.sibling.return = node.return;
            node = node.sibling;
        }
        // Flow needs the return here, but ESLint complains about it.
        // eslint-disable-next-line no-unreachable
        return fibers;
    }
})();
