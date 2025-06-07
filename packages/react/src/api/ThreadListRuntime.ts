import { LazyMemoizeSubject } from "./subscribable/LazyMemoizeSubject";
import { ThreadListRuntimeCore } from "../runtimes/core/ThreadListRuntimeCore";
import { Unsubscribe } from "../types";
import {
  ThreadListItemRuntime,
  ThreadListItemRuntimeImpl,
  ThreadListItemState,
} from "./ThreadListItemRuntime";
import { SKIP_UPDATE } from "./subscribable/SKIP_UPDATE";
import { ShallowMemoizeSubject } from "./subscribable/ShallowMemoizeSubject";
import {
  ThreadListItemRuntimeBinding,
  ThreadRuntime,
  ThreadRuntimeCoreBinding,
  ThreadRuntimeImpl,
} from "./ThreadRuntime";
import { NestedSubscriptionSubject } from "./subscribable/NestedSubscriptionSubject";

export type ThreadListState = {
  readonly mainThreadId: string;
  readonly newThread: string | undefined;
  readonly threads: readonly string[];
  readonly archivedThreads: readonly string[];
  readonly isLoading: boolean;
};

export type ThreadListRuntime = {
  getState(): ThreadListState;

  subscribe(callback: () => void): Unsubscribe;

  readonly main: ThreadRuntime;
  getById(threadId: string): ThreadRuntime;

  readonly mainItem: ThreadListItemRuntime;
  getItemById(threadId: string): ThreadListItemRuntime;
  getItemByIndex(idx: number): ThreadListItemRuntime;
  getArchivedItemByIndex(idx: number): ThreadListItemRuntime;

  switchToThread(threadId: string): Promise<void>;
  switchToNewThread(): Promise<void>;
};

const getThreadListItemState = (
  threadList: ThreadListRuntimeCore,
  threadId: string | undefined,
): ThreadListItemState | SKIP_UPDATE => {
  if (threadId === undefined) return SKIP_UPDATE;

  const threadData = threadList.getItemById(threadId);
  if (!threadData) return SKIP_UPDATE;
  return {
    id: threadData.threadId,
    threadId: threadData.threadId, // TODO remove in 0.8.0
    remoteId: threadData.remoteId,
    externalId: threadData.externalId,
    title: threadData.title,
    status: threadData.status,
    isMain: threadData.threadId === threadList.mainThreadId,
  };
};

export type ThreadListRuntimeCoreBinding = ThreadListRuntimeCore;

export class ThreadListRuntimeImpl implements ThreadListRuntime {
  private _isLoading: boolean = false;
  private _currentLoadPromise: Promise<void> | undefined;
  private _getState;
  constructor(
    private _core: ThreadListRuntimeCoreBinding,
    private _runtimeFactory: new (
      binding: ThreadRuntimeCoreBinding,
      threadListItemBinding: ThreadListItemRuntimeBinding,
    ) => ThreadRuntime = ThreadRuntimeImpl,
  ) {
    const stateBinding = new LazyMemoizeSubject({
      path: {},
      getState: () => ({
        mainThreadId: _core.mainThreadId,
        newThread: _core.newThreadId,
        threads: _core.threadIds,
        archivedThreads: _core.archivedThreadIds,
        isLoading: this._isLoading,
      }),
      subscribe: (callback) => _core.subscribe(callback),
    });

    this._getState = stateBinding.getState.bind(stateBinding);

    this._mainThreadListItemRuntime = new ThreadListItemRuntimeImpl(
      new ShallowMemoizeSubject({
        path: {
          ref: `threadItems[main]`,
          threadSelector: { type: "main" },
        },
        getState: () => {
          return getThreadListItemState(this._core, this._core.mainThreadId);
        },
        subscribe: (callback) => this._core.subscribe(callback),
      }),
      this._core,
    );

    this.main = new _runtimeFactory(
      new NestedSubscriptionSubject({
        path: {
          ref: "threads.main",
          threadSelector: { type: "main" },
        },
        getState: () => _core.getMainThreadRuntimeCore(),
        subscribe: (callback) => _core.subscribe(callback),
      }),
      this._mainThreadListItemRuntime, // TODO capture "main" threadListItem from context around useLocalRuntime / useExternalStoreRuntime
    );
  }

