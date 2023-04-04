;(() => {
    if (window.__RELAY_DEVTOOLS_HOOK__) return

    window._relayEnv = null
    window.__RELAY_DEVTOOLS_HOOK__ = {
        registerEnvironment(a) {
            window._relayEnv = a
        }
    }

    window.relayStoreFinder = (id, path, args) => {
        //  源代码请看 relay-runtime/store/RelayPublishQueue $13 的定义
        const c = window.require("relay-runtime/store/RelayRecordSource").create()
        const d = new (window.require(
            "relay-runtime/mutations/RelayRecordSourceMutator"
        ))(window._relayEnv.getStore().getSource(), c)
        const e = new (window.require(
            "relay-runtime/mutations/RelayRecordSourceProxy"
        ))(d, window.require("relay-runtime/store/defaultGetDataID"), null, [])
        const store = e

        const recordProxy = typeof id === "string" ? store.get(id) : id
        if (recordProxy === undefined) return recordProxy

        //
        //  解析 ^node.^^actors[0].^profile_picture{$1}.uri
        // translate array case to dot case, then split witth .
        // a[0].b -> a.0.b -> ['a', '0', 'b']

        //  由于会存在 aaa.bbb(scale:1.5).ccc 这种情况，需要将 ( 里面的 . ) 替换下
        let keyList = encodeDot(path.replace(/\[(\d+)\]/g, ".$1")).split(".")
        keyList = keyList.map((str) => decodeDot(str))

        //  [
        //     "^node",
        //     "^^actors",
        //     "0",
        //     "^profile_picture{$1}",
        //     "uri"
        // ]
        let _ = recordProxy
        for (let i = 0; i < keyList.length; i++) {
            const script = keyList[i]

            if (script === "*") {
                return _
            }

            //  调用 getLinkedRecords
            if (script.indexOf("^^") === 0) {
                const [name, params] = getParseScript(script.substring(2))
                _ = _.getLinkedRecords(name, params)
                if (_ === undefined) {
                    logUndefined(script)
                    return _
                }
            }

            //  调用 getLinkedRecord
            else if (script.indexOf("^") === 0) {
                const [name, params] = getParseScript(script.substring(1))
                _ = _.getLinkedRecord(name, params)
                if (_ === undefined || _ === null) {
                    logUndefined(script)
                    return _
                }
            }

            //  [0]
            else if (script.match(/^\d+$/)) {
                _ = _[parseInt(script)]
                if (_ === undefined || _ === null) {
                    logUndefined(script)
                    return _
                }
            }

            //  getValue
            else {
                const [name, params] = getParseScript(script)
                _ = _.getValue(name, params)
                if (_ === undefined || _ === null) {
                    logUndefined(script)
                    return _
                }
            }
        }

        return _

        //  将 profile_picture{$1}
        //  转换为 [profile_picture, args[$1]]
        function getParseScript(script) {
            const [name, paramsName] = script.split("{")

            if (!paramsName) {
                return [name, {}]
            }

            if (!args) {
                throw new Error("args undefined")
            }

            return [name, args[paramsName.substring(0, paramsName.length - 1)] || {}]
        }

        function encodeDot(str) {
            return str.replace(/\((.*?)\.(.*?)\)/g, "($1@_@_@_@_@$2)")
        }

        function decodeDot(str) {
            return str.replaceAll("@_@_@_@_@", ".")
        }

        function logUndefined(script) {
            console.warn("undefined value", {
                id: id,
                path: path,
                args: args,
                currentPath: script
            })
        }
    }
})()
