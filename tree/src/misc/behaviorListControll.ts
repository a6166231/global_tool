/** 简单行为暂存器
 * 可以做撤回和恢复操作
 */
export class behaviorListControll<T = any> {
    private _behaviorList: T[] = []
    private _behaviorNowIndex: number = 0

    /** 保存行为数据 */
    put(data: T) {
        if (this._behaviorNowIndex != this._behaviorList.length - 1) {//如果当前的标记位向前移了 把之后的全部丢弃
            this._behaviorList.splice(this._behaviorNowIndex + 1)
        }
        this._behaviorList.push(data)
        this._behaviorNowIndex = this._behaviorList.length - 1
    }

    /** 下一步 */
    next() {
        if (this._behaviorNowIndex < this._behaviorList.length - 1) {
            this._behaviorNowIndex++
        }
        return this._behaviorList[this._behaviorNowIndex]
    }

    /** 上一步 */
    prev() {
        if (this._behaviorNowIndex > 0) {
            this._behaviorNowIndex--
        }
        return this._behaviorList[this._behaviorNowIndex]
    }

    clear() {
        this._behaviorList = []
    }
}