  protected __internal_bindMethods() {
    this.switchToThread = this.switchToThread.bind(this);
    this.switchToNewThread = this.switchToNewThread.bind(this);
    this.getState = this.getState.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.getById = this.getById.bind(this);
    this.getItemById = this.getItemById.bind(this);
    this.getItemByIndex = this.getItemByIndex.bind(this);
    this.getArchivedItemByIndex = this.getArchivedItemByIndex.bind(this);
  }

  public triggerLoadThreads(): Promise<void> {
    if (this._isLoading && this._currentLoadPromise) {
      return this._currentLoadPromise;
    }

    this._isLoading = true;
    // TODO: Notify subscribers about isLoading change (important for reactivity)
    // This might require changing how stateBinding is updated, e.g., by adding a dedicated notifier
    // or ensuring _core.subscribe() is triggered appropriately.
    // For now, getState() will reflect the change when called.

    this._currentLoadPromise = this._core.getLoadThreadsPromise().finally(() => {
      this._isLoading = false;
      this._currentLoadPromise = undefined;
      // TODO: Notify subscribers about isLoading change (important for reactivity)
    });

    return this._currentLoadPromise;
  }

  public switchToThread(threadId: string): Promise<void> {
    return this._core.switchToThread(threadId);
  }

  public switchToNewThread(): Promise<void> {
    return this._core.switchToNewThread();
  }

  public getState(): ThreadListState {
    return this._getState();
  }

  public subscribe(callback: () => void): Unsubscribe {
    return this._core.subscribe(callback);
  }

  private _mainThreadListItemRuntime;

  public readonly main: ThreadRuntime;

  public get mainItem() {
    return this._mainThreadListItemRuntime;
  }

  public getById(threadId: string) {
    return new this._runtimeFactory(
      new NestedSubscriptionSubject({
        path: {
          ref: "threads[threadId=" + JSON.stringify(threadId) + "]",
          threadSelector: { type: "threadId", threadId },
        },
        getState: () => this._core.getThreadRuntimeCore(threadId),
        subscribe: (callback) => this._core.subscribe(callback),
      }),
      this.mainItem, // TODO capture "main" threadListItem from context around useLocalRuntime / useExternalStoreRuntime
    );
  }

  public getItemByIndex(idx: number) {
    return new ThreadListItemRuntimeImpl(
      new ShallowMemoizeSubject({
        path: {
          ref: `threadItems[${idx}]`,
          threadSelector: { type: "index", index: idx },
        },
        getState: () => {
          return getThreadListItemState(this._core, this._core.threadIds[idx]);
        },
        subscribe: (callback) => this._core.subscribe(callback),
      }),
      this._core,
    );
  }

  public getArchivedItemByIndex(idx: number) {
    return new ThreadListItemRuntimeImpl(
      new ShallowMemoizeSubject({
        path: {
          ref: `archivedThreadItems[${idx}]`,
          threadSelector: { type: "archiveIndex", index: idx },
        },
        getState: () => {
          return getThreadListItemState(
            this._core,
            this._core.archivedThreadIds[idx],
          );
        },
        subscribe: (callback) => this._core.subscribe(callback),
      }),
      this._core,
    );
  }

  public getItemById(threadId: string) {
    return new ThreadListItemRuntimeImpl(
      new ShallowMemoizeSubject({
        path: {
          ref: `threadItems[threadId=${threadId}]`,
          threadSelector: { type: "threadId", threadId },
        },
        getState: () => {
          return getThreadListItemState(this._core, threadId);
        },
        subscribe: (callback) => this._core.subscribe(callback),
      }),
      this._core,
    );
  }
}
